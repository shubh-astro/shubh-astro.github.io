/* Shared page furniture: the sketch objects drifting down the margins and the
   comet that trails the pointer. Both pages load this; nothing else uses it. */
(function () {
  const sky = document.getElementById('sky');
  if (!sky) return;

  /* The four decoration symbols live here rather than in each page's sprite
     sheet — they are used by this file alone. */
  document.body.insertAdjacentHTML('afterbegin',
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    /* A gentler roughen than the pages' own #rough: these objects carry much
       finer strokes, and the larger displacement merges them into a blob. */
    '<filter id="rough-fine" x="-12%" y="-12%" width="124%" height="124%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="1" seed="11" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="0.38" xChannelSelector="R" yChannelSelector="G"/>' +
    '</filter>' +
    '<g id="i-blackhole">' +
      /* light bent up over and under the disk, held well clear of its rim so the
         curves stay separate at decoration size */
      '<path d="M4.2 7.4c2.3-1.6 5-2.4 7.8-2.4s5.5.8 7.8 2.4" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M4.2 16.6c2.3 1.6 5 2.4 7.8 2.4s5.5-.8 7.8-2.4" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>' +
      '<ellipse cx="12" cy="12" rx="10.4" ry="3.4" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
      '<ellipse cx="12" cy="12" rx="6.8" ry="2.2" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" stroke-width=".9"/>' +
      '<circle cx="12" cy="12" r="2.3" fill="currentColor"/>' +
      '<path d="M12 7.6V3.2M12 16.4v4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="1.6 2.2"/>' +
      '<path d="M10.6 4.1 12 2.1l1.4 2M10.6 19.9 12 21.9l1.4-2" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/>' +
    '</g>' +
    '<g id="i-galaxy">' +
      '<ellipse cx="12" cy="12" rx="3.4" ry="2.4" fill="currentColor"/>' +
      '<ellipse cx="12" cy="12" rx="5.6" ry="3.9" fill="none" stroke="currentColor" stroke-width=".9"/>' +
      '<path d="M15.1 9.5c4.7-1.9 7.7.5 6.3 3.7-1.4 3.2-6.8 5.4-11.2 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M8.9 14.5c-4.7 1.9-7.7-.5-6.3-3.7C4 7.6 9.4 5.4 13.8 6.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      /* two shorter inner arms and a dust lane */
      '<path d="M14.6 8.6c2.7-.5 4.1 1 3.3 2.7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M9.4 15.4c-2.7.5-4.1-1-3.3-2.7" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M6.6 9.9c1.8-1.4 4-2.3 6-2.5" fill="none" stroke="currentColor" stroke-width=".9" stroke-dasharray="1.4 1.8" stroke-linecap="round"/>' +
      '<circle cx="19.1" cy="7.3" r=".9" fill="currentColor"/><circle cx="4.9" cy="16.7" r=".8" fill="currentColor"/>' +
      '<circle cx="17.4" cy="17.6" r=".6" fill="currentColor"/><circle cx="6.4" cy="6.2" r=".6" fill="currentColor"/>' +
    '</g>' +
    '<g id="i-grb">' +
      '<circle cx="12" cy="12" r="2.3" fill="currentColor"/>' +
      '<circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width=".9" stroke-dasharray="1.5 1.9"/>' +
      '<path d="M12 9.5 8.2 1.7h7.6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M12 14.5l3.8 7.8H8.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
      /* internal shocks running up each jet */
      '<path d="M9.9 6.4h4.2M10.7 4.1h2.6M9.9 17.6h4.2M10.7 19.9h2.6" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>' +
      '<ellipse cx="12" cy="12" rx="6.6" ry="2.2" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="1.8 2.2"/>' +
      '<path d="M3.4 12h2M18.6 12h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      '<circle cx="4.6" cy="7.2" r=".7" fill="currentColor"/><circle cx="19.4" cy="16.8" r=".7" fill="currentColor"/>' +
    '</g>' +
    '<g id="i-solar">' +
      '<circle cx="12" cy="12" r="2.5" fill="currentColor"/>' +
      '<path d="M12 8.2V6.7M12 15.8v1.5M8.2 12H6.7M15.8 12h1.5M9.3 9.3 8.2 8.2M14.7 14.7l1.1 1.1M14.7 9.3l1.1-1.1M9.3 14.7 8.2 15.8" stroke="currentColor" stroke-width=".9" stroke-linecap="round"/>' +
      '<circle cx="12" cy="12" r="5.6" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2.2 2.8"/>' +
      '<circle cx="12" cy="12" r="8.1" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2.2 2.8"/>' +
      '<circle cx="12" cy="12" r="10.8" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1.4 2"/>' +
      '<circle cx="12" cy="6.4" r="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="20.1" cy="12" r="1.7" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
      '<ellipse cx="20.1" cy="12" rx="3" ry="1" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(-18 20.1 12)"/>' +
      '<circle cx="6.1" cy="17.5" r="1" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
    '</g></defs></svg>');

  /* Left/right margins only, so nothing sits under the centred content. */
  const spots = [
    ['i-galaxy',    'right:2%',  6, 78, -12], ['i-blackhole', 'left:2%',  17, 66,   8],
    ['i-solar',     'right:1%', 27, 84,  14], ['i-grb',       'left:2%',  38, 62,  -9],
    ['i-galaxy',    'right:2%', 48, 72,  16], ['i-blackhole', 'left:1%',  59, 76, -14],
    ['i-solar',     'right:2%', 70, 64,   7], ['i-grb',       'left:2%',  81, 68,  11],
    ['i-galaxy',    'right:1%', 91, 74,  -6],
  ];
  sky.insertAdjacentHTML('afterbegin', spots.map(([id, side, y, w, rot]) =>
    `<svg class="deco" viewBox="0 0 24 24" filter="url(#rough-fine)" style="${side};top:${y}%;` +
    `width:${w}px;height:${w}px;transform:rotate(${rot}deg)">` +
    `<use href="#${id}"/></svg>`).join(''));
})();

