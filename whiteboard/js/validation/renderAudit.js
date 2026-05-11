import { ENTITY_RULES } from '../layout/entityRules.js?v=engine-22';

const AUDIT_PADDING = 2;

export function createRenderAudit({ steps, onFail = showAuditFailure } = {}) {
  function auditCurrentStep() {
    const visibleBoxes = collectVisibleBoxes();
    const errors = [
      ...findBoxOverlaps(visibleBoxes),
      ...findHeaderIntrusions(),
      ...findTextClipping(),
      ...findVisibleWireWithoutEndpoints(),
      ...findFlowLabelOverlaps(visibleBoxes),
      ...findLabelAttachmentProblems()
    ];

    if (errors.length) onFail(errors);
    else clearAuditFailure();
    return errors;
  }

  function auditAllSteps(controller) {
    const failures = [];
    controller.reset();
    steps.forEach((step, index) => {
      controller.goTo(index);
      const errors = auditCurrentStep();
      if (errors.length) failures.push({ step: step.label, errors });
    });
    controller.reset();
    if (failures.length) {
      const flattened = failures.flatMap(failure => failure.errors.map(error => `${failure.step}: ${error}`));
      onFail(flattened);
    }
    return failures;
  }

  return { auditCurrentStep, auditAllSteps };
}

function findLabelAttachmentProblems() {
  return [...document.querySelectorAll('.flow-label.visible')]
    .filter(label => {
      const link = label.dataset.linkSource;
      const rect = normalizedRect(label);
      const scale = boardScale();
      const center = { x: (rect.x + rect.w / 2) / scale, y: (rect.y + rect.h / 2) / scale };
      const paths = [...document.querySelectorAll(`.flow.visible[data-link-source="${link}"]`)];
      const nearest = Math.min(...paths.map(path => distanceToPath(center, path)).filter(Number.isFinite));
      const allowed = ENTITY_RULES.labelDistance;
      return nearest > allowed;
    })
    .map(label => `${nameOf(label)} is too far from its route`);
}

function distanceToPath(point, path) {
  const d = path.getAttribute('d') || '';
  const points = d.match(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)?.map(token => {
    const [, x, y] = token.match(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/);
    return { x: Number(x), y: Number(y) };
  }) || [];
  if (points.length < 2) return Infinity;
  return Math.min(...points.slice(1).map((end, index) => distanceToSegment(point, points[index], end)));
}

function distanceToSegment(point, a, b) {
  if (a.x === b.x) {
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    const y = Math.min(Math.max(point.y, minY), maxY);
    return Math.hypot(point.x - a.x, point.y - y);
  }
  if (a.y === b.y) {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const x = Math.min(Math.max(point.x, minX), maxX);
    return Math.hypot(point.x - x, point.y - a.y);
  }
  return Infinity;
}

function findHeaderIntrusions() {
  const errors = [];
  const globalHeaderBlockers = [...document.querySelectorAll('.flow-label.visible')];
  document.querySelectorAll('.enclave.visible').forEach(enclave => {
    const header = normalizedHeaderRect(enclave);
    const labelHeader = normalizedHeaderRect(enclave, 50);
    const group = enclave.dataset.group;
    document.querySelectorAll(`.node.visible[data-group="${group}"],.annotation.visible[data-group="${group}"]`).forEach(node => {
      if (overlaps(header, normalizedRect(node))) {
        errors.push(`${nameOf(node)} intrudes into ${group} header band`);
      }
    });
    globalHeaderBlockers.forEach(label => {
      if (overlaps(labelHeader, normalizedRect(label))) {
        errors.push(`${nameOf(label)} intrudes into ${group} header band`);
      }
    });
  });
  return errors;
}

function normalizedHeaderRect(enclave, headerHeight = 56) {
  const rect = normalizedRect(enclave);
  const designHeight = parseFloat(enclave.style.height) || rect.h;
  const scale = rect.h / designHeight;
  return { x: rect.x, y: rect.y, w: rect.w, h: headerHeight * scale };
}

function collectVisibleBoxes() {
  return [...document.querySelectorAll('.node.visible,.annotation.visible,.legend.visible,.flow-label.visible')]
    .map(element => ({ element, rect: normalizedRect(element), id: element.dataset.nodeId || element.textContent.trim().slice(0, 36) }))
    .filter(item => item.rect.w > 0 && item.rect.h > 0);
}

function normalizedRect(element) {
  const diagram = document.getElementById('diagram').getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - diagram.left,
    y: rect.top - diagram.top,
    w: rect.width,
    h: rect.height
  };
}

function boardScale() {
  const diagram = document.getElementById('diagram');
  const rendered = diagram.getBoundingClientRect();
  const designWidth = parseFloat(getComputedStyle(diagram).width) || rendered.width || 1;
  return rendered.width / designWidth || 1;
}

function findBoxOverlaps(items) {
  const errors = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (items[i].element.classList.contains('flow-label') && items[j].element.classList.contains('flow-label')) continue;
      if (overlaps(inflate(items[i].rect, AUDIT_PADDING), inflate(items[j].rect, AUDIT_PADDING))) {
        errors.push(`visible boxes overlap: ${nameOf(items[i].element)} and ${nameOf(items[j].element)}`);
      }
    }
  }
  return errors;
}

function findTextClipping() {
  return [...document.querySelectorAll('.visible .label,.visible .sub,.visible h3,.visible p,.flow-label.visible,.legend.visible span')]
    .filter(element => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
    .map(element => `text clips in ${nameOf(element)}`);
}

function findVisibleWireWithoutEndpoints() {
  return [...document.querySelectorAll('.flow.visible')]
    .filter(path => {
      const link = path.id.replace('flow-', '');
      const source = document.querySelector(`[data-link-source="${link}"]`);
      return source && source.dataset.invalid === 'true';
    })
    .map(path => `wire ${path.id} is visible without endpoints`);
}

function findFlowLabelOverlaps(visibleBoxes) {
  const labels = visibleBoxes.filter(item => item.element.classList.contains('flow-label'));
  const blockers = visibleBoxes.filter(item => !item.element.classList.contains('flow-label'));
  const errors = [];
  labels.forEach(label => {
    blockers.forEach(blocker => {
      if (overlaps(inflate(label.rect, 2), inflate(blocker.rect, 3))) {
        errors.push(`flow label overlaps ${nameOf(blocker.element)}`);
      }
    });
  });
  return errors;
}

function showAuditFailure(errors) {
  let overlay = document.getElementById('qa-failure-overlay');
  if (!overlay) {
    overlay = document.createElement('aside');
    overlay.id = 'qa-failure-overlay';
    overlay.className = 'qa-failure-overlay';
    document.body.append(overlay);
  }
  overlay.textContent = `Whiteboard QA failed: ${errors.slice(0, 5).join(' | ')}`;
  console.error('Whiteboard QA failed', errors);
}

function clearAuditFailure() {
  document.getElementById('qa-failure-overlay')?.remove();
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inflate(rect, pad) {
  return { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 };
}

function nameOf(element) {
  return element.dataset.nodeId || element.dataset.group || element.textContent.trim().replace(/\s+/g, ' ').slice(0, 48) || element.className;
}
