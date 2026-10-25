/* motion.js — add just before </body> (after your existing <script>):  <script src="motion.js"></script> */
(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
  const fine = matchMedia('(pointer:fine)').matches;
  document.documentElement.classList.add('mo');

  /* ---------- inject: progress bar, text bands, 3D tunnel ---------- */
  const prog = document.createElement('div'); prog.className = 'prog'; document.body.appendChild(prog);
  const heroEl = $('.hero');
  const marq = document.createElement('div'); marq.className = 'marq'; marq.setAttribute('aria-hidden', 'true');
  marq.innerHTML = `<div class="mr a"><span>${'Dancer ✦ Rapper ✦ Vlogger ✦ '.repeat(6)}</span></div><div class="mr b"><span>${'Ibrahim Pasha DZ ✦ 4ever ✦ '.repeat(6)}</span></div>`;
  heroEl.after(marq);
  const photos = (typeof galleryData !== 'undefined' ? galleryData : []).map(g => ({ s: g.src, t: g.title }));
  const reel = document.createElement('section'); reel.id = 'reel'; reel.setAttribute('aria-label', 'Photo reel');
  reel.innerHTML = `<div class="reel-pin"><div class="reel-title" aria-hidden="true">Ibrahim<br>Pasha DZ</div><div class="reel-stage"></div><div class="reel-cap"><b>01</b><span></span></div></div>`;
  marq.after(reel);
  const stage = $('.reel-stage', reel), capN = $('.reel-cap b', reel), capT = $('.reel-cap span', reel), rTitle = $('.reel-title', reel);
  const cards = photos.map(p => { const d = document.createElement('div'); d.className = 'rc'; const i = new Image(); i.src = encodeURI(p.s); i.alt = p.t; i.loading = 'lazy'; i.decoding = 'async'; d.appendChild(i); stage.appendChild(d); return d; });
  if (!cards.length) reel.remove();

  /* ---------- split headings ---------- */
  $$('h2').forEach(h => { h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map((t, i) => `<span class="ln"><span style="--i:${i}">${t}</span></span>`).join(''); });

  /* ---------- tilt (pointer-driven 3D, uses the `rotate` property) ---------- */
  function tilt(el, max) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, on = false;
    const loop = () => { cx = lerp(cx, tx, .12); cy = lerp(cy, ty, .12); const m = Math.hypot(cx, cy); el.style.rotate = m < .003 ? '' : `${-cy} ${cx} 0 ${m * max}deg`; raf = (on || m >= .003) ? requestAnimationFrame(loop) : 0; };
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; on = true; if (!raf) raf = requestAnimationFrame(loop); });
    el.addEventListener('pointerleave', () => { tx = ty = 0; on = false; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; io.unobserve(el); el.classList.add('in');
    if (el.classList.contains('rv')) setTimeout(() => { el.classList.add('done'); if (fine && el.dataset.tilt) tilt(el, +el.dataset.tilt); }, 1700);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const sel = '.s,.achievement,.video-card,.gallery-grid-item,.platform-bar,.tags span,.video-channel-banner,#about p,.gallery-filmstrip,.gallery-showcase,.mail,#contact .btn,.ig';
  const tiltMap = { '.s': 7, '.achievement': 7, '.video-card': 8, '.gallery-grid-item': 9, '.gallery-showcase': 3 };
  function reg(el) {
    if (el.classList.contains('rv')) return; el.classList.add('rv');
    el.style.setProperty('--d', (([...el.parentElement.children].indexOf(el)) % 6) * .08 + 's');
    for (const k in tiltMap) if (el.matches(k)) el.dataset.tilt = tiltMap[k];
    io.observe(el);
  }
  $$(sel).forEach(reg); $$('h2').forEach(h => io.observe(h));
  const gv = $('#gallery-grid-view');
  if (gv) new MutationObserver(() => $$('.gallery-grid-item', gv).forEach(reg)).observe(gv, { childList: true });

  /* ---------- gallery: wipe transition + depth parallax ---------- */
  const si = $('#showcase-img'), sb = $('#showcase-backdrop'), st = $('#showcase-stage');
  if (si) new MutationObserver(() => { si.classList.remove('wipe'); void si.offsetWidth; si.classList.add('wipe'); }).observe(si, { attributes: true, attributeFilter: ['src'] });
  if (st && fine) {
    st.addEventListener('pointermove', e => { const r = st.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; si.style.translate = `${nx * -26}px ${ny * -18}px`; if (sb) sb.style.translate = `${nx * 34}px ${ny * 24}px`; });
    st.addEventListener('pointerleave', () => { si.style.translate = ''; if (sb) sb.style.translate = ''; });
  }

  /* ---------- scroll + pointer loop (smoothed) ---------- */
  let cur = scrollY, vel = 0, mx = 0, my = 0, cmx = 0, cmy = 0;
  addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  const blk = $('.blk', heroEl), wel = $('.wel', heroEl), g1 = $('.g1', heroEl), g2 = $('.g2', heroEl), main = $$('h1 > span', heroEl)[2], fan = $('.fan', heroEl), fc = $$('.c', fan), ring = $('.ring', heroEl);
  const rows = $$('.mr', marq);
  let lastIdx = -1;

  function frame() {
    const prev = cur; cur = lerp(cur, scrollY, .1); vel = lerp(vel, cur - prev, .2);
    cmx = lerp(cmx, mx, .07); cmy = lerp(cmy, my, .07);
    const doc = document.documentElement; prog.style.scale = `${clamp(cur / Math.max(1, doc.scrollHeight - innerHeight))} 1`;

    /* hero */
    const hH = heroEl.offsetHeight;
    if (cur < hH * 1.4) {
      const p = clamp(cur / (hH * .9));
      blk.style.translate = `0 ${p * 140}px`; blk.style.scale = `1 ${1 + p * .5}`;
      wel.style.translate = `0 ${-p * 70}px`; wel.style.opacity = 1 - p * 1.3;
      g1.style.translate = `${cmx * -16}px ${-p * 110 - cmy * 8}px`; g2.style.translate = `${cmx * 16}px ${p * 130}px`;
      main.style.translate = `${cmx * 6}px ${-p * 24}px`;
      const m = Math.hypot(cmx, cmy); fan.style.rotate = m < .01 ? '' : `${-cmy} ${cmx} 0 ${m * 6}deg`;
      fc.forEach((c, k) => { const i = k - (fc.length - 1) / 2; c.style.translate = `${i * p * 90 - cmx * i * 7}px ${-p * 50}px ${(2 - Math.abs(i)) * 24 - p * 160 + Math.abs(i) * p * 40}px`; c.style.rotate = `0 1 0 ${i * -p * 26}deg`; });
      ring.style.rotate = `${cur * .12}deg`;
    }

    /* text bands */
    const mr = marq.getBoundingClientRect();
    if (mr.bottom > -200 && mr.top < innerHeight + 200) {
      const x = mr.top * .45; rows[0].style.translate = `${x}px 0`; rows[1].style.translate = `${-x - 300}px 0`;
      marq.style.transform = `skewX(${clamp(vel * -.4, -12, 12)}deg)`;
    }

    /* 3D tunnel */
    const rr = reel.getBoundingClientRect();
    if (cards.length && rr.bottom > -100 && rr.top < innerHeight + 100) {
      const total = rr.height - innerHeight, p = clamp(-rr.top / total), n = cards.length, gap = 560, spanX = Math.min(innerWidth * .3, 420);
      let best = 1e9, bi = 0;
      cards.forEach((c, i) => {
        const z = p * (n * gap + 900) - i * gap - 1500, side = i % 2 ? 1 : -1, k = (i % 3) - 1;
        const x = side * spanX * (.55 + (i % 3) * .22), y = k * innerHeight * .12;
        const o = clamp((z + 2300) / 800) * clamp((700 - z) / 400);
        c.style.opacity = o; c.style.visibility = o < .01 ? 'hidden' : 'visible';
        c.style.transform = `translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${z}px) rotateY(${-side * 20}deg) rotateZ(${side * k * 3}deg)`;
        c.style.zIndex = Math.round(z + 3000);
        if (Math.abs(z + 150) < best) { best = Math.abs(z + 150); bi = i; }
      });
      rTitle.style.scale = `${.8 + p * .5}`;
      if (bi !== lastIdx) { lastIdx = bi; capN.textContent = String(bi + 1).padStart(2, '0'); capT.textContent = photos[bi].t; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
