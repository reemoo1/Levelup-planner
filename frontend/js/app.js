function getLevel(xp) { return Math.floor(xp / 100) + 1; }
function getXpInLevel(xp) { return xp % 100; }

function updateXPDisplay(xp) {
  const level = getLevel(xp);
  const progress = getXpInLevel(xp);
  const levelEl = document.getElementById('level-num');
  const xpEl = document.getElementById('xp-current');
  const barEl = document.getElementById('xp-bar');
  if (levelEl) levelEl.textContent = level;
  if (xpEl) xpEl.textContent = progress;
  if (barEl) barEl.style.width = progress + '%';
}