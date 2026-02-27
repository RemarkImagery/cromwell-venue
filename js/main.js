/* ============================================
   Cromwell Community Venue — Main JS
   Lenis smooth scroll + GSAP ScrollTrigger
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Lenis Smooth Scroll ---
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
    infinite: false,
  });

  // Sync Lenis with GSAP ticker
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // --- Mobile Nav Toggle ---
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      // Stop Lenis while mobile nav is open
      if (isOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        lenis.start();
      });
    });
  }

  // --- Nav background on scroll ---
  const nav = document.querySelector('.nav');

  lenis.on('scroll', ({ scroll }) => {
    if (scroll > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // --- Hero Word Cycling ---
  const cycleWords = document.querySelectorAll('.hero__cycle-word');
  const cycleWrap = document.querySelector('.hero__cycle-wrap');
  if (cycleWords.length > 0 && cycleWrap) {
    let currentWord = 0;
    const wordCount = cycleWords.length;

    // Measure and set width to match current word
    function setWrapWidth(word) {
      cycleWrap.style.width = (word.scrollWidth + 4) + 'px';
    }

    // Set initial width
    setWrapWidth(cycleWords[0]);

    setInterval(() => {
      const prev = cycleWords[currentWord];
      prev.classList.remove('active');
      prev.classList.add('exit');

      currentWord = (currentWord + 1) % wordCount;
      const next = cycleWords[currentWord];
      next.classList.remove('exit');
      next.classList.add('active');
      setWrapWidth(next);

      // Clean up exit class after transition
      setTimeout(() => {
        prev.classList.remove('exit');
      }, 600);
    }, 2200);

    // Recalculate on resize
    window.addEventListener('resize', () => {
      setWrapWidth(cycleWords[currentWord]);
    });
  }


  // --- What's On Banner Cycling ---
  const bannerSlides = document.querySelectorAll('.whatson-banner__slide');
  const bannerDots = document.querySelectorAll('.whatson-banner__dot');
  const progressBar = document.querySelector('.whatson-banner__progress-bar');

  if (bannerSlides.length > 0) {
    let currentSlide = 0;
    const slideCount = bannerSlides.length;
    const slideDuration = 6000; // 6 seconds per slide
    let slideTimer = null;
    let progressStart = null;
    let progressRaf = null;

    function goToSlide(index) {
      bannerSlides.forEach(s => s.classList.remove('active'));
      bannerDots.forEach(d => d.classList.remove('active'));
      currentSlide = index;
      bannerSlides[currentSlide].classList.add('active');
      bannerDots[currentSlide].classList.add('active');
      startProgress();
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % slideCount);
    }

    function startProgress() {
      if (progressRaf) cancelAnimationFrame(progressRaf);
      clearTimeout(slideTimer);
      progressStart = performance.now();

      function tick(now) {
        const elapsed = now - progressStart;
        const pct = Math.min((elapsed / slideDuration) * 100, 100);
        if (progressBar) progressBar.style.width = pct + '%';
        if (elapsed < slideDuration) {
          progressRaf = requestAnimationFrame(tick);
        } else {
          nextSlide();
        }
      }
      progressRaf = requestAnimationFrame(tick);
    }

    // Dot click handlers
    bannerDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-goto'), 10);
        if (idx !== currentSlide) goToSlide(idx);
      });
    });

    // Start cycling
    startProgress();
  }

  // --- Anchor link scrolling via Lenis ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -nav.offsetHeight });
      }
    });
  });

  // --- GSAP ScrollTrigger Animations ---

  // Fade-in elements
  gsap.utils.toArray('.fade-in').forEach(el => {
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Staggered space cards
  ScrollTrigger.batch('.space-card', {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
      });
    },
    start: 'top 88%',
  });

  // Set initial state for space cards (GSAP will animate from this)
  gsap.set('.space-card', { opacity: 0, y: 40 });

  // Hero parallax via ScrollTrigger
  const heroImg = document.querySelector('.hero__image img');
  if (heroImg) {
    gsap.to(heroImg, {
      y: '25%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // About section image parallax
  const aboutImg = document.querySelector('.about__image img');
  if (aboutImg) {
    gsap.fromTo(aboutImg,
      { y: '-8%' },
      {
        y: '8%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  }

  // Cafe image parallax
  const cafeImg = document.querySelector('.cafe__image img');
  if (cafeImg) {
    gsap.fromTo(cafeImg,
      { y: '-6%' },
      {
        y: '6%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.cafe',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  }

  // Cinema image parallax
  const cinemaImg = document.querySelector('.cinema__image img');
  if (cinemaImg) {
    gsap.fromTo(cinemaImg,
      { y: '-6%' },
      {
        y: '6%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.cinema',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  }

  // Hire section background parallax
  const hireBg = document.querySelector('.hire__bg img');
  if (hireBg) {
    gsap.fromTo(hireBg,
      { y: '-10%' },
      {
        y: '10%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.hire',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      }
    );
  }

});

// --- Enquiry form handler (demo) ---
function handleEnquiry(e) {
  e.preventDefault();
  const form = e.target;
  const success = document.getElementById('enquirySuccess');
  if (form && success) {
    form.style.display = 'none';
    success.style.display = 'block';
  }
  return false;
}

function resetEnquiry() {
  const form = document.querySelector('.enquiry__form');
  const success = document.getElementById('enquirySuccess');
  if (form && success) {
    form.reset();
    form.style.display = 'flex';
    success.style.display = 'none';
  }
}
