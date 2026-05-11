export function bindBoardScale(board) {
  applyBoardScale(board);
}

export function applyBoardScale(board) {
  const frame = document.getElementById('diagram-frame');
  const stage = frame.parentElement;
  const maxScale = board.maxScale || 1;
  const availableWidth = Math.max(1, stage.clientWidth - 16);
  const availableHeight = Math.max(1, stage.clientHeight - 16);
  const scale = Math.min(maxScale, availableWidth / board.width, availableHeight / board.height);
  frame.style.setProperty('--board-scale', scale.toFixed(4));
  frame.style.setProperty('--board-width', `${board.width}px`);
  frame.style.setProperty('--board-height', `${board.height}px`);
  frame.classList.toggle('scroll-required', scale < (board.minScale || 0.52));
}
