// ============================================
// Streak.uz — Flashcards & Takrorlash — flashcards.js
// To'liq ishlaydigan versiya (flip-card sessiya bilan)
// ============================================

// ---- Sidebar / mobile menu toggle ----
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebarOverlay");
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

function isUsableAvatar(src) {
  if (!src || typeof src !== "string") return false;
  const value = src.trim();
  if (!value) return false;
  const blocked = ["foydalanuvchi rasmi", "pravatar.cc", "placeholder", "default", "avatar"];
  return !blocked.some(part => value.toLowerCase().includes(part));
}

function setTopbarAvatar(src) {
  document.querySelectorAll(".topbar-profile").forEach(link => {
    const img = link.querySelector(".topbar-avatar-img");
    const icon = link.querySelector(".topbar-avatar-icon");
    if (!img || !icon) return;

    if (!isUsableAvatar(src)) {
      img.hidden = true;
      img.removeAttribute("src");
      icon.hidden = false;
      return;
    }

    img.onload = () => {
      img.hidden = false;
      icon.hidden = true;
    };
    img.onerror = () => {
      img.hidden = true;
      img.removeAttribute("src");
      icon.hidden = false;
    };
    img.src = src;
  });
}

function initHeaderActions() {
  setTopbarAvatar(currentUser?.avatar_url);

  document.querySelectorAll(".notification-btn").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      const actions = btn.closest(".topbar-actions");
      const popover = actions?.querySelector(".notification-popover");
      if (!popover) {
        showFcModal({
          icon: "fa-bell",
          title: "Bildirishnomalar",
          text: "Hozircha yangi bildirishnoma yo'q."
        });
        return;
      }
      const isOpen = popover.classList.toggle("is-open");
      popover.setAttribute("aria-hidden", String(!isOpen));
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.addEventListener("click", event => {
    document.querySelectorAll(".notification-popover.is-open").forEach(popover => {
      if (popover.contains(event.target)) return;
      const btn = popover.closest(".topbar-actions")?.querySelector(".notification-btn");
      if (btn?.contains(event.target)) return;
      popover.classList.remove("is-open");
      popover.setAttribute("aria-hidden", "true");
      btn?.setAttribute("aria-expanded", "false");
    });
  });
}

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

initHeaderActions();

