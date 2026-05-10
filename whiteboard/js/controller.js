import { byId } from './dom.js';

export function createController(steps) {
  let currentStep = -1;
  const listeners = new Set();

  const nextButton = byId('btn-next');
  const prevButton = byId('btn-prev');
  const resetButton = byId('btn-reset');
  const narration = document.querySelector('.narration p');
  const indicator = document.querySelector('.step-indicator');

  function next() {
    if (currentStep >= steps.length - 1) return;
    currentStep += 1;
    apply();
  }

  function previous() {
    if (currentStep <= 0) return;
    currentStep -= 1;
    apply();
  }

  function reset() {
    currentStep = -1;
    setVisibleGroups(new Set(), new Set());
    narration.innerHTML = 'Press <strong>Next</strong> or <strong>spacebar</strong> to begin the customer whiteboard walkthrough.';
    updateControls();
    notify();
  }

  function apply() {
    const step = steps[currentStep];
    setVisibleGroups(new Set(step.groups), new Set(step.links), new Set(step.focus || []));
    narration.innerHTML = step.narration;
    updateControls();
    notify();
  }

  function goTo(index) {
    currentStep = index;
    apply();
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify() {
    listeners.forEach(listener => listener(currentStep));
  }

  function setVisibleGroups(nodeGroups, linkGroups, focusGroups = new Set()) {
    document.getElementById('diagram')?.classList.toggle('has-focus', focusGroups.size > 0);
    document.querySelectorAll('[data-group]').forEach(element => {
      const isVisible = nodeGroups.has(element.dataset.group);
      element.classList.toggle('visible', isVisible);
      element.classList.toggle('dimmed', isVisible && focusGroups.size > 0 && !focusGroups.has(element.dataset.group));
      element.classList.toggle('focused', isVisible && focusGroups.has(element.dataset.group));
    });
    document.querySelectorAll('[data-link-group]').forEach(element => {
      const isVisible = linkGroups.has(element.dataset.linkGroup);
      element.classList.toggle('visible', isVisible);
      element.classList.toggle('dimmed', isVisible && focusGroups.size > 0 && !focusGroups.has(element.dataset.linkGroup));
      element.classList.toggle('focused', isVisible && focusGroups.has(element.dataset.linkGroup));
    });
  }

  function updateControls() {
    indicator.textContent = currentStep < 0 ? 'Ready' : `${steps[currentStep].label} ${currentStep + 1}/${steps.length}`;
    prevButton.disabled = currentStep <= 0;
    nextButton.disabled = currentStep >= steps.length - 1;
  }

  function bind() {
    nextButton.addEventListener('click', next);
    prevButton.addEventListener('click', previous);
    resetButton.addEventListener('click', reset);
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        next();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        previous();
      }
      if (event.key.toLowerCase() === 'r') reset();
    });
    reset();
  }

  return { bind, next, previous, reset, goTo, onChange };
}
