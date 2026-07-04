// =============================================
//  Streak.uz — Ro'yxatdan o'tish — royxat.js
// =============================================

// Supabase konfiguratsiyasi (O'z proyekt ma'lumotlaringizni kiriting)
const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Formani yuborish holatini tekshirish (Double submit oldini olish)
    let isSubmitting = false;

    // 1. PREMIUM GLASS TOAST FUNKSIYASI
    function showPremiumToast(message, type = 'warning') {
        const container = document.getElementById('premium-toast-container') || createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = 'premium-glass-toast';
        
        const icon = type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check';
        const iconColor = type === 'warning' ? '#ff9f43' : '#10b981';

        toast.innerHTML = `
            <div class="toast-content">
                <i class="fa-solid ${icon}" style="color: ${iconColor};"></i>
                <span>${message}</span>
            </div>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // 4 soniyadan keyin o'chirish
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    function createToastContainer() {
        const div = document.createElement('div');
        div.id = 'premium-toast-container';
        document.body.appendChild(div);
        injectPremiumStyles();
        return div;
    }

    function injectPremiumStyles() {
        if (document.getElementById('premium-styles')) return;
        const style = document.createElement('style');
        style.id = 'premium-styles';
        style.textContent = `
            #premium-toast-container {
                position: fixed; top: 30px; right: 30px; z-index: 9999;
                display: flex; flex-direction: column; gap: 15px;
            }
            .premium-glass-toast {
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.05);
                border-radius: 16px; padding: 18px 25px; min-width: 320px;
                color: #000000; font-family: "Nunito", "Nunito Sans", system-ui, sans-serif; overflow: hidden;
                position: relative; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                animation: toastSlideIn 0.5s ease forwards;
            }
            .toast-content { display: flex; align-items: center; gap: 15px; font-weight: 500; font-size: 14px; }
            .toast-content i { font-size: 20px; }
            .toast-progress {
                position: absolute; bottom: 0; left: 0; height: 3px;
                background: linear-gradient(90deg, #6366f1, #a855f7);
                width: 100%; animation: toastProgress 4s linear forwards;
            }
            @keyframes toastSlideIn {
                from { transform: translateX(100%) scale(0.9); opacity: 0; }
                to { transform: translateX(0) scale(1); opacity: 1; }
            }
            @keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
        `;
        document.head.appendChild(style);
    }

    // 2. RO'YXATDAN O'TISH LOGIKASI
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const fullName = fullNameInput.value.trim();

        // 1. Validatsiya
        if (!email || !password || !fullName) {
            showPremiumToast("Iltimos, barcha maydonlarni to'ldiring!", 'warning');
            return;
        }


        try {
            isSubmitting = true;
            submitBtn.disabled = true;
            submitBtn.innerText = "Tekshirilmoqda...";

            // 2. Foydalanuvchi bazada borligini tekshirish
            const { data: existingUser, error: checkError } = await _supabase
                .from('profiles')
                .select('email') // Faqat emailni tanlaymiz
                .eq('email', email)
                .limit(1); // Faqat bitta natijani kutamiz

            if (checkError) throw checkError;

            if (existingUser && existingUser.length > 0) { // Agar foydalanuvchi topilsa
                // FOYDALANUVCHI MAVJUD BO'LSA — JARAYONNI TO'XTATAMIZ
                showPremiumToast("Ushbu email bilan allaqachon ro'yxatdan o'tilgan!", 'warning');
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerText = "Ro'yxatdan o'tish";
                return; // MUHIM: Bu yerda funksiya to'xtaydi
            }

            // 3. Yangi foydalanuvchini to'g'ridan-to'g'ri 'profiles' jadvaliga qo'shish
            console.log("Ma'lumotlar bazaga yozilmoqda...");
            const { error: insertError } = await _supabase
                .from('profiles')
                .insert([
                    { email: email, password: password, full_name: fullName }
                ]);

            if (insertError) throw insertError;

            showPremiumToast("Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!", 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2500);

        } catch (err) {
            console.error(err);

            // Xatolik xabarini aniqlashtirish
            let errorMsg = err.message || "Tizimda xatolik yuz berdi!";
            if (err.status === 500) {
                errorMsg = "Serverda xatolik (500). API kalitlarini tekshiring yoki keyinroq urinib ko'ring.";
            } else if (err.message && err.message.includes('fetch')) {
                showPremiumToast("Tarmoq xatosi yoki API kalit noto'g'ri!", 'warning');
                errorMsg = null;
            }
            
            if (errorMsg) showPremiumToast(errorMsg, 'warning');

            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.innerText = "Ro'yxatdan o'tish";
        }
    });
});