// ---- Demo karta ma'lumotlari (har bir to'plam uchun) ----
const demoCardSets = {
  "English Vocabulary": [
    { front: "Inevitable", back: "Muqarrar, sodir bo'lishi shubhasiz" },
    { front: "Resilient", back: "Chidamli, qayta tiklanuvchan" },
    { front: "Ambiguous", back: "Noaniq, ikki ma'noli" },
    { front: "Meticulous", back: "Mayda detallarga e'tiborli, puxta" },
    { front: "Eloquent", back: "Notiq, ravon va ta'sirli gapiruvchi" },
    { front: "Ubiquitous", back: "Hamma yerda mavjud bo'lgan" },
    { front: "Pragmatic", back: "Amaliy, real natijaga yo'naltirilgan" },
    { front: "Candid", back: "Ochiq, samimiy, yashirmasdan aytuvchi" },
    { front: "Tedious", back: "Zerikarli, charchatuvchi" },
    { front: "Adversity", back: "Qiyinchilik, mushkulot" },
    { front: "Diligent", back: "Tirishqoq, mehnatkash" },
    { front: "Skeptical", back: "Shubhalanuvchi, ishonqiramaydigan" },
    { front: "Genuine", back: "Haqiqiy, asl, sof" },
    { front: "Concise", back: "Qisqa va lo'nda" },
    { front: "Persistent", back: "Qat'iyatli, izchil davom etuvchi" },
  ],
  "Python Mastery": [
    { front: "Decorator", back: "Funksiyani o'rab, uning xatti-harakatini o'zgartiruvchi funksiya" },
    { front: "Generator", back: "yield orqali qiymatlarni ketma-ket qaytaruvchi funksiya" },
    { front: "List comprehension", back: "Ro'yxatlarni qisqa sintaksis bilan yaratish usuli" },
    { front: "Lambda", back: "Nomsiz, bir qatorli funksiya" },
    { front: "*args", back: "Funksiyaga istalgan sondagi pozitsion argument uzatish" },
    { front: "**kwargs", back: "Funksiyaga istalgan sondagi kalit-qiymat argument uzatish" },
    { front: "Context manager", back: "with operatori bilan resurslarni boshqarish (masalan, fayllar)" },
    { front: "Iterator", back: "__next__ metodiga ega, ketma-ket qiymat qaytaruvchi obyekt" },
    { front: "GIL", back: "Global Interpreter Lock — bir vaqtda faqat bitta thread bayt-kod bajarishi" },
    { front: "Dunder metod", back: "__init__, __str__ kabi ikki pastki chiziq bilan boshlanuvchi metodlar" },
    { front: "Mutable", back: "O'zgartirilishi mumkin bo'lgan obyekt (masalan, list)" },
    { front: "Immutable", back: "O'zgartirib bo'lmaydigan obyekt (masalan, tuple, str)" },
    { front: "Virtual environment", back: "Loyiha uchun alohida ajratilgan Python muhiti" },
    { front: "PEP 8", back: "Python kodini yozish bo'yicha rasmiy uslub qo'llanmasi" },
    { front: "Slicing", back: "list[start:stop:step] orqali ketma-ketlikning bir qismini olish" },
  ],
  "Atomic Habits": [
    { front: "1% qoidasi", back: "Har kuni 1% yaxshilanish — yilda 37 barobar o'sish beradi" },
    { front: "Identity-based habits", back: "Natijaga emas, kimligingga asoslangan odatlar" },
    { front: "Habit stacking", back: "Yangi odatni mavjud odat ustiga qo'shish" },
    { front: "Cue", back: "Odatni boshlab beruvchi signal yoki triggerlar" },
    { front: "Craving", back: "Odatni bajarishga undovchi ichki istak" },
    { front: "Response", back: "Odatning o'zi — bajariladigan harakat" },
    { front: "Reward", back: "Harakatdan keyingi mukofot, miya buni eslab qoladi" },
    { front: "2-daqiqalik qoida", back: "Yangi odatni 2 daqiqaga qisqartirib boshlash" },
    { front: "Environment design", back: "Muhitni odatga mos qilib tashkillashtirish" },
    { front: "Habit tracking", back: "Odatlarni kuzatib borish va belgilab qo'yish" },
    { front: "Plateau of latent potential", back: "Natija ko'rinmasdan oldingi yashirin o'sish davri" },
    { front: "Temptation bundling", back: "Yoqimsiz odatni yoqimli narsa bilan birga qilish" },
    { front: "Accountability partner", back: "Odatga rioya qilishni nazorat qiluvchi hamkor" },
    { front: "Goldilocks Rule", back: "Vazifa juda oson ham, juda qiyin ham bo'lmasligi kerak" },
    { front: "Vote for identity", back: "Har bir bajarilgan odat — kim bo'lishni xohlaganingga ovoz" },
  ],
  "Bugungi takrorlash": [
    { front: "Spaced repetition", back: "Ma'lumotni o'sib boruvchi intervallar bilan takrorlash usuli" },
    { front: "Decorator", back: "Funksiyani o'rab, uning xatti-harakatini o'zgartiruvchi funksiya" },
    { front: "Inevitable", back: "Muqarrar, sodir bo'lishi shubhasiz" },
    { front: "1% qoidasi", back: "Har kuni 1% yaxshilanish — yilda 37 barobar o'sish beradi" },
    { front: "Generator", back: "yield orqali qiymatlarni ketma-ket qaytaruvchi funksiya" },
    { front: "Resilient", back: "Chidamli, qayta tiklanuvchan" },
    { front: "Habit stacking", back: "Yangi odatni mavjud odat ustiga qo'shish" },
    { front: "Lambda", back: "Nomsiz, bir qatorli funksiya" },
    { front: "Ambiguous", back: "Noaniq, ikki ma'noli" },
    { front: "Cue", back: "Odatni boshlab beruvchi signal yoki triggerlar" },
    { front: "List comprehension", back: "Ro'yxatlarni qisqa sintaksis bilan yaratish usuli" },
    { front: "Meticulous", back: "Mayda detallarga e'tiborli, puxta" },
    { front: "Reward", back: "Harakatdan keyingi mukofot, miya buni eslab qoladi" },
    { front: "Eloquent", back: "Notiq, ravon va ta'sirli gapiruvchi" },
    { front: "2-daqiqalik qoida", back: "Yangi odatni 2 daqiqaga qisqartirib boshlash" },
  ],
};

// ---- Har bir to'plamning joriy "o'zlashtirilgan" foizi ----
// (kartalarda ko'rsatilgan boshlang'ich qiymatlar bilan bir xil)
const collectionMastery = {
  "English Vocabulary": 75,
  "Python Mastery": 40,
  "Atomic Habits": 100,
};

