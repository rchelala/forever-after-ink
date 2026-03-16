/* ═══════════════════════════════════════════════════════════
   Forever After Ink — JavaScript
   ═══════════════════════════════════════════════════════════ */

// ── NAVBAR SCROLL EFFECT ─────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ── MOBILE NAV TOGGLE ────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// ── SCROLL REVEAL ────────────────────────────────────────
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling elements
      const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
      let delay = 0;
      siblings.forEach((sib, idx) => {
        if (sib === entry.target) delay = idx * 80;
      });
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ── GALLERY CAROUSEL ─────────────────────────────────────
const carouselOuter = document.getElementById('galleryCarousel');
const carouselTrack = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');

if (carouselOuter && carouselTrack) {
  const slides = Array.from(carouselTrack.querySelectorAll('.carousel-slide'));
  let current = 0;
  let autoTimer;
  let touchStartX = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  function getTranslate(index) {
    const outerW  = carouselOuter.offsetWidth;
    const slideW  = slides[0].offsetWidth;
    const gap     = 20;
    const center  = (outerW - slideW) / 2;
    return center - index * (slideW + gap);
  }

  function playActiveVideo() {
    const vid = slides[current].querySelector('video');
    if (vid) vid.play().catch(() => {});
  }

  function pauseAllVideos() {
    slides.forEach(s => {
      const vid = s.querySelector('video');
      if (vid) { vid.pause(); vid.currentTime = 0; }
    });
  }

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    pauseAllVideos();
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    carouselTrack.style.transform = `translateX(${getTranslate(current)}px)`;
    playActiveVideo();
    resetTimer();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 4000);
  }

  // Init
  slides[0].classList.add('active');
  carouselTrack.style.transition = 'none';
  carouselTrack.style.transform = `translateX(${getTranslate(0)}px)`;
  requestAnimationFrame(() => {
    carouselTrack.style.transition = '';
    resetTimer();
  });

  // Buttons
  document.querySelector('.carousel-btn--prev').addEventListener('click', prev);
  document.querySelector('.carousel-btn--next').addEventListener('click', next);

  // Pause on hover
  carouselOuter.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carouselOuter.addEventListener('mouseleave', resetTimer);

  // Touch / swipe
  carouselOuter.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    clearInterval(autoTimer);
  }, { passive: true });

  carouselOuter.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    else resetTimer();
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener('resize', () => {
    carouselTrack.style.transition = 'none';
    carouselTrack.style.transform = `translateX(${getTranslate(current)}px)`;
    setTimeout(() => { carouselTrack.style.transition = ''; }, 50);
  });

  // Click active slide to open lightbox
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      if (!slide.classList.contains('active')) return;
      const img = slide.querySelector('img');
      if (!img) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.94);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:fadeIn 0.2s ease;`;
      const style = document.createElement('style');
      style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
      document.head.appendChild(style);
      const lb = document.createElement('img');
      lb.src = img.src; lb.alt = img.alt;
      lb.style.cssText = `max-width:92vw;max-height:92vh;object-fit:contain;border:1px solid rgba(200,136,10,0.4);`;
      overlay.appendChild(lb);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      const close = () => { document.body.removeChild(overlay); document.body.style.overflow = ''; };
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
    });
  });
}

// ── SMOOTH ACTIVE NAV HIGHLIGHT ───────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        a.style.opacity = '0.8';
      });
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) {
        active.style.color = 'var(--gold)';
        active.style.opacity = '1';
      }
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));
