// ============================================================
//  Streak.uz — AI Kunlik Vazifalar (ai.js)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ==================== STATE ====================
  const state = {
    mood: null,            // tanlangan emoji index
    tasks: [
      { id: 'english',  done: false, timerRunning: false, seconds: 0, interval: null },
      { id: 'coding',   done: false, timerRunning: false, seconds: 0, interval: null },
      { id: 'reading',  done: true,  timerRunning: false, seconds: 0, interval: null },
      { id: 'sport',    done: false, timerRunning: false, seconds: null, interval: null },
    ],
    activeNav: 'today',
    allDoneAnimated: false,
  };

  // ==================== ELEMENTS ====================
  const emojiRow     = document.querySelector('.emoji-row');
  const emojis       = emojiRow ? emojiRow.querySelectorAll('span') : [];
  const finishBtn    = document.querySelector('.finish-btn');
  const navItems     = document.querySelectorAll('.nav-item');
  const ring         = document.querySelector('.ring');
  const ringInner    = document.querySelector('.ring-inner');
  const momentumBadge = document.querySelector('.momentum-badge');
  const insightDesc  = document.querySelector('.insight-card .desc');
  const insightQ     = document.querySelector('.insight-card .question');
  const taskCards    = document.querySelectorAll('.task-card');
  const scheduleItems = document.querySelectorAll('.schedule-item');
  const headerIcons  = document.querySelectorAll('.header-icons .icon-btn');

  // ==================== 1. EMOJI MOOD ====================
  emojis.forEach((span, i) => {
    span.addEventListener('click', () => {
      // oldini tozalash
      emojis.forEach(s => {
        s.style.transform = '';
        s.style.background = '';
        s.style.borderRadius = '';
      });
      // tanlanganni belgilash
      state.mood = i;
      span.style.transform = 'scale(1.3) translateY(-4px)';
      span.style.background = 'rgba(109,74,255,0.12)';
      span.style.borderRadius = '12px';

      // AI javobini yangilash
      const moods = [
        'Hmm, charchagansiz. Bugun eng muhim 2 ta vazifaga e\'tibor qarataylik.',
        'O\'rtacha holat. Yengil boshladik, asta-sekin oshiramiz!',
        'Yaxshi kayfiyat! Barcha vazifalarni bajarishga tayyormiz.',
        'Ajoyib energiya! Bugun qiyin vazifalarni ham bajarish mumkin.',
        'Raketkaga o\'xshaysiz! Maksimal natija kunidan biri bugun.',
      ];
      if (insightDesc) {
        insightDesc.textContent = moods[i] || moods[2];
      }
      if (insightQ) {
        insightQ.style.display = 'none';
      }
      if (emojiRow) {
        emojiRow.style.display = 'none';
      }

      // toast
      showToast('Kayfiyat qabul qilindi ✨');
    });
  });

  // ==================== 2. TASK CARDS — TAYMER & BOSHLASH ====================
  taskCards.forEach((card) => {
    const btn = card.querySelector('.task-btn');
    const checkCircle = card.querySelector('.check-circle');

    // --- Taymer tugmalari ---
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = getTaskId(card);
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || task.done) return;

        if (taskId === 'sport') {
          startGPS(card, btn, task);
        } else {
          toggleTimer(card, btn, task);
        }
      });
    }

    // --- Vazifani tugmani bosmasdan tugatish (kartani bosish) ---
    if (!checkCircle) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const taskId = getTaskId(card);
        const task = state.tasks.find(t => t.id === taskId);
        if (!task || task.done) return;

        // faqat taymer ishlayotgan vazifani to'xtatib tugatish
        if (task.interval) {
          clearInterval(task.interval);
          task.interval = null;
          task.timerRunning = false;
        }

        completeTask(card, task);
      });
    }

    // --- All ready done task (reading) — kartani bosish orqali bekor qilish ---
    if (checkCircle && card.classList.contains('orange-border')) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const task = state.tasks.find(t => t.id === 'reading');
        if (!task) return;
        if (task.done) {
          // undo
          task.done = false;
          card.classList.remove('completed-card');
          card.style.opacity = '0.75';
          checkCircle.remove();
          updateProgress();
          showToast('Vazifa bekor qilindi');
        }
      });
    }
  });

  function getTaskId(card) {
    const nameEl = card.querySelector('.task-name');
    if (!nameEl) return '';
    const name = nameEl.textContent.trim();
    if (name.includes('Ingliz')) return 'english';
    if (name.includes('Dasturlash')) return 'coding';
    if (name.includes('Kitob')) return 'reading';
    if (name.includes('Sport')) return 'sport';
    return name.toLowerCase();
  }

  // --- Taymer ---
  function toggleTimer(card, btn, task) {
    if (task.timerRunning) {
      // to'xtatish
      clearInterval(task.interval);
      task.interval = null;
      task.timerRunning = false;
      btn.textContent = btn.dataset.originalText || 'Davom ettirish';
      showToast('Taymer to\'xtatildi');
    } else {
      // boshlash
      task.timerRunning = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = '⏸ To\'xtatish';
      showToast('Taymer boshlandi! ⏱');

      task.interval = setInterval(() => {
        task.seconds++;
        const m = Math.floor(task.seconds / 60);
        const s = task.seconds % 60;
        const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        // meta maydoniga vaqtni ko'rsatish
        const meta = card.querySelector('.task-meta');
        if (meta) {
          const firstSpan = meta.querySelector('span');
          if (firstSpan) {
            firstSpan.textContent = `⏱ ${timeStr}`;
          }
        }
      }, 1000);
    }
  }

  // --- GPS simulyatsiyasi (Sport) ---
  function startGPS(card, btn, task) {
    if (task.timerRunning) {
      clearInterval(task.interval);
      task.interval = null;
      task.timerRunning = false;
      btn.textContent = 'GPS ni yoyish';
      showToast('GPS to\'xtatildi');
      return;
    }

    task.timerRunning = true;
    task.seconds = 0;
    btn.textContent = '📍 GPS ishlayapti...';
    showToast('GPS yo\'l yoza boshladi! 🏃');

    let distance = 0;
    task.interval = setInterval(() => {
      task.seconds++;
      distance += 0.0012; // ~4.3 km/soat tezlikda
      const km = distance.toFixed(2);

      const meta = card.querySelector('.task-meta');
      if (meta) {
        const firstSpan = meta.querySelector('span');
        if (firstSpan) {
          firstSpan.textContent = `📍 ${km} km`;
        }
      }

      // 3 km bo'lsa tugatish
      if (distance >= 3.0) {
        clearInterval(task.interval);
        task.interval = null;
        task.timerRunning = false;
        btn.textContent = 'GPS ni yoyish';
        showToast('3 km yakunlandi! 🎉🔥');
        completeTask(card, task);
      }
    }, 1000);
  }

  // --- Vazifani tugatish ---
  function completeTask(card, task) {
    task.done = true;

    // check circle qo'shish
    const check = document.createElement('div');
    check.className = 'check-circle';
    check.textContent = '✓';
    const taskTop = card.querySelector('.task-top');
    if (taskTop) {
      taskTop.appendChild(check);
    }

    // tugmani o'zgartirish
    const btn = card.querySelector('.task-btn');
    if (btn) {
      btn.textContent = 'Bajarildi ✓';
      btn.style.opacity = '0.6';
      btn.style.pointerEvents = 'none';
    }

    card.classList.add('completed-card');
    card.style.opacity = '0.75';
    card.style.cursor = 'default';

    // jadvalni yangilash
    updateScheduleForTask(task.id);

    // progressni yangilash
    updateProgress();

    // check animatsiya
    check.style.transform = 'scale(0)';
    check.style.transition = 'transform 0.35s cubic-bezier(.34,1.56,.64,1)';
    requestAnimationFrame(() => {
      check.style.transform = 'scale(1)';
    });

    showToast('Vazifa bajarildi! 🎯');
  }

  // ==================== 3. PROGRESS RING ====================
  function updateProgress() {
    const total = state.tasks.length;
    const done = state.tasks.filter(t => t.done).length;
    const pct = Math.round((done / total) * 100);

    if (ring) {
      ring.style.background = `conic-gradient(var(--violet) 0% ${pct}%, #ece9fb ${pct}% 100%)`;
      ring.style.transition = 'background 0.6s ease';
    }
    if (ringInner) {
      ringInner.textContent = `${pct}%`;
    }

    // momentumni ham yangilash
    if (momentumBadge) {
      const momentum = Math.min(100, pct + (12 * 2)); // streak bonus
      momentumBadge.textContent = `Shaxsiy Momentum: ${momentum}%`;
    }
  }

  // ==================== 4. SCHEDULE UPDATE ====================
  function updateScheduleForTask(taskId) {
    const mapping = {
      'english': 'Ingliz tili',
      'coding': 'Dasturlash Amaliyoti',
      'reading': 'Kitob o\'qish',
      'sport': 'Sport & Yugurish',
    };

    const targetName = mapping[taskId];
    if (!targetName) return;

    scheduleItems.forEach(item => {
      const nameEl = item.querySelector('.name');
      if (!nameEl) return;
      if (nameEl.textContent.includes(targetName)) {
        item.classList.remove('pending', 'active');
        item.classList.add('done');
        const dot = item.querySelector('.dot');
        if (dot) {
          dot.classList.remove('pending', 'active');
          dot.classList.add('done');
          dot.textContent = '✓';
        }
        if (nameEl) {
          nameEl.style.color = 'var(--text-muted)';
          nameEl.style.textDecoration = 'line-through';
        }
      }
    });

    // keyingi pendingni active qilish
    const firstPending = document.querySelector('.schedule-item.pending');
    if (firstPending) {
      firstPending.classList.remove('pending');
      firstPending.classList.add('active');
      const dot = firstPending.querySelector('.dot');
      if (dot) {
        dot.classList.remove('pending');
        dot.classList.add('active');
        dot.textContent = '●';
      }
    }
  }

  // ==================== 5. "HAMMANI BAJARDIM!" ====================
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      const incomplete = state.tasks.filter(t => !t.done);

      incomplete.forEach(task => {
        if (task.interval) {
          clearInterval(task.interval);
          task.interval = null;
          task.timerRunning = false;
        }
        const card = findCardByTaskId(task.id);
        if (card) completeTask(card, task);
      });

      // vizual effekt
      finishBtn.textContent = '✓ Barcha vazifalar bajarildi!';
      finishBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)';
      finishBtn.style.boxShadow = '0 8px 24px rgba(34,197,94,0.40)';

      // Save stats to localStorage (syncs with dashboard.js on reload)
      let currentXp = parseInt(localStorage.getItem('streak_xp'), 10) || 0;
      let currentGems = parseInt(localStorage.getItem('streak_gems'), 10) || 0;
      currentXp += 50; // +50 XP bonus
      currentGems += 5; // +5 Gems bonus
      localStorage.setItem('streak_xp', currentXp);
      localStorage.setItem('streak_gems', currentGems);

      // confetti
      if (!state.allDoneAnimated) {
        state.allDoneAnimated = true;
        launchConfetti();
      }

      showToast('Barcha vazifalar bajarildi! +50 XP 🏆🔥');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = './dashboard.html';
      }, 2000);
    });
  }

  function findCardByTaskId(taskId) {
    const mapping = {
      'english': 'Ingliz',
      'coding': 'Dasturlash',
      'reading': 'Kitob',
      'sport': 'Sport',
    };
    const keyword = mapping[taskId];
    if (!keyword) return null;

    for (const card of taskCards) {
      const nameEl = card.querySelector('.task-name');
      if (nameEl && nameEl.textContent.includes(keyword)) return card;
    }
    return null;
  }

  // ==================== 6. BOTTOM NAV ====================
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const label = item.textContent.trim();
      if (label === 'TODAY') {
        state.activeNav = 'today';
        showToast('Bugungi kun 📅');
      } else if (label === 'LEARN') {
        state.activeNav = 'learn';
        window.location.href = './darslar.html';
      } else if (label === 'GROWTH') {
        state.activeNav = 'growth';
        window.location.href = './hisobotlar.html?focus=ai';
      } else if (label === 'PROFILE') {
        state.activeNav = 'profile';
        window.location.href = './profil.html';
      }
    });
  });

  // ==================== 7. HEADER ICONS ====================
  if (headerIcons.length >= 2) {
    headerIcons[0].addEventListener('click', () => {
      showToast('Yangi bildirishnomalar yo\'q 🔔');
    });
    headerIcons[1].addEventListener('click', () => {
      window.location.href = './profil.html';
    });
  }

  // ==================== 8. CONFETTI ====================
  function launchConfetti() {
    const colors = ['#6d4aff', '#4f6df5', '#22c55e', '#f97316', '#eab308', '#ec4899'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 0.8;
      const duration = 1.5 + Math.random() * 1.5;
      const size = 6 + Math.random() * 8;
      const rotation = Math.random() * 360;

      confetti.style.cssText = `
        position: absolute;
        top: -20px;
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        transform: rotate(${rotation}deg);
        animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
        opacity: 0.9;
      `;
      container.appendChild(confetti);
    }

    // animatsiya CSS
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // tozalash
    setTimeout(() => container.remove(), 4000);
  }

  // ==================== 9. TOAST ====================
  function showToast(message) {
    // mavjud toastni o'chirish
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #1f1f2e;
      color: #fff;
      padding: 14px 28px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      font-family: 'Segoe UI', system-ui, sans-serif;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      white-space: nowrap;
      max-width: 90vw;
      text-align: center;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // ==================== 10. INITIAL ANIMATIONS ====================
  // Ring animatsiya
  if (ring) {
    ring.style.background = 'conic-gradient(var(--violet) 0% 0%, #ece9fb 0% 100%)';
    ring.style.transition = 'background 1s ease';
    setTimeout(() => {
      updateProgress();
    }, 300);
  }

  // Kartalarni ketma-ket ko'rsatish
  taskCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    requestAnimationFrame(() => {
      card.style.opacity = card.classList.contains('orange-border') ? '0.75' : '1';
      card.style.transform = 'translateY(0)';
    });
  });

  // Insight card animatsiya
  const insightCard = document.querySelector('.insight-card');
  if (insightCard) {
    insightCard.style.opacity = '0';
    insightCard.style.transform = 'translateY(15px)';
    insightCard.style.transition = 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s';
    requestAnimationFrame(() => {
      insightCard.style.opacity = '1';
      insightCard.style.transform = 'translateY(0)';
    });
  }

  // Stats animatsiya
  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    statsRow.style.opacity = '0';
    statsRow.style.transform = 'translateY(15px)';
    statsRow.style.transition = 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s';
    requestAnimationFrame(() => {
      statsRow.style.opacity = '1';
      statsRow.style.transform = 'translateY(0)';
    });
  }

  // Schedule animatsiya
  const scheduleCard = document.querySelector('.schedule-card');
  if (scheduleCard) {
    scheduleCard.style.opacity = '0';
    scheduleCard.style.transform = 'translateY(15px)';
    scheduleCard.style.transition = 'opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s';
    requestAnimationFrame(() => {
      scheduleCard.style.opacity = '1';
      scheduleCard.style.transform = 'translateY(0)';
    });
  }

});
