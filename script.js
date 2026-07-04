// ============================================
// Streak.uz — Landing Page JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Foydalanuvchi holatini tekshirish ----------
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const navRight = document.querySelector('.nav-right');
  const sideMenuAuth = document.getElementById('sideMenuAuth');

  const logoutHandler = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  // Ism asosida 1-2 harfli "avatar" belgisini hosil qilish (masalan "Abdulaziz Karimov" -> "AK")
  function getInitials(fullName) {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : '';
    const second = parts[1] ? parts[1][0] : '';
    return (first + second).toUpperCase() || '?';
  }

  if (currentUser) {
    // Dinamik ravishda havolalarni haqiqiy sahifalarga almashtirish
    const navRating = document.getElementById('navLinkRating');
    const navAchievements = document.getElementById('navLinkAchievements');
    const navProfile = document.getElementById('navLinkProfile');
    const sideRating = document.getElementById('sideLinkRating');
    const sideAchievements = document.getElementById('sideLinkAchievements');
    const sideProfile = document.getElementById('sideLinkProfile');

    if (navRating) navRating.href = './Leardboard.html';
    if (navAchievements) navAchievements.href = './yutuq.html';
    if (navProfile) navProfile.href = './profil.html';
    if (sideRating) sideRating.href = './Leardboard.html';
    if (sideAchievements) sideAchievements.href = './yutuq.html';
    if (sideProfile) sideProfile.href = './profil.html';

    const heroBtn = document.querySelector('.hero-buttons .btn-primary');
    if (heroBtn) {
      heroBtn.textContent = 'Boshqaruv paneli →';
      heroBtn.href = './dashboard.html';
    }
    const ctaBtn = document.querySelector('.btn-cta');
    if (ctaBtn) {
      ctaBtn.textContent = "Boshqaruv paneliga o'tish";
      ctaBtn.href = './dashboard.html';
    }

    if (navRight) {
      // Navbarda endi to'g'ridan-to'g'ri "Chiqish" tugmasi emas,
      // dumaloq profil belgisi ko'rsatiladi. Bosilganda dropdown ochilib,
      // ichida ism va "Chiqish" tugmasi chiqadi.
      navRight.innerHTML = `
        <div class="profile-menu" id="profileMenu">
          <button class="profile-trigger" id="profileTrigger" aria-haspopup="true" aria-expanded="false" aria-label="Profil menyusi">
            ${getInitials(currentUser.full_name)}
          </button>
          <div class="profile-dropdown" id="profileDropdown">
            <div class="profile-dropdown-name">Salom, ${currentUser.full_name}!</div>
            <button class="profile-logout-btn" id="logoutBtn">Chiqish</button>
          </div>
        </div>
      `;

      const profileMenu = document.getElementById('profileMenu');
      const profileTrigger = document.getElementById('profileTrigger');
      const profileDropdown = document.getElementById('profileDropdown');
      const logoutBtn = document.getElementById('logoutBtn');

      const closeProfileDropdown = () => {
        profileDropdown.classList.remove('active');
        profileTrigger.classList.remove('active');
        profileTrigger.setAttribute('aria-expanded', 'false');
      };

      const toggleProfileDropdown = () => {
        const isOpen = profileDropdown.classList.contains('active');
        if (isOpen) {
          closeProfileDropdown();
        } else {
          profileDropdown.classList.add('active');
          profileTrigger.classList.add('active');
          profileTrigger.setAttribute('aria-expanded', 'true');
        }
      };

      profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileDropdown();
      });

      // Tashqariga bosilganda dropdown yopiladi
      document.addEventListener('click', (e) => {
        if (profileMenu && !profileMenu.contains(e.target)) {
          closeProfileDropdown();
        }
      });

      // Escape tugmasi bilan yopish
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileDropdown();
      });

      logoutBtn.addEventListener('click', logoutHandler);
    }

    if (sideMenuAuth) {
      sideMenuAuth.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start; width: 100%;">
          <span style="font-weight: 700; color: #1f2937; font-size: 15px;">Salom, ${currentUser.full_name}!</span>
          <button id="sideLogoutBtn" class="btn-secondary" style="width: 100%; padding: 12px; font-size: 14px; cursor: pointer; text-align: center; border-radius: 12px;">Chiqish</button>
        </div>
      `;
      document.getElementById('sideLogoutBtn').addEventListener('click', logoutHandler);
    }
  }

  // ---------- Toast notification tizimi ----------
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  function showToast(message, duration = 5000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">🔥</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Yopish">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Animatsiya bilan ko'rsatish
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const removeToast = () => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 350);
    };

    const timer = setTimeout(removeToast, duration);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timer);
      removeToast();
    });
  }

  // ---------- Mobil navigatsiya uchun aktiv link almashtirish ----------
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // ---------- "Qanday ishlaydi?" tugmasi bosilganda steps bo'limiga scroll ----------
  const howItWorksBtn = document.querySelector('.btn-secondary');
  const howSection = document.querySelector('.how-section');

  if (howItWorksBtn && howSection) {
    howItWorksBtn.addEventListener('click', (e) => {
      e.preventDefault();
      howSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ---------- "Bepul boshlash" va "Bepul ro'yxatdan o'tish" tugmalari ----------
  // Bu ikkisi HTML'da to'g'ridan-to'g'ri href="./royxat.html" ga ishora qiladi,
  // shuning uchun JS orqali alohida ishlov berish (preventDefault) kerak emas —
  // tugma bosilganda brauzer o'zi royxat.html sahifasiga o'tadi.

  // ---------- "Kirish" tugmasi ----------
  const loginBtn = document.querySelector('.btn-kirish');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      // e.preventDefault(); // Login sahifasiga o'tish uchun bu bloklandi
    });
  }

  // ---------- Statistikalarni animatsiya bilan sanash ----------
  const stats = document.querySelectorAll('.stat-number');

  const animateNumber = (el) => {
    const text = el.textContent.trim();

    // Raqamni va qo'shimcha belgilarni ajratish (masalan "12,400+" -> 12400, "+")
    const match = text.match(/^([\d.,]+)(.*)$/);
    if (!match) return;

    const numericPart = match[1].replace(/,/g, '');
    const suffix = match[2]; // "+" yoki boshqa belgilar (img bo'lsa, bu yerda bo'sh bo'ladi)

    const isFloat = numericPart.includes('.');
    const target = parseFloat(numericPart);
    if (isNaN(target)) return;

    // Agar elementda <img> bor bo'lsa (masalan "4.8 ⭐"), suffix sifatida saqlanmaydi — alohida ishlov beramiz
    const innerImg = el.querySelector('img');
    const imgHtml = innerImg ? innerImg.outerHTML : '';

    let current = 0;
    const duration = 1200; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;

    const formatNumber = (val) => {
      if (isFloat) return val.toFixed(1);
      return Math.floor(val).toLocaleString('en-US');
    };

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      el.textContent = formatNumber(current) + (suffix.replace(/<[^>]*>/g, '').trim());

      // Agar ichida rasm bo'lsa, qayta qo'shamiz
      if (imgHtml) {
        el.innerHTML = formatNumber(current) + ' ' + imgHtml;
      }
    }, stepTime);
  };

  // Intersection Observer — faqat ekranga ko'ringanda animatsiya ishga tushadi
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  stats.forEach(stat => statsObserver.observe(stat));

  // ---------- Feature va step kartalar uchun scroll-reveal animatsiya ----------
  const revealItems = document.querySelectorAll('.feature-card, .step-card');

  revealItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(24px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = (index % 4) * 80; // kichik ketma-ket kechikish
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach(item => revealObserver.observe(item));

  // ---------- Header'ga scroll qilganda soya qo'shish ----------
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 2px 12px rgba(97, 51, 232, 0.06)';
        navbar.style.background = 'rgba(255,255,255,0.85)';
        navbar.style.backdropFilter = 'blur(8px)';
        navbar.style.position = 'sticky';
        navbar.style.top = '0';
        navbar.style.zIndex = '50';
      } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  // ---------- Responsive Yon Menu (Drawer) Hodisalari ----------
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const sideMenu = document.getElementById('sideMenu');
  const sideMenuOverlay = document.getElementById('sideMenuOverlay');
  const sideMenuLinks = document.querySelectorAll('.side-menu-link');

  const openDrawer = () => {
    if (sideMenu && menuToggle) {
      sideMenu.classList.add('active');
      menuToggle.classList.add('active');
      document.body.style.overflow = 'hidden'; // Scrollni to'xtatish
    }
  };

  const closeDrawer = () => {
    if (sideMenu && menuToggle) {
      sideMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = ''; // Scrollni qayta tiklash
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sideMenu && sideMenu.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', closeDrawer);
  }

  if (sideMenuOverlay) {
    sideMenuOverlay.addEventListener('click', closeDrawer);
  }

  // Yon menyudagi havolalar bosilganda yopish
  sideMenuLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

});