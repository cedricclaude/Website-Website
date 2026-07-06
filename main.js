/* ============================================================
   Ostform — Interaktion (v3)
   1. Nav-Zustand
   2. Scroll-Reveals
   3. Hero: Ambient-Loop + Maus-Tilt auf dem 3D-Objekt
   4. Parallax: Riesenwörter + Panel-Bilder (nur Transforms)
   ============================================================ */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 1. Nav ---------- */
  const nav = document.querySelector('.nav');
  const onNav = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onNav();
  addEventListener('scroll', onNav, { passive: true });

  /* ---------- 2. Reveals ---------- */
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

  /* ---------- 3. Hero-Video + Tilt ---------- */
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('[data-stage]');
  const tilt = document.querySelector('[data-tilt]');
  const video = document.querySelector('.hero__video');

  if (video) {
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      video.muted = true;
      const play = () => video.play().catch(() => {});
      play();
      video.addEventListener('canplay', play, { once: true });
    }
  }

  // Maus-Tilt: Objekt neigt sich sanft zur Cursor-Position (nur Desktop)
  if (!reduceMotion && finePointer && hero && tilt) {
    let tx = 0, ty = 0;      // Ziel-Rotation
    let cx = 0, cy = 0;      // aktuelle Rotation
    let raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      tilt.style.transform = `perspective(900px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) {
        raf = requestAnimationFrame(loop);
      } else { raf = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * 14;          // max ±7°
      ty = ny * -10;
      kick();
    }, { passive: true });

    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; kick(); }, { passive: true });
  }

  /* ---------- 4. Scroll-Parallax ---------- */
  if (!reduceMotion) {
    const heroWord = document.querySelector('[data-hero-word]');
    const words = [...document.querySelectorAll('[data-word]')];
    const floats = [...document.querySelectorAll('[data-float]')];
    let ticking = false;

    const apply = () => {
      ticking = false;
      const vh = innerHeight;
      const y = window.scrollY;

      // Hero: Riesenwort langsamer, Bühne leicht — klassische Parallax
      if (heroWord && y < vh * 1.2) {
        heroWord.style.transform = `translate(-50%,-50%) translate3d(0,${(y * 0.22).toFixed(1)}px,0)`;
        if (stage) stage.style.transform = `translate3d(0,${(y * 0.1).toFixed(1)}px,0) scale(${clamp(1 - y / vh * 0.12, .88, 1).toFixed(3)})`;
      }

      // Panels: Wort wandert horizontal, Bild schwebt vertikal
      words.forEach(w => {
        const r = w.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);   // 0…1 durch die Sektion
        w.style.transform = `translate(-50%,-50%) translate3d(${((p - 0.5) * 120).toFixed(1)}px,0,0)`;
      });
      floats.forEach(f => {
        const r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        f.style.transform = `rotate(-3deg) translate3d(0,${((0.5 - p) * 46).toFixed(1)}px,0)`;
      });
    };

    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    apply();
  }
})();
