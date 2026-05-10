const AUDIT_PADDING = 4;

export function createRenderAudit({ steps, onFail = showAuditFailure } = {}) {
  function auditCurrentStep() {
    const visibleBoxes = collectVisibleBoxes();
    const errors = [
      ...findBoxOverlaps(visibleBoxes),
      ...findHeaderIntrusions(),
      ...findTextClipping(),
      ...findVisibleWireWithoutEndpoints(),
      ...findFlowLabelOverlaps(visibleBoxes)
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

function findHeaderIntrusions() {
  const errors = [];
  const globalHeaderBlockers = [...document.querySelectorAll('.flow-label.visible')];
  document.querySelectorAll('.enclave.visible').forEach(enclave => {
    const header = normalizedHeaderRect(enclave);
    const group = enclave.dataset.group;
    document.querySelectorAll(`.node.visible[data-group="${group}"],.annotation.visible[data-group="${group}"]`).forEach(node => {
      if (overlaps(header, normalizedRect(node))) {
        errors.push(`${nameOf(node)} intrudes into ${group} header band`);
      }
    });
    globalHeaderBlockers.forEach(label => {
      if (overlaps(header, normalizedRect(label))) {
        errors.push(`${nameOf(label)} intrudes into ${group} header band`);
      }
    });
  });
  return errors;
}

function normalizedHeaderRect(enclave) {
  const rect = normalizedRect(enclave);
  const designHeight = parseFloat(enclave.style.height) || rect.h;
  const scale = rect.h / designHeight;
  return { x: rect.x, y: rect.y, w: rect.w, h: 56 * scale };
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