// ---- Umumiy modal style (kichik bildirishnomalar + study session) ----
function injectModalStyles() {
  if (document.getElementById("fc-modal-styles")) return;
  const style = document.createElement("style");
  style.id = "fc-modal-styles";
  style.textContent = `
    .fc-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 12, 30, 0.45);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 5000; opacity: 0; transition: opacity 0.25s ease;
    }
    .fc-modal-overlay.show { opacity: 1; }
    .fc-modal-box {
      background: #ffffff; border: 3px solid #e8e5ff; border-bottom: 6px solid #d4d0ff;
      border-radius: 24px; padding: 32px 28px 26px; width: 90%; max-width: 360px;
      text-align: center; box-shadow: 0 10px 0 0 #d4d0ff, 0 20px 50px -10px rgba(112,0,255,0.25);
      transform: scale(0.85) translateY(10px);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: "Nunito", system-ui, sans-serif;
    }
    .fc-modal-overlay.show .fc-modal-box { transform: scale(1) translateY(0); }
    .fc-modal-icon {
      width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 18px;
      background: linear-gradient(135deg, #7000ff 0%, #9333ea 100%);
      border: 3px solid #5900cc; border-bottom: 5px solid #4a00a3; box-shadow: 0 4px 0 0 #4a00a3;
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 26px;
    }
    .fc-modal-title { font-size: 18px; font-weight: 900; color: #3c3c3c; margin-bottom: 8px; }
    .fc-modal-text { font-size: 13.5px; font-weight: 700; color: #999999; line-height: 1.6; margin-bottom: 22px; }
    .fc-modal-text b { color: #7000ff; }
    .fc-modal-btn {
      width: 100%; padding: 14px; border-radius: 16px; border: 2.5px solid #5900cc;
      border-bottom: 4.5px solid #4a00a3; background: #7000ff; color: #fff;
      font-family: "Nunito", system-ui, sans-serif; font-size: 14.5px; font-weight: 800;
      cursor: pointer; box-shadow: 0 4px 0 0 #4a00a3;
      transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .fc-modal-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 0 #4a00a3; }
    .fc-modal-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 0 #4a00a3; border-bottom-width: 2.5px; }

    /* ---- Study session ---- */
    .fc-study-overlay {
      position: fixed; inset: 0; background: rgba(15, 12, 30, 0.55);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 6000; opacity: 0; transition: opacity 0.25s ease; padding: 20px;
    }
    .fc-study-overlay.show { opacity: 1; }
    .fc-study-box {
      width: 100%; max-width: 480px; font-family: "Nunito", system-ui, sans-serif;
      transform: scale(0.9) translateY(15px);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .fc-study-overlay.show .fc-study-box { transform: scale(1) translateY(0); }
    .fc-study-head {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
    }
    .fc-study-progress-text { color: #fff; font-weight: 800; font-size: 13px; }
    .fc-study-close {
      width: 36px; height: 36px; border-radius: 12px; border: none; cursor: pointer;
      background: rgba(255,255,255,0.15); color: #fff; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s ease;
    }
    .fc-study-close:hover { background: rgba(255,255,255,0.28); }
    .fc-study-progress-track {
      height: 8px; border-radius: 100px; background: rgba(255,255,255,0.18); margin-bottom: 24px; overflow: hidden;
    }
    .fc-study-progress-fill {
      height: 100%; border-radius: 100px; background: linear-gradient(90deg, #ff9d2e, #f97316);
      transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .fc-flip-card {
      width: 100%; height: 260px; perspective: 1200px; cursor: pointer; margin-bottom: 24px;
    }
    .fc-flip-inner {
      width: 100%; height: 100%; position: relative; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-style: preserve-3d;
    }
    .fc-flip-card.flipped .fc-flip-inner { transform: rotateY(180deg); }
    .fc-flip-face {
      position: absolute; inset: 0; backface-visibility: hidden;
      border-radius: 24px; display: flex; align-items: center; justify-content: center;
      padding: 24px; text-align: center; font-weight: 900; font-size: 24px; color: #fff;
      border: 3px solid #5900cc; border-bottom: 6px solid #4a00a3;
      box-shadow: 0 10px 0 0 #4a00a3, 0 20px 40px -10px rgba(0,0,0,0.3);
    }
    .fc-flip-front { background: linear-gradient(135deg, #7000ff, #9333ea); }
    .fc-flip-back {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      transform: rotateY(180deg);
      font-size: 17px; font-weight: 800; line-height: 1.5;
    }
    .fc-flip-hint {
      position: absolute; bottom: 14px; left: 0; right: 0; text-align: center;
      font-size: 11px; font-weight: 700; opacity: 0.75;
    }
    .fc-study-actions { display: flex; gap: 12px; }
    .fc-study-btn {
      flex: 1; padding: 14px; border-radius: 16px; border: 2.5px solid transparent;
      border-bottom: 4.5px solid transparent; font-family: "Nunito", system-ui, sans-serif;
      font-size: 14px; font-weight: 800; cursor: pointer;
      transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .fc-study-btn:active { transform: translateY(2px); }
    .fc-study-btn.hard {
      background: #fee2e2; color: #b91c1c; border-color: #fca5a5; border-bottom-color: #f87171;
    }
    .fc-study-btn.hard:hover { transform: translateY(-2px); }
    .fc-study-btn.easy {
      background: #dcfce7; color: #15803d; border-color: #86efac; border-bottom-color: #4ade80;
    }
    .fc-study-btn.easy:hover { transform: translateY(-2px); }
  `;
  document.head.appendChild(style);
}

