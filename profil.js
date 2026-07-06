// =============================================
//  Streak.uz — Profil sahifasi — profil.js
//  Faqat profil ma'lumotlari, yutuqlar va XP
//  darajasini ko'rsatish va boshqarish.
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // ─── Supabase Configuration ────────────────────────────────────────
  const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const LANG_KEY  = 'streak_lang';

  // ─── 0. TARJIMALAR LUG'ATI ────────────────────────────────────────
  const translations = {
    uz: {
      nav_dashboard: "Boshqaruv", nav_rating: "Reyting", nav_profile: "Profil", nav_settings: "Sozlamalar",
      btn_add_habit: "Yangi odat",
      greeting: "Salom, {name}!",
      streak_suffix: "{n} kunlik streak",
      badge_level: "{n}-daraja",
      badge_title: "Ko'nikma ustasi",
      bio: "Har kuni o'z ustida ishlashni yaxshi ko'radigan dasturchi. Maqsad: Kunlik streakni 30 ga yetkazish!",
      stat_streak: "Streak", stat_skills: "Ko'nikmalar", stat_friends: "Do'stlar",
      xp_title: "Tajriba darajasi", xp_subtitle: "Keyingi darajaga {n} XP qoldi",
      achievements_title: "Yutuqlar",
      ach_first_step: "Birinchi Qadam", ach_first_step_desc: "Birinchi odatingizni muvaffaqiyatli bajardingiz!",
      ach_water: "Suv Ichish", ach_water_desc: "7 kun ketma-ket suv ichish odatini bajardingiz.",
      ach_reader: "Kitobxon", ach_reader_desc: "10 soat kitob o'qishni yakunladingiz.",
      ach_athlete: "Sportchi", ach_athlete_desc: "5 marta sport mashg'ulotini bajardingiz.",
      ach_meditation: "Meditatsiya Ustasi", ach_meditation_desc: "30 kun meditatsiya qilganda ochiladi.",
      ach_cook: "Oshpaz", ach_cook_desc: "15 marta uyda taom tayyorlaganda ochiladi.",
      ach_saver: "Tejamkor", ach_saver_desc: "1 oy davomida byudjetni nazorat qilganda ochiladi.",
      ach_champion: "Chempion", ach_champion_desc: "Streakni 30 kunga yetkazganda ochiladi.",
      page_title: "Profil",
      toast_add_habit_redirect: "➕ Odat qo'shish uchun boshqaruv paneliga o'tasiz...",
      view_all: "Barchasini ko'rish",
    },
    ru: {
      nav_dashboard: "Панель", nav_rating: "Рейтинг", nav_profile: "Профиль", nav_settings: "Настройки",
      btn_add_habit: "Новая привычка",
      greeting: "Привет, {name}!",
      streak_suffix: "Стрик: {n} дней",
      badge_level: "{n}-й уровень",
      badge_title: "Мастер навыков",
      bio: "Разработчик, который любит работать над собой каждый день. Цель: довести дневной стрик до 30!",
      stat_streak: "Стрик", stat_skills: "Навыки", stat_friends: "Друзья",
      xp_title: "Уровень опыта", xp_subtitle: "До следующего уровня осталось {n} XP",
      achievements_title: "Достижения",
      ach_first_step: "Первый шаг", ach_first_step_desc: "Вы успешно выполнили свою первую привычку!",
      ach_water: "Питьё воды", ach_water_desc: "Вы пили воду 7 дней подряд.",
      ach_reader: "Книголюб", ach_reader_desc: "Вы провели за чтением 10 часов.",
      ach_athlete: "Спортсмен", ach_athlete_desc: "Вы тренировались 5 раз.",
      ach_meditation: "Мастер медитации", ach_meditation_desc: "Откроется после 30 дней медитации.",
      ach_cook: "Повар", ach_cook_desc: "Откроется после 15 раз приготовления еды дома.",
      ach_saver: "Бережливый", ach_saver_desc: "Откроется после месяца контроля бюджета.",
      ach_champion: "Чемпион", ach_champion_desc: "Откроется при стрике 30 дней.",
      page_title: "Профиль",
      toast_add_habit_redirect: "➕ Переход на панель для добавления привычки...",
      view_all: "Посмотреть все",
    },
    en: {
      nav_dashboard: "Dashboard", nav_rating: "Leaderboard", nav_profile: "Profile", nav_settings: "Settings",
      btn_add_habit: "New habit",
      greeting: "Hi, {name}!",
      streak_suffix: "{n}-day streak",
      badge_level: "Level {n}",
      badge_title: "Skill Master",
      bio: "A developer who loves working on himself every day. Goal: reach a 30-day daily streak!",
      stat_streak: "Streak", stat_skills: "Skills", stat_friends: "Friends",
      xp_title: "Experience level", xp_subtitle: "{n} XP left to next level",
      achievements_title: "Achievements",
      ach_first_step: "First Step", ach_first_step_desc: "You successfully completed your first habit!",
      ach_water: "Hydration", ach_water_desc: "You drank water 7 days in a row.",
      ach_reader: "Bookworm", ach_reader_desc: "You completed 10 hours of reading.",
      ach_athlete: "Athlete", ach_athlete_desc: "You completed 5 workout sessions.",
      ach_meditation: "Meditation Master", ach_meditation_desc: "Unlocks after 30 days of meditation.",
      ach_cook: "Chef", ach_cook_desc: "Unlocks after cooking at home 15 times.",
      ach_saver: "Saver", ach_saver_desc: "Unlocks after a month of budget tracking.",
      ach_champion: "Champion", ach_champion_desc: "Unlocks when your streak reaches 30 days.",
      page_title: "Profile",
      toast_add_habit_redirect: "➕ Redirecting to dashboard to add a habit...",
      view_all: "View all",
    },
  };

  let currentLang = localStorage.getItem(LANG_KEY) || 'uz';

  function t(key, vars = {}) {
    let str = (translations[currentLang] && translations[currentLang][key]) || translations.uz[key] || key;
    Object.keys(vars).forEach(k => { str = str.replace(`{${k}}`, vars[k]); });
    return str;
  }

  function isUsableAvatar(src) {
    return Boolean(src && !String(src).includes('Foydalanuvchi rasmi'));
  }

  function setProfileAvatar(src) {
    const avatarWrap = document.querySelector('.profile-avatar-wrap') || document.querySelector('.avatar-3d');
    if (!avatarWrap) return;

    let icon = avatarWrap.querySelector('.profile-avatar-icon');
    let img = avatarWrap.querySelector('.profile-avatar-img');

    if (!icon) {
      icon = document.createElement('i');
      icon.className = 'fa-solid fa-user profile-avatar-icon';
      avatarWrap.prepend(icon);
    }

    if (!img) {
      img = document.createElement('img');
      img.className = 'profile-avatar-img';
      img.alt = 'Profil rasmi';
      img.hidden = true;
      avatarWrap.appendChild(img);
    }

    function showIcon() {
      img.hidden = true;
      img.removeAttribute('src');
      icon.hidden = false;
    }

    if (!isUsableAvatar(src)) {
      showIcon();
      return;
    }

    img.onload = () => {
      img.hidden = false;
      icon.hidden = true;
    };
    img.onerror = showIcon;
    img.src = src;
  }

  // ─── 1. TILNI QO'LLASH ────────────────────────────────────────────
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.custom === 'true') return; // foydalanuvchi o'zi tahrirlagan matn
      el.textContent = t(el.dataset.i18n);
    });

    const greetEl = document.getElementById('welcome-greeting');
    if (greetEl) greetEl.textContent = t('greeting', { name: greetEl.dataset.name });

    const streakEl = document.getElementById('sidebar-streak-text');
    if (streakEl) streakEl.textContent = t('streak_suffix', { n: streakEl.dataset.days });

    const badgeLevelEl = document.getElementById('badge-level-text');
    if (badgeLevelEl) badgeLevelEl.textContent = t('badge_level', { n: badgeLevelEl.dataset.level });

    const barCurrent = document.getElementById('bar-label-current');
    if (barCurrent) barCurrent.textContent = t('badge_level', { n: barCurrent.dataset.level });

    const barNext = document.getElementById('bar-label-next');
    if (barNext) barNext.textContent = t('badge_level', { n: barNext.dataset.level });

    const xpSub = document.getElementById('xp-subtitle');
    if (xpSub) xpSub.textContent = t('xp_subtitle', { n: xpSub.dataset.remaining });

    const xpCounter = document.getElementById('xp-counter-text');
    if (xpCounter && xpCounter.dataset.current) xpCounter.textContent = `${xpCounter.dataset.current} / ${xpCounter.dataset.max} XP`;

    document.title = `${t('page_title')} | Streak.uz`;
  }

  // ─── 1.5 DYNAMIC USER PROFILE LOADING ─────────────────────────────
  async function loadUserProfile() {
    try {
      const { data: profile, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        const nameEl = document.querySelector('.profile-info h2');
        const bioEl = document.querySelector('.bio');
        const welcomeGreeting = document.getElementById('welcome-greeting');
        const sidebarStreakText = document.getElementById('sidebar-streak-text');
        const avatar3d = document.querySelector('.avatar-3d');
        const sidebarAvatar = document.querySelector('.user-welcome img');

        if (nameEl) nameEl.textContent = profile.full_name;
        if (bioEl && profile.bio) {
          bioEl.textContent = profile.bio;
          bioEl.dataset.custom = 'true';
        }

        setProfileAvatar(profile.avatar_url);

        const firstName = profile.full_name.split(' ')[0] || profile.full_name;
        if (welcomeGreeting) {
          welcomeGreeting.textContent = t('greeting', { name: firstName });
          welcomeGreeting.dataset.name = firstName;
        }

        const streak = profile.streak !== undefined ? profile.streak : 0;
        if (sidebarStreakText) {
          sidebarStreakText.textContent = t('streak_suffix', { n: streak });
          sidebarStreakText.dataset.days = streak;
        }

        if (sidebarAvatar && profile.avatar_url) {
          sidebarAvatar.src = profile.avatar_url;
        }

        // Update streak display box
        const statBoxes = document.querySelectorAll('.stat-box');
        if (statBoxes[0]) {
          statBoxes[0].querySelector('.value').innerHTML = `<i class="fa-solid fa-fire"></i> ${streak}`;
        }

        // Update Level, XP progress
        const xp = profile.xp !== undefined ? profile.xp : 0;
        const level = Math.floor(xp / 1000) + 1;
        const currentLevelXp = xp % 1000;
        const maxXp = 1000;

        const badgeLevelText = document.getElementById('badge-level-text');
        if (badgeLevelText) {
          badgeLevelText.textContent = t('badge_level', { n: level });
          badgeLevelText.dataset.level = level;
        }

        const barLabelCurrent = document.getElementById('bar-label-current');
        if (barLabelCurrent) {
          barLabelCurrent.textContent = t('badge_level', { n: level });
          barLabelCurrent.dataset.level = level;
        }

        const barLabelNext = document.getElementById('bar-label-next');
        if (barLabelNext) {
          barLabelNext.textContent = t('badge_level', { n: level + 1 });
          barLabelNext.dataset.level = level + 1;
        }

        const xpSub = document.getElementById('xp-subtitle');
        if (xpSub) {
          const remaining = maxXp - currentLevelXp;
          xpSub.textContent = t('xp_subtitle', { n: remaining });
          xpSub.dataset.remaining = remaining;
        }

        const xpCounter = document.getElementById('xp-counter-text');
        if (xpCounter) {
          xpCounter.textContent = `${currentLevelXp} / ${maxXp} XP`;
          xpCounter.dataset.current = currentLevelXp;
          xpCounter.dataset.max = maxXp;
        }

        // Trigger XP bar animation
        animateXpBar();
      }
    } catch (err) {
      console.error("Profile load failed:", err);
    }

    // 2. Fetch habits count
    try {
      const { count, error } = await sb
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      if (!error && count !== null) {
        const statBoxes = document.querySelectorAll('.stat-box');
        if (statBoxes[1]) {
          statBoxes[1].querySelector('.value').innerHTML = `<i class="fa-solid fa-bolt"></i> ${count}`;
        }
      }
    } catch (err) {
      console.error("Habits count query failed:", err);
    }

    // 3. Fetch friends count (from friendships table)
    try {
      const { count, error } = await sb
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      if (!error && count !== null) {
        const statBoxes = document.querySelectorAll('.stat-box');
        if (statBoxes[2]) {
          statBoxes[2].querySelector('.value').innerHTML = `<i class="fa-solid fa-users"></i> ${count}`;
        }
      }
    } catch (err) {
      console.error("Friends count query failed:", err);
    }
  }

  // ─── 2. SIDEBAR TOGGLE (mobil) ───────────────────────────────────
  const sidebar      = document.querySelector('.sidebar');
  const backdrop      = document.querySelector('.sidebar-backdrop');
  const menuToggle     = document.querySelector('.menu-toggle');
  const sidebarClose   = document.querySelector('.sidebar-close');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    backdrop?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    backdrop?.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (menuToggle)   menuToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (backdrop)     backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) closeSidebar();
  });

  // ─── 3. MENYU — FAOL LINK ─────────────────────────────────────────
  const menuItems = document.querySelectorAll('.menu-list .menu-item a');
  menuItems.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') e.preventDefault();
      menuItems.forEach(l => l.closest('.menu-item').classList.remove('active'));
      this.closest('.menu-item').classList.add('active');
      if (window.innerWidth < 1024) closeSidebar();
    });
  });

  // ─── 4. "YANGI ODAT" TUGMASI ──────────────────────────────────────
  const addHabitBtn = document.querySelector('.btn-add-habit');
  if (addHabitBtn) {
    addHabitBtn.addEventListener('click', () => {
      showToast(t('toast_add_habit_redirect'), 'info');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
    });
  }

  // ─── 5. XP PROGRESS BAR — ANIMATSIYA ─────────────────────────────
  function animateXpBar() {
    const barFill   = document.querySelector('.bar-container .bar-fill');
    const xpCounter = document.getElementById('xp-counter-text');
    if (!barFill) return;

    let percent = 0;
    if (xpCounter) {
      const current = parseInt(xpCounter.dataset.current, 10);
      const max     = parseInt(xpCounter.dataset.max, 10);
      if (max > 0) percent = Math.min(100, Math.round((current / max) * 100));
    }

    barFill.style.width      = '0%';
    barFill.style.transition = 'width 1.2s ease';
    requestAnimationFrame(() => {
      setTimeout(() => { barFill.style.width = `${percent}%`; }, 150);
    });
  }

  // ─── 6. YUTUQLAR (ACHIEVEMENTS) ──────────────────────────────────
  document.querySelectorAll('.badge-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const p = item.querySelector('p[data-i18n]');
      if (!p) return;
      const key   = p.dataset.i18n;
      const title = t(key);
      const desc  = t(`${key}_desc`);

      if (item.classList.contains('locked')) {
        showToast(`🔒 "${title}": ${desc}`, 'warning');
        item.style.animation = 'shakeBadge 0.4s ease';
        setTimeout(() => { item.style.animation = ''; }, 400);
      } else {
        showToast(`🏆 "${title}": ${desc}`, 'success');
        const box = item.querySelector('.badge-icon-box');
        if (box) {
          box.style.transform = 'scale(1.15)';
          setTimeout(() => { box.style.transform = 'scale(1)'; }, 250);
        }
      }
    });
  });

  function getInitials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  // ─── 7. TOAST BILDIRISHNOMA (tepa o'ng tomondan) ────────────────
  function showToast(message, type = 'info', duration = 3000) {
    if (typeof Toastify !== 'undefined') {
      const bgMap = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        error:   'linear-gradient(135deg, #ef4444, #dc2626)',
        info:    'linear-gradient(135deg, #6366f1, #4f46e5)',
      };
      Toastify({
        text: message,
        duration,
        gravity: 'top',
        position: 'right',
        style: { background: bgMap[type] || bgMap.info, borderRadius: '12px', fontFamily: '"Comic Sans MS", "Comic Sans", cursive', color: '#000' },
        stopOnFocus: true,
      }).showToast();
    } else {
      showCustomToast(message, type, duration);
    }
  }

  function showCustomToast(message, type, duration) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed; top: 24px; right: 24px;
        display: flex; flex-direction: column; gap: 10px;
        z-index: 9999; pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const colorMap = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#6366f1' };

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${colorMap[type] || colorMap.info};
      color: #000; padding: 12px 20px;
      border-radius: 12px; font-family: "Comic Sans MS", "Comic Sans", cursive;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      max-width: 320px; pointer-events: all;
      transform: translateX(120%); transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  // ─── 8. KARTOCHKALAR — KIRISH ANIMATSIYASI ──────────────────────
  document.querySelectorAll('.creative-card').forEach((card, idx) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 80 * idx);
  });

  // ─── ISHGA TUSHIRISH ──────────────────────────────────────────────
  applyLanguage(currentLang);
  setProfileAvatar(currentUser.avatar_url);
  loadUserProfile();

  console.log('✅ Streak.uz Profil sahifasi yuklandi.');
});
