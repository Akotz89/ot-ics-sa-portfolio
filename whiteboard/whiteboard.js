import { ANNOTATIONS, BOARD, ENCLAVES, LINKS, NODES, STEPS } from './js/topology.js?v=wide-fill-1';
import { createController } from './js/controller.js?v=wide-fill-1';
import { computeLayout } from './js/layout/computeLayout.js?v=wide-fill-1';
import { renderWhiteboard } from './js/renderer.js?v=wide-fill-1';
import { bindBoardScale } from './js/scaler.js?v=wide-fill-1';
import { validateModel } from './js/validation.js?v=wide-fill-1';
import { createRenderAudit } from './js/validation/renderAudit.js?v=wide-fill-1';

document.addEventListener('DOMContentLoaded', () => {
  const stage = document.querySelector('.wb-stage');
  const layout = computeLayout({
    board: BOARD,
    enclaves: ENCLAVES,
    nodes: NODES,
    annotations: ANNOTATIONS,
    stage
  });
  validateModel({ layout, links: LINKS, steps: STEPS });
  bindBoardScale(layout.board);
  renderWhiteboard({ layout, links: LINKS });

  const controller = createController(STEPS);
  const audit = createRenderAudit({ steps: STEPS });
  controller.onChange(() => requestAnimationFrame(audit.auditCurrentStep));
  controller.bind();
});