function showFcModal({ icon = "fa-wand-magic-sparkles", title, text }) {
  injectModalStyles();
  const overlay = document.createElement("div");
  overlay.className = "fc-modal-overlay";
  overlay.innerHTML = `
    <div class="fc-modal-box">
      <div class="fc-modal-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="fc-modal-title">${title}</div>
      <div class="fc-modal-text">${text}</div>
      <button class="fc-modal-btn">Tushunarli</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));

  function close() {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 250);
  }
  overlay.querySelector(".fc-modal-btn").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
}

// ---- Haqiqiy flip-card o'qish sessiyasi ----
function startStudySession(setName) {
  injectModalStyles();
  const cards = demoCardSets[setName] || demoCardSets["Bugungi takrorlash"];
  let index = 0;
  let known = 0;

  const overlay = document.createElement("div");
  overlay.className = "fc-study-overlay";
  overlay.innerHTML = `
    <div class="fc-study-box">
      <div class="fc-study-head">
        <span class="fc-study-progress-text">${setName}</span>
        <button class="fc-study-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="fc-study-progress-track">
        <div class="fc-study-progress-fill" style="width: 0%;"></div>
      </div>
      <div class="fc-flip-card">
        <div class="fc-flip-inner">
          <div class="fc-flip-face fc-flip-front">
            <span class="fc-flip-text"></span>
            <span class="fc-flip-hint">Javobni ko'rish uchun bosing</span>
          </div>
          <div class="fc-flip-face fc-flip-back">
            <span class="fc-flip-text"></span>
          </div>
        </div>
      </div>
      <div class="fc-study-actions">
        <button class="fc-study-btn hard"><i class="fa-solid fa-rotate-left"></i> Qiyin</button>
        <button class="fc-study-btn easy"><i class="fa-solid fa-check"></i> Bilaman</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));

  const flipCard = overlay.querySelector(".fc-flip-card");
  const frontText = overlay.querySelector(".fc-flip-front .fc-flip-text");
  const backText = overlay.querySelector(".fc-flip-back .fc-flip-text");
  const progressFill = overlay.querySelector(".fc-study-progress-fill");
  const progressText = overlay.querySelector(".fc-study-progress-text");
  const closeBtn = overlay.querySelector(".fc-study-close");
  const hardBtn = overlay.querySelector(".fc-study-btn.hard");
  const easyBtn = overlay.querySelector(".fc-study-btn.easy");

  function renderCard() {
    const card = cards[index];
    frontText.textContent = card.front;
    backText.textContent = card.back;
    flipCard.classList.remove("flipped");
    progressFill.style.width = `${Math.round((index / cards.length) * 100)}%`;
    progressText.textContent = `${setName} — ${index + 1}/${cards.length}`;
  }

  function nextCard() {
    index++;
    if (index >= cards.length) {
      finishSession();
    } else {
      renderCard();
    }
  }

  function finishSession() {
    closeSession();
    const percent = Math.round((known / cards.length) * 100);

    updateMemoryLevel(percent);
    updateCollectionMastery(setName, percent);

    showFcModal({
      icon: "fa-trophy",
      title: "Sessiya tugadi! 🎉",
      text: `<b>${cards.length}</b> tadan <b>${known}</b> tasini bildingiz (${percent}%). Davom eting!`,
    });
  }

  function closeSession() {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 250);
  }

  flipCard.addEventListener("click", () => flipCard.classList.toggle("flipped"));
  hardBtn.addEventListener("click", () => nextCard());
  easyBtn.addEventListener("click", () => { known++; nextCard(); });
  closeBtn.addEventListener("click", closeSession);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSession(); });

  renderCard();
}

// ---- "Xotira Darajasi" doirasini yangilash ----
let currentMemoryLevel = 85;

