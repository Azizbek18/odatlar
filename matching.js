document.addEventListener('DOMContentLoaded', () => {
    // ===== Toast funksiyasi =====
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) {
            const c = document.createElement('div');
            c.id = 'toast-container';
            c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(c);
        }
        const toast = document.createElement('div');
        const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
        toast.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:14px 20px;border-radius:12px;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.15);transform:translateX(100%);transition:transform 0.3s ease;max-width:350px;`;
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => { toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3500);
    }

    // ===== Progress bar va timer =====
    const progressFill = document.querySelector('.progress-fill');
    const timerText = document.querySelector('.timer-text');

    const matchData = localStorage.getItem('current_match');
    if (matchData) {
        try {
            const partner = JSON.parse(matchData);
            const avatarImg = document.querySelector('.avatar-image-box img');
            if (avatarImg && partner.avatar) avatarImg.src = partner.avatar;
            
            const mainTitle = document.querySelector('.main-title');
            if (mainTitle) mainTitle.textContent = `${partner.name} bilan bog'lanilmoqda...`;
            
            const subTitle = document.querySelector('.sub-title');
            if (subTitle) subTitle.textContent = `${partner.role} bilan tushlik uchrashuvi sozlanmoqda`;
        } catch(e) {
            console.error("Error loading match data in loader:", e);
        }
    }
    
    let totalSeconds = 4; // 4 soniyalik yuklanish
    let elapsed = 0;

    const interval = setInterval(() => {
        elapsed++;
        const percent = Math.min((elapsed / totalSeconds) * 100, 100);
        progressFill.style.width = percent + '%';

        const remaining = totalSeconds - elapsed;
        if (remaining > 0) {
            timerText.textContent = `0:0${remaining} qoldi`;
        } else {
            timerText.textContent = 'Topildi!';
        }

        if (elapsed >= totalSeconds) {
            clearInterval(interval);
            
            // Hamroh topildi - chat sahifasiga yo'naltirish
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 800);
        }
    }, 1000);

    // ===== Bildirishnomalar tugmasi =====
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            window.location.href = 'Bildirishnomalar.html';
        });
    }

    // ===== Profil tugmasi =====
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = 'profileS.html';
        });
    }
});
