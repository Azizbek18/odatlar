// darslar.js — "O'sish" Courses sahifasi uchun interaktivlik

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Toast (kichik bildirishnoma) ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- 1) Sidebar navigatsiya ---------- */
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Footer havolalar (Help/Logout) aktiv holatga o'tmaydi
      if (item.closest('.footer-links')) {
        showToast(item.textContent.trim() + ' bosildi');
        return;
      }
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.page || item.textContent.trim();
      showToast(page[0].toUpperCase() + page.slice(1) + ' bo\'limiga o\'tildi');
    });
  });

  const startHabitBtn = document.getElementById('startHabitBtn');
  if (startHabitBtn) {
    startHabitBtn.addEventListener('click', () => {
      showToast('Yangi odat qo\'shish oynasi ochilmoqda...');
    });
  }

  /* ---------- 2) Qidiruv va filtr pillari ---------- */
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.pill');
  const allCards = document.querySelectorAll('.course-card');
  const noResults = document.getElementById('noResults');

  let activeFilter = 'all';

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visibleCount = 0;

    allCards.forEach(card => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const title = (card.dataset.title || '').toLowerCase();
      const matchesSearch = query === '' || title.includes(query);

      if (matchesFilter && matchesSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  /* ---------- 3) Bookmark tugmasi ---------- */
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('saved');
      const saved = btn.classList.contains('saved');
      showToast(saved ? 'Kurs saqlanganlar ro\'yxatiga qo\'shildi 🔖' : 'Kurs saqlanganlardan olib tashlandi');
    });
  });

  /* ---------- 4) Kurs va "Darsni boshlash" tugmalari ---------- */
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseName = btn.dataset.course || 'Kurs';
      showToast('"' + courseName + '" ochilmoqda...');
      setTimeout(() => {
        window.location.href = './darsbolimi.html?course=' + encodeURIComponent(courseName);
      }, 600);
    });
  });

  /* ---------- 5) "Davom ettirish" — progressni oshirish ---------- */
  document.querySelectorAll('.btn-tiny').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.mycourse');
      if (!wrapper) return;

      const total = parseInt(btn.dataset.totalLessons, 10) || 0;
      const doneEl = wrapper.querySelector('.lessons-done');
      const pctEl = wrapper.querySelector('.pct');
      const fillEl = wrapper.querySelector('.progress-fill');

      let done = parseInt(doneEl.textContent, 10) || 0;
      done = Math.min(done + 1, total);
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      doneEl.textContent = done;
      pctEl.textContent = pct + '%';
      fillEl.style.width = pct + '%';

      if (done >= total) {
        btn.textContent = 'Yakunlandi ✓';
        btn.disabled = true;
        showToast('Tabriklaymiz! Kurs yakunlandi 🎉');
      } else {
        showToast('Dars belgilandi! Endi ' + done + '/' + total);
      }
    });
  });

  /* ---------- 6) Streak tugmasi ---------- */
  const streakBtn = document.getElementById('streakBtn');
  const streakCount = document.getElementById('streakCount');
  const streakFill = document.getElementById('streakFill');
  const streakDaysLabel = document.getElementById('streakDaysLabel');
  const STREAK_GOAL = 30;

  if (streakBtn) {
    streakBtn.addEventListener('click', () => {
      let days = parseInt(streakCount.textContent, 10) || 0;
      days = Math.min(days + 1, STREAK_GOAL);

      streakCount.textContent = days;
      streakDaysLabel.textContent = days + '/' + STREAK_GOAL;
      streakFill.style.width = Math.round((days / STREAK_GOAL) * 100) + '%';

      if (days >= STREAK_GOAL) {
        streakBtn.textContent = 'Streak saqlandi ✓';
        streakBtn.disabled = true;
        showToast('30 kunlik streak yakunlandi! Pro kurslar ochildi 🔥');
      } else {
        showToast('Bugungi streak saqlandi! ' + days + '/' + STREAK_GOAL + ' kun');
      }
    });
  }

});