function updateMemoryLevel(sessionPercent) {
  const oldLevel = currentMemoryLevel;
  // Sessiya natijasiga qarab xotira darajasini biroz oshirish/pasaytirish
  const delta = Math.round((sessionPercent - 50) / 7); // -7..+7 atrofida
  let newLevel = oldLevel + delta;
  newLevel = Math.max(0, Math.min(100, newLevel));
  currentMemoryLevel = newLevel;

  const ringFill = document.querySelector(".memory-ring-fill");
  const percentEl = document.querySelector(".memory-percent");
  const labelEl = document.querySelector(".memory-label");

  if (ringFill) {
    const circumference = 269; // svg r=43 atrofi
    const offset = circumference - (circumference * newLevel) / 100;
    ringFill.style.transition = "stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)";
    ringFill.style.strokeDashoffset = offset;
  }

  if (percentEl) {
    animateCount(percentEl, oldLevel, newLevel);
  }

  if (labelEl) {
    labelEl.innerHTML = `<strong>Xotira Darajasi</strong><br>${oldLevel}% → ${newLevel}%`;
  }
}

// ---- Har bir to'plam kartasidagi progress-bar va foizni yangilash ----
// Sessiyada ko'p "Qiyin" bosilsa (past percent) — foiz pasayadi.
// Ko'p "Bilaman" bosilsa (yuqori percent) — foiz oshadi.
function updateCollectionMastery(setName, sessionPercent) {
  if (!(setName in collectionMastery)) return; // faqat haqiqiy to'plamlar uchun (aralash "Bugungi takrorlash" emas)

  const oldMastery = collectionMastery[setName];
  const delta = Math.round((sessionPercent - 50) / 4); // xato ko'p bo'lsa manfiy, kam bo'lsa musbat
  let newMastery = oldMastery + delta;
  newMastery = Math.max(0, Math.min(100, newMastery));
  collectionMastery[setName] = newMastery;

  const card = Array.from(document.querySelectorAll(".collection-card")).find(
    (c) => c.querySelector(".card-title")?.textContent.trim() === setName
  );
  if (!card) return;

  const fill = card.querySelector(".card-progress-fill");
  const masteryEl = card.querySelector(".card-mastery-percent");

  if (fill) {
    fill.style.width = `${newMastery}%`;
  }

  if (masteryEl) {
    animateCount(masteryEl, oldMastery, newMastery);
  }
}

function animateCount(el, from, to, duration = 800) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(from + (to - from) * progress);
    el.textContent = `${value}%`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---- "Takrorlashni boshlash" tugmasi ----
document.querySelector(".action-btn")?.addEventListener("click", () => {
  startStudySession("Bugungi takrorlash");
});

// ---- To'plam kartalariga bosilganda ----
document.querySelectorAll(".collection-card").forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.querySelector(".card-title")?.textContent || "To'plam";
    startStudySession(title);
  });
});

// ---- "Barchasi" havolasi ----
document.querySelector(".see-all")?.addEventListener("click", () => {
  showFcModal({
    icon: "fa-table-cells-large",
    title: "Barcha to'plamlar",
    text: "Barcha flashcard to'plamlaringiz ro'yxati tez orada shu yerda ko'rinadi.",
  });
});

// ---- AI takliflariga bosilganda ----
document.querySelectorAll(".suggestion-card").forEach((card) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("added")) return;

    const title = card.querySelector("h4")?.textContent || "Yangi karta";
    const desc = card.querySelector("p")?.textContent || "";
    showFcModal({
      icon: "fa-wand-magic-sparkles",
      title: "AI taklifi qo'shildi! ✨",
      text: `<b>${title}</b> — ${desc} to'plamingizga qo'shildi.`,
    });

    // Rangini saqlab qolib, faqat "qo'shildi" belgisini ko'rsatish
    card.classList.add("added");
    const arrow = card.querySelector(".suggestion-arrow");
    if (arrow) {
      arrow.innerHTML = `<i class="fa-solid fa-check"></i>`;
      arrow.style.background = "#22c55e";
      arrow.style.borderColor = "#16a34a";
    }
  });
});

// ---- "Start New Habit" tugmasi (sidebar) ----
document.querySelector(".btn-add-habit")?.addEventListener("click", () => {
  window.location.href = "leardboard.html#yangi-odat";
});

// ---- FAB tugmasi ----
document.querySelector(".fab")?.addEventListener("click", () => {
  showFcModal({
    icon: "fa-plus",
    title: "Yangi to'plam yaratish",
    text: "Yangi flashcard to'plami yaratish funksiyasi tez orada qo'shiladi.",
  });
});
