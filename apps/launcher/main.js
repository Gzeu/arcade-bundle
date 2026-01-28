const frame = document.getElementById('frame');

const setGame = (id) => {
  // iframe src relative la launcher
  frame.src = `../../games/${id}/index.html`;
};

document.querySelectorAll('[data-game]').forEach((btn) => {
  btn.addEventListener('click', () => setGame(btn.dataset.game));
});
