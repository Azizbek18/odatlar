// ============================================
// O'quv — AI Ta'lim Platformasi — aigenerator.js
// ============================================

// ---- Sidebar / mobile menu toggle ----
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
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

// ---- Yo'nalish (category) tanlash ----
document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

// ---- Vaqt tanlash ----
document.querySelectorAll(".time-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

// ---- Topbar tablari ----
document.querySelectorAll(".topbar-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".topbar-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
  });
});

// ---- Natija modali (alert o'rniga) ----
function injectModalStyles() {
  if (document.getElementById("gen-modal-styles")) return;
  const style = document.createElement("style");
  style.id = "gen-modal-styles";
  style.textContent = `
    .gen-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 12, 30, 0.45);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5000;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .gen-modal-overlay.show { opacity: 1; }
    .gen-modal-box {
      background: #ffffff;
      border: 3px solid #e8e5ff;
      border-bottom: 6px solid #d4d0ff;
      border-radius: 24px;
      padding: 32px 28px 26px;
      width: 90%;
      max-width: 360px;
      text-align: center;
      box-shadow: 0 10px 0 0 #d4d0ff, 0 20px 50px -10px rgba(112, 0, 255, 0.25);
      transform: scale(0.85) translateY(10px);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: "Nunito", system-ui, sans-serif;
    }
    .gen-modal-overlay.show .gen-modal-box { transform: scale(1) translateY(0); }
    .gen-modal-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      border-radius: 18px;
      background: linear-gradient(135deg, #7000ff 0%, #9333ea 100%);
      border: 3px solid #5900cc;
      border-bottom: 5px solid #4a00a3;
      box-shadow: 0 4px 0 0 #4a00a3;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 26px;
    }
    .gen-modal-title {
      font-size: 18px;
      font-weight: 900;
      color: #3c3c3c;
      margin-bottom: 8px;
    }
    .gen-modal-text {
      font-size: 13.5px;
      font-weight: 700;
      color: #999999;
      line-height: 1.6;
      margin-bottom: 22px;
    }
    .gen-modal-text b { color: #7000ff; }
    .gen-modal-btn {
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      border: 2.5px solid #5900cc;
      border-bottom: 4.5px solid #4a00a3;
      background: #7000ff;
      color: #fff;
      font-family: "Nunito", system-ui, sans-serif;
      font-size: 14.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 0 0 #4a00a3;
      transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .gen-modal-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 0 #4a00a3; }
    .gen-modal-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 0 #4a00a3; border-bottom-width: 2.5px; }
  `;
  document.head.appendChild(style);
}

function showGenModal({ title, text }) {
  injectModalStyles();

  const overlay = document.createElement("div");
  overlay.className = "gen-modal-overlay";
  overlay.innerHTML = `
    <div class="gen-modal-box">
      <div class="gen-modal-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
      <div class="gen-modal-title">${title}</div>
      <div class="gen-modal-text">${text}</div>
      <button class="gen-modal-btn">Tushunarli</button>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));

  function close() {
    overlay.classList.remove("show");
    setTimeout(() => {
      overlay.remove();
      window.location.href = "./ai.html";
    }, 250);
  }

  overlay.querySelector(".gen-modal-btn").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}

// ---- Vazifani generatsiya qilish tugmasi ----
const generateBtn = document.querySelector(".generate-btn");

generateBtn?.addEventListener("click", () => {
  const category = document.querySelector(".category-btn.selected .cat-label")?.textContent || "Yo'nalish";
  const time = document.querySelector(".time-btn.selected")?.textContent || "30";

  const originalHTML = generateBtn.innerHTML;
  generateBtn.disabled = true;
  generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generatsiya qilinmoqda...`;

  setTimeout(() => {
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalHTML;
    showGenModal({
      title: "Vazifa tayyor! 🎉",
      text: `<b>${category}</b> yo'nalishi bo'yicha <b>${time} daqiqalik</b> mashq generatsiya qilindi.`,
    });
  }, 1500);
});

// ---- "Yangi odat" tugmasi (sidebar) ----
document.querySelector(".btn-add-habit")?.addEventListener("click", () => {
  window.location.href = "leardboard.html#yangi-odat";
});

// ---- FAB tugmasi ----
document.querySelector(".fab")?.addEventListener("click", () => {
  generateBtn?.scrollIntoView({ behavior: "smooth", block: "center" });
});