/* =========================================================
   GRAND PALACE — main.js
   Shared behaviour across every page: mobile nav, theme
   toggle, scroll reveal, gallery lightbox + filters,
   testimonial slider, FAQ accordion, back-to-top.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
/* ==========================================================
   MOBILE NAVIGATION
   ========================================================== */

const hamburger = document.querySelector(".hamburger");
const mobilePanel = document.querySelector(".mobile-panel");
const mobileOverlay = document.querySelector(".mobile-overlay");

function openMenu() {
    hamburger.classList.add("active");
    mobilePanel.classList.add("open");
    mobileOverlay.classList.add("open");
    document.body.classList.add("menu-open");

    hamburger.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    hamburger.classList.remove("active");
    mobilePanel.classList.remove("open");
    mobileOverlay.classList.remove("open");
    document.body.classList.remove("menu-open");

    hamburger.setAttribute("aria-expanded", "false");
}

hamburger?.addEventListener("click", function () {

    if (mobilePanel.classList.contains("open")) {
        closeMenu();
    } else {
        openMenu();
    }

});

mobileOverlay?.addEventListener("click", closeMenu);

document.querySelectorAll(".mobile-panel a").forEach(link => {

    link.addEventListener("click", closeMenu);

});

document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){

        closeMenu();

    }

});

window.addEventListener("resize", function(){

    if(window.innerWidth > 1100){

        closeMenu();

    }

});

  /* ---------- Dark / light mode toggle ----------
     Persisted to localStorage (shared key "gp-theme") so the choice
     survives page navigation and stays in sync between the public
     site and the admin panel instead of resetting on every page load. */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('gp-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');

  themeToggle?.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark){ root.removeAttribute('data-theme'); localStorage.setItem('gp-theme', 'light'); }
    else { root.setAttribute('data-theme', 'dark'); localStorage.setItem('gp-theme', 'dark'); }
  });

  /* ---------- RTL toggle (optional control) ---------- */
  const rtlToggle = document.querySelector('[data-rtl-toggle]');
  rtlToggle?.addEventListener('click', () => {
    const isRtl = root.getAttribute('dir') === 'rtl';
    root.setAttribute('dir', isRtl ? 'ltr' : 'rtl');
  });

  /* ---------- Scroll reveal (AOS-lite) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ---------- Active nav link highlight ---------- */
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-panel a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  /* ---------- Back to top ---------- */
  const backTop = document.querySelector('.back-top');
  window.addEventListener('scroll', () => {
    if (!backTop) return;
    backTop.classList.toggle('show', window.scrollY > 500);
  });
  backTop?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ---------- Gallery filter + lightbox ---------- */
  const filterButtons = document.querySelectorAll('.filter-bar button');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = cat === 'all' || item.dataset.cat === cat;
        item.style.display = show ? '' : 'none';
      });
    });
  });

  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!lightbox) return;
      lightboxImg.src = item.querySelector('img').src;
      lightboxImg.alt = item.querySelector('img').alt;
      lightbox.classList.add('open');
    });
  });
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-q')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Testimonial slider ---------- */
  const slides = document.querySelectorAll('[data-slide]');
  const dotsWrap = document.querySelector('.slider-dots');
  if (slides.length){
    let activeIndex = 0;
    slides.forEach((s,i) => s.style.display = i === 0 ? '' : 'none');
    if (dotsWrap){
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showSlide(i));
        dotsWrap.appendChild(dot);
      });
    }
    function showSlide(i){
      slides[activeIndex].style.display = 'none';
      dotsWrap?.children[activeIndex]?.classList.remove('active');
      activeIndex = i;
      slides[activeIndex].style.display = '';
      dotsWrap?.children[activeIndex]?.classList.add('active');
    }
    setInterval(() => showSlide((activeIndex + 1) % slides.length), 6000);
  }

  /* ---------- Newsletter placeholder ---------- */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value){
        input.placeholder = "You're on the list ✦";
        input.value = '';
      }
    });
  });

});