(function () {
  if (matchMedia('(hover:none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.insertAdjacentHTML('beforeend',
    '<svg id="cursor-comet" viewBox="0 0 44 26" aria-hidden="true">' +
      /* the stream fades out along its length rather than ending on an edge */
      '<defs><linearGradient id="cc-tail" x1="1" y1="0" x2="0" y2="0">' +
        '<stop offset="0" stop-color="#141414" stop-opacity=".34"/>' +
        '<stop offset="1" stop-color="#141414" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="M29 11.2C20.5 9.4 10 7.8 0.5 7.2L1.6 18.8C11 17.4 20.5 14.6 29 13.4Z"' +
           ' fill="url(#cc-tail)"/>' +
      '<path d="M28.4 11.4C20.6 10.4 12 9.6 4.6 9.4" fill="none" stroke="#141414"' +
           ' stroke-width="1.1" stroke-linecap="round" opacity=".32"/>' +
      '<path d="M28.6 13.4C21 13.6 13 14.8 6 16.2" fill="none" stroke="#141414"' +
           ' stroke-width="1" stroke-linecap="round" opacity=".24"/>' +
      /* the head: a lumpy rock rather than a disc */
      '<path d="M34.2 6.7l3.6 1.1 2.5 2.7.2 3.6-2.2 2.9-3.5 1.1-3.4-1-2.3-2.7-.2-3.6 2.1-2.9z"' +
           ' fill="#FF5A1F" stroke="#141414" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<circle cx="32.6" cy="10.6" r="1.6" fill="none" stroke="#141414" stroke-width="1"/>' +
      '<circle cx="36.9" cy="14.4" r="1.3" fill="none" stroke="#141414" stroke-width="1"/>' +
      '<circle cx="36.3" cy="9.7" r=".85" fill="none" stroke="#141414" stroke-width=".9"/>' +
      '<circle cx="32.3" cy="15.1" r=".8" fill="none" stroke="#141414" stroke-width=".9"/>' +
      '<path d="M38.9 11.6a1.5 1.5 0 0 1 .6 1.5" fill="none" stroke="#141414" stroke-width=".9" stroke-linecap="round"/>' +
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
    c.style.transform = `translate(${x - 44.2}px, ${y - 15.7}px) rotate(${angle}deg)`;
    /* Park the loop once it has caught up — no idle rAF while the mouse rests. */
    if (Math.hypot(tx - x, ty - y) > 0.4) requestAnimationFrame(step);
    else running = false;
  }
})();

/* Visitor stats. GoatCounter is a hosted counter: it logs each page view with a
   country and a timestamp, and shows them on a dashboard only I can see. No
   cookies and no personal data are stored, so the site needs no consent banner.
   Put your site code below — the "xxx" from https://xxx.goatcounter.com — and
   stats start collecting. Left blank, this block does nothing. */
(function () {
  const CODE = 'shubhmittal';
  if (!CODE) return;
  /* Skip local previews so my own testing does not land in the numbers. */
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '') return;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${CODE}.goatcounter.com/count`;
  document.head.appendChild(s);
})();
