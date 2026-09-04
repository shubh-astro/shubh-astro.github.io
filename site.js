/* Shared page furniture: the sketch objects drifting down the margins and the
   comet that trails the pointer. Both pages load this; nothing else uses it. */
(function () {
  const sky = document.getElementById('sky');
  if (!sky) return;

  /* The four decoration symbols live here rather than in each page's sprite
     sheet — they are used by this file alone. */
  document.body.insertAdjacentHTML('afterbegin',
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<g id="i-blackhole">' +
      '<ellipse cx="12" cy="12" rx="10" ry="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
      '<ellipse cx="12" cy="12" rx="6.2" ry="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="12" cy="12" r="3.1" fill="currentColor"/>' +
      '<path d="M12 8.9V3.4M12 15.1v5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2.6"/>' +
    '</g>' +
    '<g id="i-galaxy">' +
      '<ellipse cx="12" cy="12" rx="3.4" ry="2.4" fill="currentColor"/>' +
      '<path d="M14.6 9.9c4.3-1.7 6.9.6 5.6 3.4-1.3 2.9-6.2 4.9-10.1 4.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M9.4 14.1c-4.3 1.7-6.9-.6-5.6-3.4C5.1 7.8 10 5.8 13.9 6.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
      '<circle cx="19" cy="7.4" r=".9" fill="currentColor"/><circle cx="5.2" cy="17" r=".8" fill="currentColor"/>' +
    '</g>' +
    '<g id="i-grb">' +
      '<circle cx="12" cy="12" r="2.6" fill="currentColor"/>' +
      '<path d="M12 9.4 8.6 2.2h6.8zM12 14.6l3.4 7.2H8.6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>' +
      '<path d="M4.6 12h2.6M16.8 12h2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<ellipse cx="12" cy="12" rx="5.4" ry="1.9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2.4"/>' +
    '</g>' +
    '<g id="i-solar">' +
      '<circle cx="12" cy="12" r="3" fill="currentColor"/>' +
      '<ellipse cx="12" cy="12" rx="6.4" ry="6.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.4 3"/>' +
      '<ellipse cx="12" cy="12" rx="10" ry="10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2.4 3"/>' +
      '<circle cx="12" cy="5.6" r="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="21" cy="13.4" r="1.9" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '</g></defs></svg>');

  /* Left/right margins only, so nothing sits under the centred content. */
  const spots = [
    ['i-galaxy',    'right:2%',  6, 60, -12], ['i-blackhole', 'left:2%',  17, 50,   8],
    ['i-solar',     'right:1%', 27, 66,  14], ['i-grb',       'left:2%',  38, 46,  -9],
    ['i-galaxy',    'right:2%', 48, 54,  16], ['i-blackhole', 'left:1%',  59, 58, -14],
    ['i-solar',     'right:2%', 70, 48,   7], ['i-grb',       'left:2%',  81, 52,  11],
    ['i-galaxy',    'right:1%', 91, 56,  -6],
  ];
  sky.insertAdjacentHTML('afterbegin', spots.map(([id, side, y, w, rot]) =>
    `<svg class="deco" viewBox="0 0 24 24" filter="url(#rough)" style="${side};top:${y}%;` +
    `width:${w}px;height:${w}px;transform:rotate(${rot}deg)">` +
    `<use href="#${id}"/></svg>`).join(''));
})();

(function () {
  if (matchMedia('(hover:none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.insertAdjacentHTML('beforeend',
    '<svg id="cursor-comet" viewBox="0 0 46 22" aria-hidden="true">' +
      '<path d="M40 11C30 11 18 13 3 18" fill="none" stroke="#141414" stroke-width="2"' +
           ' stroke-linecap="round" stroke-dasharray="3 5"/>' +
      '<circle cx="39" cy="11" r="4.4" fill="#FF5A1F" stroke="#141414" stroke-width="2"/>' +
    '</svg>');
  const c = document.getElementById('cursor-comet');
  /* The comet lags the pointer, so its tail points back the way it came. */
  let tx = -100, ty = -100, x = tx, y = ty, angle = 0, running = false;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!c.classList.contains('on')) { x = tx; y = ty; c.classList.add('on'); }
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: true });
  addEventListener('pointerleave', () => c.classList.remove('on'));
  function step() {
    const dx = tx - x, dy = ty - y;
    x += dx * 0.18; y += dy * 0.18;
    if (Math.hypot(dx, dy) > 1.5) angle = Math.atan2(dy, dx) * 180 / Math.PI;
    c.style.transform = `translate(${x - 39}px, ${y - 11}px) rotate(${angle}deg)`;
    /* Park the loop once it has caught up — no idle rAF while the mouse rests. */
    if (Math.hypot(tx - x, ty - y) > 0.4) requestAnimationFrame(step);
    else running = false;
  }
})();
