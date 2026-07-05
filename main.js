/* ============================================================
   Vitrine — Interaktion
   1. Nav-Zustand beim Scrollen
   2. Scroll-Reveals (IntersectionObserver)
   3. Grosse Scroll-Sequenz im Hero (Video-Scrubbing + Text-Beats)
   ============================================================ */
(() => {
  'use strict';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Nav-Zustand ---------- */
  const nav = document.querySelector('.nav');
  const onNav = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onNav();
  addEventListener('scroll', onNav, { passive: true });

  /* ---------- 2. Scroll-Reveals ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- 3. Hero-Scroll-Sequenz ---------- */
  const intro = document.querySelector('.intro');
  const video = document.querySelector('.intro__video');
  const beats = [...document.querySelectorAll('.intro__beat')];
  const cue = document.querySelector('.scroll-cue');

  // Sichtbarkeitsfenster je Beat: [einblenden], [ausblenden]
  const beatCfg = [
    { in: [0.03, 0.12], out: [0.28, 0.37] },
    { in: [0.40, 0.49], out: [0.60, 0.69] },
    { in: [0.72, 0.83], out: [1.20, 1.30] }, // Brand-Beat bleibt am Ende stehen
  ];

  const setBeat = (i, p) => {
    const c = beatCfg[i];
    const fi = seg(p, c.in[0], c.in[1]);
    const fo = seg(p, c.out[0], c.out[1]);
    const o = fi * (1 - fo);
    const y = (1 - fi) * 30 + fo * -30;
    const el = beats[i];
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate(-50%,calc(-50% + ${y.toFixed(1)}px))`;
  };

  // Fähigkeit zum Scrubbing: echtes Zeigegerät, breiter Viewport, keine Reduced-Motion
  const canScrub = matchMedia('(min-width: 821px) and (pointer: fine)').matches && !reduceMotion;

  const showStaticHero = (playAmbient) => {
    intro.classList.add('is-static');
    beats.forEach((el, i) => {
      const on = i === beats.length - 1;      // nur der Brand-Beat bleibt sichtbar
      el.style.opacity = on ? '1' : '0';
      el.style.transform = 'translate(-50%,-50%)';
    });
    if (cue) cue.style.display = 'none';
    if (playAmbient && video) {
      video.loop = true;
      video.muted = true;                       // Voraussetzung für Autoplay
      video.play().catch(() => { /* Poster bleibt stehen */ });
    }
  };

  if (!canScrub || !video) {
    // Mobil / Touch: sanfter Loop im Hintergrund. Reduced-Motion: nur Poster.
    showStaticHero(!reduceMotion);
  } else {
    let duration = 0;
    let target = 0;
    let applied = 0;
    let dirty = true;

    const measure = () => { dirty = true; };
    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', measure, { passive: true });

    video.addEventListener('loadedmetadata', () => {
      duration = video.duration || 0;
      video.pause();
      dirty = true;
    });

    const frame = () => {
      if (dirty) {
        dirty = false;
        const total = intro.offsetHeight - innerHeight;
        const p = clamp(-intro.getBoundingClientRect().top / total, 0, 1);

        // Text-Beats
        beats.forEach((_, i) => setBeat(i, p));

        // Scroll-Hinweis ausblenden, sobald es losgeht
        if (cue) cue.style.opacity = String(clamp(1 - p * 8, 0, 1));

        // Video-Zielzeit
        if (duration) target = p * (duration - 0.05);
      }

      // Weiche Annäherung an die Zielzeit
      if (duration && Math.abs(target - applied) > 0.01) {
        applied += (target - applied) * 0.18;
        if (video.readyState >= 1) {
          try { video.currentTime = applied; } catch (_) {}
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    // Falls Metadaten schon da sind
    if (video.readyState >= 1) {
      duration = video.duration || 0;
      video.pause();
    }
  }
})();
