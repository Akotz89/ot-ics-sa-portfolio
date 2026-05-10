export function bindBoardScale(board) {
  const frame = document.getElementById('diagram-frame');
  const stage = frame.parentElement;
  const resizeObserver = new ResizeObserver(updateScale);

  function updateScale() {
    const minScale = board.minScale || 0.62;
    const maxScale = board.maxScale || 1;
    const scale = Math.min(maxScale, stage.clientWidth / board.width);
    const resolved = Math.max(minScale, scale);
    frame.style.setProperty('--board-scale', resolved.toFixed(4));
    frame.style.setProperty('--board-width', `${board.width}px`);
    frame.style.setProperty('--board-height', `${board.height}px`);
    frame.classList.toggle('scroll-required', scale < minScale);
  }

  resizeObserver.observe(stage);
  window.addEventListener('resize', updateScale);
  updateScale();
}
