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

/* ---------- Mobile Dropdown Accordion (Chevron Toggle) ---------- */
document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const parent = trigger.closest('.mobile-dropdown');
    const menu = parent ? parent.querySelector('.mobile-dropdown-menu') : null;
    const icon = trigger.querySelector('.chevron-icon');
    if (menu) {
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
      if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  });
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
     survives page navigation and stays in sync between all pages. */
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('gp-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark){
        root.removeAttribute('data-theme');
        localStorage.setItem('gp-theme', 'light');
      } else {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('gp-theme', 'dark');
      }
    });
  });

  /* ---------- RTL toggle (Persisted to localStorage) ---------- */
  const storedRtl = localStorage.getItem('gp-rtl');
  if (storedRtl === 'rtl') {
    root.setAttribute('dir', 'rtl');
  } else {
    root.setAttribute('dir', 'ltr');
  }

  document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isRtl = root.getAttribute('dir') === 'rtl';
      if (isRtl) {
        root.setAttribute('dir', 'ltr');
        localStorage.setItem('gp-rtl', 'ltr');
      } else {
        root.setAttribute('dir', 'rtl');
        localStorage.setItem('gp-rtl', 'rtl');
      }
    });
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

  /* ---------- Interactive Toast System ---------- */
  function showToast(message) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="color:var(--marigold);">✦</span> ${message}`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /* ---------- Interactive Pills Click Handler ---------- */
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const isSelected = pill.classList.toggle('active');
      const text = pill.textContent.trim();
      if (isSelected) {
        showToast(`Selected Facility / Preference: <strong>${text}</strong>`);
      } else {
        showToast(`Deselected: <strong>${text}</strong>`);
      }
    });
  });

  /* ---------- Hall & Package Filter Bar Handler ---------- */
  const filterButtons = document.querySelectorAll('.filter-bar button');
  const hallCards = document.querySelectorAll('.hall-card');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const packageCards = document.querySelectorAll('.package-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentBar = btn.closest('.filter-bar');
      parentBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.textContent.trim().toLowerCase();

      // Filter Hall Cards
      if (hallCards.length) {
        let count = 0;
        hallCards.forEach(card => {
          const cardText = card.textContent.toLowerCase();
          const priceMatch = card.querySelector('.hall-price')?.textContent.replace(/[^0-9]/g, '');
          const priceNum = priceMatch ? parseInt(priceMatch) : 0;

          let match = true;
          if (filterVal === 'all') match = true;
          else if (filterVal === 'ac') match = cardText.includes('ac') && !cardText.includes('non-ac');
          else if (filterVal === 'garden') match = cardText.includes('lawn') || cardText.includes('garden') || cardText.includes('open air');
          else if (filterVal === 'rooftop') match = cardText.includes('terrace') || cardText.includes('rooftop');
          else if (filterVal.includes('50,000') || filterVal.includes('50000')) match = priceNum > 0 && priceNum <= 50000;
          else if (filterVal.includes('veg')) match = cardText.includes('veg');

          card.style.display = match ? '' : 'none';
          if (match) count++;
        });
        showToast(`Filter Applied: <strong>${btn.textContent.trim()}</strong> (${count} item${count === 1 ? '' : 's'})`);
      }

      // Filter Gallery Items
      if (galleryItems.length) {
        const cat = btn.dataset.filter || filterVal;
        galleryItems.forEach(item => {
          const show = cat === 'all' || item.dataset.cat === cat || item.textContent.toLowerCase().includes(cat);
          item.style.display = show ? '' : 'none';
        });
      }
    });
  });

  /* ---------- Lightbox ---------- */
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

  /* ---------- Video Tour Modal Handler ---------- */
  const videoTourTrigger = document.querySelector('#watchVideoTour, .btn-video-tour, [data-video-tour]');
  if (videoTourTrigger) {
    videoTourTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      let videoModal = document.querySelector('.video-modal');
      if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.className = 'video-modal';
        videoModal.innerHTML = `
          <div class="video-modal-content">
            <div class="video-modal-header">
              <h3>🎥 Maharani Grand Hall — Virtual 360° Tour</h3>
              <button class="video-modal-close">✕</button>
            </div>
            <div class="video-player-frame">
              <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" title="Virtual 360 Palace Tour" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>
            </div>
            <div class="video-modal-footer">
              <span style="color:var(--cream-text); font-size:.88rem;">📍 Pillarless 8,000 sq. ft Hall · Capacity 500 Guests</span>
              <a href="booking.html?hall=Maharani+Hall" class="btn btn-primary btn-sm">Book This Hall Now</a>
            </div>
          </div>
        `;
        document.body.appendChild(videoModal);

        videoModal.querySelector('.video-modal-close').addEventListener('click', () => {
          videoModal.classList.remove('open');
          videoModal.querySelector('iframe').src = '';
        });
        videoModal.addEventListener('click', (ev) => {
          if (ev.target === videoModal) {
            videoModal.classList.remove('open');
            videoModal.querySelector('iframe').src = '';
          }
        });
      }
      videoModal.querySelector('iframe').src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0';
      videoModal.classList.add('open');
      showToast('Opening Virtual 360° Hall Tour...');
    });
  }

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
        showToast('✦ Thank you for subscribing to Grand Palace updates!');
        input.placeholder = "You're on the list ✦";
        input.value = '';
      }
    });
  });

  /* ---------- Social Media Links Functionality ---------- */
  document.querySelectorAll('.social-row a, .social-icons a').forEach(link => {
    const label = (link.getAttribute('aria-label') || link.innerText || '').toLowerCase();
    if (!link.getAttribute('href') || link.getAttribute('href') === '#') {
      if (label.includes('facebook') || label.includes('fb')) {
        link.href = 'https://facebook.com/grandpalacebanquets';
      } else if (label.includes('instagram') || label.includes('insta')) {
        link.href = 'https://instagram.com/grandpalacebanquets';
      } else if (label.includes('x') || label.includes('twitter')) {
        link.href = 'https://x.com/grandpalacebanq';
      } else if (label.includes('youtube') || label.includes('yt')) {
        link.href = 'https://youtube.com/@grandpalacebanquets';
      } else {
        link.href = 'https://facebook.com/grandpalacebanquets';
      }
    }
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

});
