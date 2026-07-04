// =============================================
//  Streak.uz Dashboard — dashboard.js
//  Duolingo-style: 3D tugmalar, konfetti, progress ring
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // Supabase Configuration
  const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // ─── 0. USER STATE INITIALIZATION ────────────────────────────────
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const headerGreeting = document.getElementById('dashboard-greeting');
  if (headerGreeting && currentUser.full_name) {
    const hour = new Date().getHours();
    let greeting = 'Salom';
    if (hour < 12) greeting = 'Xayrli tong';
    else if (hour < 18) greeting = 'Xayrli kun';
    else greeting = 'Xayrli kech';
    const firstName = currentUser.full_name.split(' ')[0];
    headerGreeting.textContent = `${greeting}, ${firstName}! 👋`;
  }

  // ─── 1. SIDEBAR TOGGLE ───────────────────────────────────────────
  const sidebar      = document.querySelector('.sidebar');
  const backdrop     = document.querySelector('.sidebar-backdrop');
  const menuToggle   = document.querySelector('.menu-toggle');
  const sidebarClose = document.querySelector('.sidebar-close');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    document.body.classList.add('sidebar-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.classList.remove('sidebar-open');
    document.body.style.overflow = '';
  }

  if (menuToggle)   menuToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (backdrop)     backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // ─── 2. NAV MENU — ACTIVE LINK ───────────────────────────────────
  const navLinks = document.querySelectorAll('.menu-list .menu-item a');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') e.preventDefault();
      document.querySelectorAll('.menu-list .menu-item').forEach(li => li.classList.remove('active'));
      this.closest('.menu-item').classList.add('active');
      if (window.innerWidth < 1024) closeSidebar();
    });
  });

  // ─── 3. PROGRESS RING (circular) ─────────────────────────────────
  const RING_CIRCUMFERENCE = 2 * Math.PI * 68; // ≈ 427
  const ringFill = document.getElementById('ring-fill');
  const ringCount = document.getElementById('ring-count');

  function setRingProgress(done, total) {
    if (!ringFill) return;
    const percent = total > 0 ? done / total : 0;
    const offset = RING_CIRCUMFERENCE * (1 - percent);
    ringFill.style.strokeDasharray = RING_CIRCUMFERENCE;
    ringFill.style.strokeDashoffset = offset;
    if (ringCount) ringCount.textContent = `${done}/${total}`;
  }

  // ─── 4. HABIT CARDS — SUPABASE SYNC ────────────────────────────────
  const colorBgMap = {
    purple: 'linear-gradient(90deg, var(--primary), #9d6bff)',
    blue:   'linear-gradient(90deg, var(--blue), #60a5fa)',
    green:  'linear-gradient(90deg, var(--green), #34d399)',
    orange: 'linear-gradient(90deg, var(--orange), #fbbf24)',
  };

  const btnClassMap = {
    purple: 'purple-3d',
    blue:   'blue-3d',
    green:  'green-3d',
    orange: 'orange-3d',
  };

  let localHabits = [];

  // Update streak progress count dynamically
  function updateStreakProgress() {
    const total = document.querySelectorAll('.habits-grid .card').length;
    const doneCount = document.querySelectorAll('.habits-grid .card.done').length;
    
    setRingProgress(doneCount, total);

    if (doneCount === total && total > 0) {
      setTimeout(() => {
        showToast('🎉 Tabriklaymiz! Bugungi barcha odatlar bajarildi!', 'success', 4500);
        launchConfetti();
        addXp(50); // Bonus XP
      }, 600);
    }
  }

  // Render a single habit card
  function renderHabitCard(habit) {
    const grid = document.querySelector('.habits-grid');
    if (!grid) return;

    let meta = { desc: '', color: 'purple', time: '—', is_done: false };
    try {
      if (habit.description && (habit.description.startsWith('{') || habit.description.startsWith('['))) {
        meta = JSON.parse(habit.description);
      } else {
        meta.desc = habit.description || '';
      }
    } catch(e) {
      meta.desc = habit.description || '';
    }

    const isDone = meta.is_done;
    const color = meta.color || 'purple';
    const time = meta.time || '—';
    const desc = meta.desc || '';
    const title = habit.title || '';
    const icon = habit.icon || '⭐';

    const card = document.createElement('div');
    card.className = `card ${color} ${isDone ? 'done' : ''}`;
    card.dataset.habitId = habit.id;

    const progressWidth = isDone ? '100%' : '0%';
    const progressBg = isDone ? `background: ${colorBgMap[color]};` : '';
    
    let footerActionHTML = `<button class="btn-3d-small ${btnClassMap[color] || 'purple-3d'}">Bajar</button>`;
    if (isDone) {
      footerActionHTML = `<span class="status-text"><i class="fa-solid fa-circle-check"></i> Bajarildi</span>`;
    }

    card.innerHTML = `
      <div class="card-top-accent"></div>
      <div class="card-header">
        <div class="card-icon-wrap ${color}-bg">
          <span class="card-icon">${escapeHtml(icon)}</span>
        </div>
        <span class="card-badge"><i class="fa-solid fa-clock"></i> ${escapeHtml(time)}</span>
      </div>
      <div class="card-content">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(desc)}</p>
      </div>
      <div class="card-footer">
        <div class="habit-progress-bg">
          <div class="habit-progress-fill" style="width: ${progressWidth}; ${progressBg}"></div>
        </div>
        ${footerActionHTML}
      </div>
    `;

    grid.appendChild(card);

    // Card container click redirects to detail page
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-3d-small') || e.target.closest('.status-text')) {
        return;
      }
      window.location.href = `./habitdetail.html?id=${habit.id}&title=${encodeURIComponent(title)}&icon=${encodeURIComponent(icon)}&time=${encodeURIComponent(time)}`;
    });

    const btn = card.querySelector('.btn-3d-small');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card container click
        completeHabit(habit.id, card, color, title);
      });
    }
  }

  // Complete habit
  async function completeHabit(habitId, card, color, title) {
    if (card.classList.contains('done')) return;

    // UI Updates
    const fill = card.querySelector('.habit-progress-fill');
    if (fill) {
      fill.style.width = '100%';
      fill.style.background = colorBgMap[color];
    }
    const btn = card.querySelector('.btn-3d-small');
    if (btn) {
      const statusSpan = document.createElement('span');
      statusSpan.className = 'status-text';
      statusSpan.innerHTML = '<i class="fa-solid fa-circle-check"></i> Bajarildi';
      btn.replaceWith(statusSpan);
    }
    card.classList.add('done');
    card.style.transform = 'scale(1.05)';
    setTimeout(() => { card.style.transform = ''; }, 250);

    updateStreakProgress();
    launchConfetti(card);
    addXp(20);
    updateQuestProgress(1);
    showToast(`✅ "${title}" bajarildi! +20 XP`, 'success');

    // DB Updates
    const habit = localHabits.find(h => h.id === habitId);
    if (habit) {
      let meta = { desc: '', color: 'purple', time: '—', is_done: false };
      try {
        meta = JSON.parse(habit.description);
      } catch(e) {
        meta.desc = habit.description || '';
      }
      meta.is_done = true;
      habit.description = JSON.stringify(meta);

      try {
        await sb.from('habits').update({ description: habit.description }).eq('id', habitId);
      } catch(err) {
        console.error("Habit status update failed:", err);
      }
    }
  }

  // Load habits from Supabase
  async function loadHabits() {
    const grid = document.querySelector('.habits-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear default static HTML cards

    try {
      const { data, error } = await sb
        .from('habits')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed default habits
        const defaultHabits = [
          { title: "Ingliz tili", description: JSON.stringify({ desc: "Lug'at yodlash", color: "purple", time: "15 min", is_done: true }), icon: "⭐" },
          { title: "Dasturlash", description: JSON.stringify({ desc: "JavaScript o'rganish", color: "blue", time: "2 soat", is_done: false }), icon: "💻" },
          { title: "Sport", description: JSON.stringify({ desc: "Yugurish", color: "green", time: "30 min", is_done: false }), icon: "🏃" },
          { title: "Kitob mutolaasi", description: JSON.stringify({ desc: "\"Atomic Habits\"", color: "orange", time: "20 bet", is_done: true }), icon: "📚" }
        ].map(h => ({ ...h, user_id: currentUser.id }));

        const { data: seeded, error: seedError } = await sb.from('habits').insert(defaultHabits).select();
        if (seedError) throw seedError;
        localHabits = seeded || [];
      } else {
        localHabits = data;
      }

      localHabits.forEach(renderHabitCard);
      updateStreakProgress();

    } catch(err) {
      console.error("Load habits failed:", err);
      showToast("⚠️ Odatlarni yuklashda xatolik yuz berdi", "error");
    }
  }

  // Load user profile stats from Supabase
  async function loadUserProfile() {
    try {
      const { data: profile, error } = await sb.from('profiles').select('xp, gems, streak').eq('id', currentUser.id).single();
      if (!error && profile) {
        if (profile.xp !== undefined && profile.xp !== null) {
          currentXp = profile.xp;
          localStorage.setItem('streak_xp', currentXp);
        }
        if (profile.gems !== undefined && profile.gems !== null) {
          currentGems = profile.gems;
          localStorage.setItem('streak_gems', currentGems);
        }
        updateXpDisplay();
      }
    } catch(e) {}
  }

  // Load everything
  loadUserProfile().then(() => loadHabits());

  // ─── 6. XP & GEMS ────────────────────────────────────────────────
  let currentXp = parseInt(localStorage.getItem('streak_xp') || '120', 10);
  let currentGems = parseInt(localStorage.getItem('streak_gems') || '540', 10);

  const xpEl = document.getElementById('topbar-xp');
  const gemsEl = document.getElementById('topbar-gems');

  function updateXpDisplay() {
    if (xpEl) xpEl.textContent = `${currentXp} XP`;
    if (gemsEl) gemsEl.textContent = currentGems;
    localStorage.setItem('streak_xp', currentXp);
    localStorage.setItem('streak_gems', currentGems);
  }

  async function syncUserStatsToDb() {
    try {
      await sb.from('profiles').update({
        xp: currentXp,
        gems: currentGems
      }).eq('id', currentUser.id);
    } catch(err) {
      console.error("Stats sync to database failed:", err);
    }
  }

  function addXp(amount) {
    const oldXp = currentXp;
    currentXp += amount;
    animateCounter(xpEl, oldXp, currentXp, (v) => `${v} XP`);

    // Har 50 XP uchun +5 tanga
    if (Math.floor(currentXp / 50) > Math.floor(oldXp / 50)) {
      currentGems += 5;
      animateCounter(gemsEl, currentGems - 5, currentGems, (v) => v);
    }
    localStorage.setItem('streak_xp', currentXp);
    localStorage.setItem('streak_gems', currentGems);
    syncUserStatsToDb();
  }

  function animateCounter(el, from, to, formatter) {
    if (!el) return;
    const duration = 600;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(from + (to - from) * progress);
      el.textContent = formatter(value);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  updateXpDisplay();

  // ─── 7. QUEST PROGRESS ───────────────────────────────────────────
  let questCurrent = 0;
  const questTotal = 3;
  const questBar = document.getElementById('quest-bar');
  const questCurrentEl = document.getElementById('quest-current');

  function updateQuestProgress(increment = 0) {
    questCurrent = Math.min(questCurrent + increment, questTotal);
    if (questBar) {
      const percent = (questCurrent / questTotal) * 100;
      questBar.style.width = `${percent}%`;
    }
    if (questCurrentEl) questCurrentEl.textContent = questCurrent;

    if (questCurrent === questTotal) {
      setTimeout(() => {
        showToast('🏆 Kunlik vazifa bajarildi! +50 tanga bonus!', 'success', 4000);
        currentGems += 50;
        animateCounter(gemsEl, currentGems - 50, currentGems, (v) => v);
        localStorage.setItem('streak_gems', currentGems);
        launchConfetti();
        syncUserStatsToDb();
      }, 800);
    }
  }

  // ─── 8. HERO CONTINUE BUTTON ─────────────────────────────────────
  const heroContinueBtn = document.getElementById('hero-continue-btn');
  if (heroContinueBtn) {
    heroContinueBtn.addEventListener('click', () => {
      // Birinchi bajarilmagan odatni topib scroll qilamiz
      const firstUndone = document.querySelector('.habits-grid .card:not(.done)');
      if (firstUndone) {
        firstUndone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstUndone.style.boxShadow = '0 0 0 4px rgba(112,0,255,0.3), 0 14px 28px rgba(0,0,0,0.1)';
        setTimeout(() => { firstUndone.style.boxShadow = ''; }, 2000);
        const btn = firstUndone.querySelector('.btn-3d-small');
        if (btn) {
          btn.style.animation = 'firePulse 0.6s ease-in-out 3';
        }
      } else {
        showToast('🎉 Bugungi barcha odatlar allaqachon bajarilgan!', 'success');
        launchConfetti();
      }
    });
  }

  // ─── 9. "YANGI ODAT+" TUGMASI ────────────────────────────────────
  const addHabitBtn = document.querySelector('.btn-add-habit');
  if (addHabitBtn) {
    addHabitBtn.addEventListener('click', () => {
      showModal();
    });
  }

  // Handle global redirect from other pages for adding a habit
  const urlParams = new URLSearchParams(window.location.search);
  const habitDraftFromUrl = {
    name: urlParams.get('title') || urlParams.get('name') || '',
    desc: urlParams.get('desc') || urlParams.get('description') || '',
    time: urlParams.get('time') || '',
    color: urlParams.get('color') || '',
    place: urlParams.get('place') || '',
    lat: urlParams.get('lat') || '',
    lng: urlParams.get('lng') || '',
    source: urlParams.get('source') || ''
  };

  if (urlParams.get('addHabit') === 'true') {
    setTimeout(() => {
      showModal();
    }, 300);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // ─── 10. MODAL — YANGI ODAT QO'SHISH ─────────────────────────────
  function createModal() {
    if (document.getElementById('habit-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'habit-modal';
    modal.className = 'habit-modal-overlay';
    modal.innerHTML = `
      <div class="habit-modal-box">
        <div class="habit-modal-header">
          <h3><i class="fa-solid fa-plus-circle"></i> Yangi odat qo'shish</h3>
          <button class="modal-close-btn" aria-label="Yopish">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="habit-modal-body">
          <div class="form-group">
            <label><i class="fa-solid fa-tag"></i> Odat nomi</label>
            <input type="text" id="habit-name-input" placeholder="Masalan: Meditatsiya" maxlength="40">
          </div>
          <div class="form-group">
            <label><i class="fa-solid fa-align-left"></i> Tavsif</label>
            <input type="text" id="habit-desc-input" placeholder="Masalan: 10 daqiqa tinlanish" maxlength="50">
          </div>
          <div class="form-group">
            <label><i class="fa-solid fa-clock"></i> Vaqt / Miqdor</label>
            <input type="text" id="habit-time-input" placeholder="Masalan: 10 min" maxlength="15">
          </div>
          <div class="form-group">
            <label><i class="fa-solid fa-palette"></i> Rang tanlang</label>
            <div class="color-picker">
              <button class="color-option purple selected" data-color="purple" title="Binafsha"><i class="fa-solid fa-star"></i></button>
              <button class="color-option blue" data-color="blue" title="Ko'k"><i class="fa-solid fa-lightbulb"></i></button>
              <button class="color-option green" data-color="green" title="Yashil"><i class="fa-solid fa-leaf"></i></button>
              <button class="color-option orange" data-color="orange" title="To'q sariq"><i class="fa-solid fa-fire"></i></button>
            </div>
          </div>
        </div>
        <div class="habit-modal-footer">
          <button class="btn-modal-cancel">Bekor qilish</button>
          <button class="btn-modal-save"><i class="fa-solid fa-check"></i> Saqlash</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    injectModalStyles();

    let selectedColor = 'purple';
    modal.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', function () {
        modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
      });
    });

    modal.querySelector('.modal-close-btn').addEventListener('click', hideModal);
    modal.querySelector('.btn-modal-cancel').addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });

    modal.querySelector('.btn-modal-save').addEventListener('click', async () => {
      const name = document.getElementById('habit-name-input').value.trim();
      const desc = document.getElementById('habit-desc-input').value.trim();
      const time = document.getElementById('habit-time-input').value.trim();

      if (!name) {
        showToast('⚠️ Odat nomini kiriting!', 'warning');
        document.getElementById('habit-name-input').focus();
        return;
      }

      const saveBtn = modal.querySelector('.btn-modal-save');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';

      try {
        const descriptionObj = {
          desc: desc,
          color: selectedColor,
          time: time || '—',
          is_done: false
        };

        const newHabit = {
          user_id: currentUser.id,
          title: name,
          description: JSON.stringify(descriptionObj),
          icon: iconMap[selectedColor] || '⭐'
        };

        const { data, error } = await sb.from('habits').insert([newHabit]).select();
        if (error) throw error;

        if (data && data.length > 0) {
          localHabits.push(data[0]);
          renderHabitCard(data[0]);
          updateStreakProgress();
        }

        hideModal();
        showToast(`➕ "${name}" odati qo'shildi!`, 'success');
      } catch (err) {
        console.error("Habit insert failed:", err);
        showToast("⚠️ Odatni saqlashda xatolik yuz berdi", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saqlash';
      }
    });
  }

  function showModal() {
    createModal();
    const modal = document.getElementById('habit-modal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      applyHabitDraftToModal();
      setTimeout(() => {
        document.getElementById('habit-name-input')?.focus();
      }, 200);
    }
  }

  function applyHabitDraftToModal() {
    if (!habitDraftFromUrl.name && !habitDraftFromUrl.desc && !habitDraftFromUrl.time && !habitDraftFromUrl.place) return;

    const nameInput = document.getElementById('habit-name-input');
    const descInput = document.getElementById('habit-desc-input');
    const timeInput = document.getElementById('habit-time-input');

    if (nameInput && habitDraftFromUrl.name) nameInput.value = habitDraftFromUrl.name;
    if (descInput) {
      const locationBits = [];
      if (habitDraftFromUrl.place) locationBits.push(`Joy: ${habitDraftFromUrl.place}`);
      if (habitDraftFromUrl.lat && habitDraftFromUrl.lng) locationBits.push(`Koordinata: ${habitDraftFromUrl.lat}, ${habitDraftFromUrl.lng}`);
      const desc = [habitDraftFromUrl.desc, ...locationBits].filter(Boolean).join(' | ');
      if (desc) descInput.value = desc.slice(0, descInput.maxLength || 50);
    }
    if (timeInput && habitDraftFromUrl.time) timeInput.value = habitDraftFromUrl.time;

    if (habitDraftFromUrl.color) {
      const colorBtn = document.querySelector(`.color-option.${CSS.escape(habitDraftFromUrl.color)}`);
      if (colorBtn) colorBtn.click();
    }
  }

  function hideModal() {
    const modal = document.getElementById('habit-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      ['habit-name-input','habit-desc-input','habit-time-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
      modal.querySelector('.color-option.purple')?.classList.add('selected');
    }
  }

  // ─── 11. ICON MAP ────────────────────────────────────────────────
  const iconMap = {
    purple: '⭐',
    blue:   '💡',
    green:  '🌿',
    orange: '🎯',
  };

  // ─── 12. INVITE FRIENDS ──────────────────────────────────────────
  const inviteBtn = document.getElementById('invite-friends-btn');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => {
      const shareUrl = window.location.href.replace('dashboard.html', 'index.html');
      if (navigator.share) {
        navigator.share({
          title: 'Streak.uz',
          text: 'Men Streak.uz da odatlarimni kuzatyapman. Sen ham qo\'shil!',
          url: shareUrl,
        }).catch(() => {});
      } else {
        const dummy = document.createElement('input');
        dummy.value = shareUrl;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        dummy.remove();
        showToast('🔗 Havola nusxalandi! Do\'stingizga yuboring.', 'info');
      }
    });
  }

  // ─── 13. CONFETTI ANIMATION ──────────────────────────────────────
  function launchConfetti(originEl) {
    const container = document.getElementById('confetti-container') || createConfettiContainer();
    const colors = ['#7000ff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ffce00'];
    const pieces = 40;

    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;
    if (originEl) {
      const rect = originEl.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }

    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 8;
      const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.5;
      const velocity = 100 + Math.random() * 150;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 100;
      const rotation = Math.random() * 720;

      piece.style.cssText = `
        position: fixed;
        left: ${originX}px;
        top: ${originY}px;
        width: ${size}px;
        height: ${size * (Math.random() > 0.5 ? 1 : 0.4)}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform 1.5s cubic-bezier(0.15, 0.65, 0.55, 1), opacity 1.5s ease;
      `;
      container.appendChild(piece);

      requestAnimationFrame(() => {
        piece.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 600}px)) rotate(${rotation}deg)`;
        piece.style.opacity = '0';
      });

      setTimeout(() => piece.remove(), 1600);
    }
  }

  function createConfettiContainer() {
    const c = document.createElement('div');
    c.id = 'confetti-container';
    document.body.appendChild(c);
    return c;
  }

  // ─── 14. TOAST ───────────────────────────────────────────────────
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
        style: {
          background: bgMap[type] || bgMap.info,
          borderRadius: '14px',
          fontFamily: '"Nunito", "Comic Sans MS", cursive',
          color: '#fff',
          fontWeight: '700',
          fontSize: '14px',
          padding: '12px 20px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        },
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

    const colorMap = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      error:   'linear-gradient(135deg, #ef4444, #dc2626)',
      info:    'linear-gradient(135deg, #6366f1, #4f46e5)',
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${colorMap[type] || colorMap.info};
      color: #fff; padding: 12px 20px;
      border-radius: 14px; font-family: "Nunito", "Comic Sans MS", cursive;
      font-size: 14px; font-weight: 700;
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
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

  // ─── 15. MODAL STYLES ────────────────────────────────────────────
  function injectModalStyles() {
    if (document.getElementById('modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      .habit-modal-overlay {
        display: none;
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1100;
        align-items: center; justify-content: center;
        padding: 16px;
        opacity: 0;
        transition: opacity 0.25s ease;
      }
      .habit-modal-overlay.open {
        display: flex;
        opacity: 1;
      }

      .habit-modal-box {
        background: #ffffff;
        border-radius: 24px;
        width: 100%; max-width: 460px;
        padding: 28px;
        transform: scale(0.92) translateY(20px);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 25px 70px rgba(0,0,0,0.35);
        color: #162033;
      }
      .habit-modal-overlay.open .habit-modal-box {
        transform: scale(1) translateY(0);
      }

      .habit-modal-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 22px;
      }
      .habit-modal-header h3 {
        font-size: 19px; font-weight: 900;
        display: flex; align-items: center; gap: 8px;
      }
      .habit-modal-header h3 i {
        color: var(--primary, #7000ff);
      }
      .modal-close-btn {
        background: #f3f4f6; border: none; cursor: pointer;
        color: #67748a;
        font-size: 14px; width: 34px; height: 34px;
        border-radius: 10px; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
      }
      .modal-close-btn:hover {
        background: #ef4444; color: white; transform: rotate(90deg);
      }

      .habit-modal-body .form-group { margin-bottom: 18px; }
      .habit-modal-body label {
        display: block; font-size: 13px; font-weight: 800;
        color: #67748a;
        margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;
      }
      .habit-modal-body label i { color: var(--primary); margin-right: 4px; }

      .habit-modal-body input {
        width: 100%; padding: 12px 16px;
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 14px;
        color: #162033;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        outline: none; transition: all 0.2s;
        box-sizing: border-box;
      }
      .habit-modal-body input:focus {
        border-color: var(--primary);
        background: white;
        box-shadow: 0 0 0 4px rgba(112,0,255,0.1);
      }

      .color-picker {
        display: flex; gap: 12px;
      }
      .color-option {
        width: 44px; height: 44px; border-radius: 14px;
        border: 3px solid transparent; cursor: pointer;
        transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
        color: white;
        font-size: 18px;
      }
      .color-option:hover { transform: scale(1.1); }
      .color-option.selected {
        border-color: #162033;
        transform: scale(1.15);
        box-shadow: 0 6px 14px rgba(0,0,0,0.15);
      }
      .color-option.purple { background: linear-gradient(135deg, #7000ff, #9d6bff); }
      .color-option.blue   { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
      .color-option.green  { background: linear-gradient(135deg, #10b981, #34d399); }
      .color-option.orange { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

      .habit-modal-footer {
        display: flex; gap: 12px; margin-top: 26px;
      }
      .btn-modal-cancel {
        padding: 12px 22px; border-radius: 14px;
        background: #f3f4f6;
        border: none; color: #67748a;
        font-family: inherit;
        font-weight: 800;
        font-size: 14px;
        cursor: pointer; transition: all 0.2s;
        flex: 1;
        box-shadow: 0 4px 0 #d1d5db;
      }
      .btn-modal-cancel:hover { background: #e5e7eb; }
      .btn-modal-cancel:active {
        transform: translateY(2px);
        box-shadow: 0 2px 0 #d1d5db;
      }
      .btn-modal-save {
        padding: 12px 22px; border-radius: 14px;
        background: linear-gradient(180deg, var(--primary), #5b21b6);
        border: none; color: #fff;
        font-family: inherit;
        font-weight: 800;
        font-size: 14px;
        cursor: pointer; transition: all 0.15s;
        flex: 1;
        box-shadow: 0 5px 0 var(--primary-dark), 0 8px 16px rgba(112,0,255,0.25);
        display: flex; align-items: center; justify-content: center; gap: 6px;
      }
      .btn-modal-save:hover {
        transform: translateY(-2px);
        box-shadow: 0 7px 0 var(--primary-dark), 0 10px 18px rgba(112,0,255,0.3);
      }
      .btn-modal-save:active {
        transform: translateY(3px);
        box-shadow: 0 2px 0 var(--primary-dark);
      }

      .sidebar {
        height: 100vh !important;
        min-height: 100vh;
      }
      .sidebar.open {
        transform: translateX(0) !important;
      }
      .sidebar-backdrop.show {
        display: block !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  injectModalStyles();

  // ─── 16. SIDEBAR BACKDROP ────────────────────────────────────────
  if (backdrop) {
    backdrop.style.cssText += `
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 998;
      opacity: 0;
      transition: opacity 0.3s;
    `;
  }

  // ─── 17. ESCAPE HTML ─────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─── 18. RESIZE — CLOSE SIDEBAR ──────────────────────────────────
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) closeSidebar();
  });

  // ─── 19. QUEST TIMER (countdown) ─────────────────────────────────
  const questTimerEl = document.getElementById('quest-timer');
  let questSecondsLeft = 8 * 3600 + 23 * 60; // 8 soat 23 daqiqa

  function updateQuestTimer() {
    if (!questTimerEl) return;
    const h = Math.floor(questSecondsLeft / 3600);
    const m = Math.floor((questSecondsLeft % 3600) / 60);
    questTimerEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${h} soat ${m} min`;
    if (questSecondsLeft > 0) questSecondsLeft--;
  }

  updateQuestTimer();
  setInterval(updateQuestTimer, 60000);

  // ─── 20. ENTRY ANIMATIONS ────────────────────────────────────────
  // Ring animatsiyasi
  setTimeout(() => {
    updateStreakProgress();
  }, 300);

  // Streak fire animation pulse
  const streakPill = document.querySelector('.stat-fire');
  if (streakPill) {
    streakPill.addEventListener('mouseenter', () => {
      streakPill.style.transform = 'translateY(-4px) scale(1.05)';
    });
    streakPill.addEventListener('mouseleave', () => {
      streakPill.style.transform = '';
    });
  }

  console.log('✅ Streak.uz Dashboard (Duolingo style) yuklandi.');
});
