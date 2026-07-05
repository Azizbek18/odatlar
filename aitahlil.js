// ============================================
// Savol.uz — AI Progress Tahlili — ai.js
// (Supabase va localStorage'siz, statik demo ma'lumotlar)
// ============================================

// ---- Demo ma'lumotlar ----
const demoData = {
  user: {
    name: "O'quvchi",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  overallProgress: 85,
  streak: 15,
  totalXp: 2450,
  grade: "B+",
  subjects: [
    { score: 85, tagLabel: "Yaxshi", tagClass: "good", tagIcon: "fa-check" },
    { score: 70, tagLabel: "O'sish", tagClass: "up", tagIcon: "fa-arrow-up" },
    { score: 55, tagLabel: "O'rtacha", tagClass: "mid", tagIcon: "fa-minus" },
  ],
  predictions: [70, 85],
};

// ---- Sidebar / mobile menu toggle ----
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebarOverlay");

menuToggle?.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay?.addEventListener("click", () => {
  menuToggle.classList.remove("active");
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// ---- Foydalanuvchi ismi va avatarini joylashtirish ----
function renderUserInfo() {
  document.querySelectorAll(".user-welcome h4").forEach((el) => {
    el.textContent = `Salom, ${demoData.user.name}!`;
  });

  document
    .querySelectorAll(".user-avatar, .topbar-avatar, .mobile-user-avatar img")
    .forEach((el) => {
      el.src = demoData.user.avatar;
    });
}

// ---- Hero statistikalarni yangilash ----
function renderHeroStats() {
  const stats = document.querySelectorAll(".stat-num");
  if (stats[0]) stats[0].textContent = `${demoData.overallProgress}%`;
  if (stats[1]) stats[1].textContent = demoData.streak;
  if (stats[2]) stats[2].textContent = demoData.totalXp.toLocaleString("uz-UZ");
}

// ---- Profil kartasini yangilash ----
function renderProfileCard() {
  const gradeEl = document.querySelector(".profile-badge-hex .grade");
  if (gradeEl) gradeEl.textContent = demoData.grade;

  const streakPill = document.querySelector(".pill-streak");
  if (streakPill) {
    streakPill.innerHTML = `<i class="fa-solid fa-fire"></i> ${demoData.streak} kun`;
  }

  const xpPill = document.querySelector(".pill-xp");
  if (xpPill) {
    xpPill.innerHTML = `<i class="fa-solid fa-star"></i> ${demoData.totalXp.toLocaleString("uz-UZ")} XP`;
  }

  const fill = document.querySelector(".profile-progress-row .progress-fill");
  if (fill) fill.style.width = `${demoData.overallProgress}%`;

  const pct = document.querySelector(".profile-progress-row .progress-pct");
  if (pct) pct.textContent = `${demoData.overallProgress}%`;
}

// ---- Fanlar bo'yicha metrikalarni yangilash ----
function renderMetrics() {
  const cards = document.querySelectorAll(".metric-card");
  cards.forEach((card, i) => {
    const subj = demoData.subjects[i];
    if (!subj) return;

    const sub = card.querySelector(".metric-sub");
    if (sub) sub.textContent = `${subj.score} / 100 ball`;

    const fill = card.querySelector(".progress-fill");
    if (fill) fill.style.width = `${subj.score}%`;

    const tag = card.querySelector(".metric-tag");
    if (tag) {
      tag.className = `metric-tag ${subj.tagClass}`;
      tag.innerHTML = `<i class="fa-solid ${subj.tagIcon}"></i> ${subj.tagLabel}`;
    }
  });
}

// ---- AI bashoratlarini yangilash ----
function renderPredictions() {
  const items = document.querySelectorAll(".prediction-item");
  items.forEach((item, i) => {
    const value = demoData.predictions[i];
    if (value === undefined) return;

    const valueEl = item.querySelector(".prediction-value");
    const fillEl = item.querySelector(".progress-fill");
    if (valueEl) valueEl.textContent = `${value}%`;
    if (fillEl) fillEl.style.width = `${value}%`;
  });
}

// ---- Amaliy qadamlarga bosilganda belgilash ----
// Har bir bosishda .done klassi almashtiriladi — CSS shu klass orqali
// katakchani bo'sh (standart) yoki to'ldirilgan (bajarilgan) holatda ko'rsatadi.
function bindStepClicks() {
  document.querySelectorAll(".step-item").forEach((step) => {
    step.addEventListener("click", () => {
      step.classList.toggle("done");
    });
  });
}

// ---- "Yangi odat" tugmalari (sidebar va FAB) ----
function bindAddHabitButtons() {
  const addBtn = document.querySelector(".btn-add-habit");
  const fabBtn = document.getElementById("fabBtn");

  [addBtn, fabBtn].forEach((btn) => {
    btn?.addEventListener("click", () => {
      window.location.href = "leardboard.html#yangi-odat";
    });
  });
}

// ---- Ishga tushirish ----
document.addEventListener("DOMContentLoaded", () => {
  renderUserInfo();
  renderHeroStats();
  renderProfileCard();
  renderMetrics();
  renderPredictions();
  bindStepClicks();
  bindAddHabitButtons();
});