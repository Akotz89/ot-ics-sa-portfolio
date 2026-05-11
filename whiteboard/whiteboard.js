import { ANNOTATIONS, BOARD, DATA_FLOWS, ENCLAVES, LINKS, NODES, STEPS } from './js/topology.js?v=engine-22';
import { createController } from './js/controller.js?v=engine-22';
import { bindFlowTriggers } from './js/interaction/flowTriggers.js?v=engine-22';
import { computeLayout } from './js/layout/computeLayout.js?v=engine-22';
import { renderWhiteboard } from './js/renderer.js?v=engine-22';
import { applyBoardScale } from './js/scaler.js?v=engine-22';
import { validateModel } from './js/validation.js?v=engine-22';
import { createRenderAudit } from './js/validation/renderAudit.js?v=engine-22';
import { buildConnectionGraph, validateConnectionGraph } from './js/logic/connectionGraph.js?v=engine-22';

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.wb-stage');
  const controller = createController(STEPS);
  const audit = createRenderAudit({ steps: STEPS });
  let resizeTimer;
  let activeBoard = BOARD;

  function solveAndRender() {
    try {
      const layout = computeLayout({
        board: BOARD,
        enclaves: ENCLAVES,
        nodes: NODES,
        annotations: ANNOTATIONS,
        links: LINKS,
        steps: STEPS,
        stage
      });
      validateModel({ layout, links: LINKS, flows: DATA_FLOWS, steps: STEPS });
      validateConnectionGraph(buildConnectionGraph({ nodes: layout.nodes, links: LINKS, flows: DATA_FLOWS }));
      activeBoard = layout.board;
      applyBoardScale(layout.board);
      renderWhiteboard({ layout, links: LINKS, flows: DATA_FLOWS });
      bindFlowTriggers({ links: LINKS });
      controller.refresh({ silent: true });
      requestAnimationFrame(() => {
        applyBoardScale(activeBoard);
        audit.auditCurrentStep();
      });
    } catch (error) {
      showLayoutFailure(error);
      console.error(error);
    }
  }

  controller.onChange(() => {
    requestAnimationFrame(() => {
      applyBoardScale(activeBoard);
      audit.auditCurrentStep();
    });
  });
  new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(solveAndRender, 80);
  }).observe(stage);
  solveAndRender();
  controller.bind();
});

function showLayoutFailure(error) {
  let overlay = document.getElementById('qa-failure-overlay');
  if (!overlay) {
    overlay = document.createElement('aside');
    overlay.id = 'qa-failure-overlay';
    overlay.className = 'qa-failure-overlay';
    document.body.append(overlay);
  }
  overlay.textContent = `Whiteboard layout failed: ${error.message}`;
}
