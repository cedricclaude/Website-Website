/* ============================================================
   Vitrine — Interaktion
   1. Nav-Zustand beim Scrollen
   2. Scroll-Reveals (IntersectionObserver)
   3. Hero: Ambient-Video (läuft durchgehend) + weiche Parallax
      — KEIN Video-Scrubbing mehr (das war die Ruckel-Ursache)
   ============================================================ */
(() => {
  'use strict';

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

  /* ---------- 3. Hero ---------- */
  const hero = document.querySelector('.hero');
  const inner = document.querySelector('.hero__inner');
  const video = document.querySelector('.hero__video');

  // Video: durchgehend, muted, geloopt. Bei Reduced-Motion nur Poster.
  if (video) {
    if (reduceMotion) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      video.muted = true;
      const play = () => video.play().catch(() => { /* Poster bleibt stehen */ });
      play();
      // manche Browser starten erst nach dem ersten Frame/Interaktion
      video.addEventListener('canplay', play, { once: true });
    }
  }

  // Weiche Parallax — nur Transform/Opacity (GPU), rAF-gedrosselt.
  if (!reduceMotion && hero && inner) {
    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY;
      const h = hero.offsetHeight || 1;
      if (y > h) return;                      // nur solange der Hero sichtbar ist
      const p = Math.min(y / h, 1);
      inner.style.transform = `translate3d(0,${(y * 0.26).toFixed(1)}px,0)`;
      inner.style.opacity = String(Math.max(0, 1 - p * 1.2));
      if (video) video.style.transform = `scale(${(1.05 + p * 0.08).toFixed(3)}) translate3d(0,${(y * 0.1).toFixed(1)}px,0)`;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
    addEventListener('scroll', onScroll, { passive: true });
    apply();
  }
})();
