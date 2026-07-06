document.addEventListener('DOMContentLoaded', () => {
    // --- SUPABASE SOZLAMALARI ---
    const SUPABASE_URL = 'https://doboqtivghcdcoowoxmh.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // --- TOASTIFY FUNKSIYASI ---
    function showNotification(message, type = 'success') {
        let container = document.getElementById('premium-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'premium-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                perspective: 1000px;
                pointer-events: none;
            `;
            document.body.appendChild(container);

            if (!document.getElementById('premium-toast-styles')) {
                const style = document.createElement('style');
                style.id = 'premium-toast-styles';
                style.innerHTML = `
                    .premium-toast {
                        background: rgba(255, 255, 255, 0.7);
                        backdrop-filter: blur(20px) saturate(180%);
                        -webkit-backdrop-filter: blur(20px) saturate(180%);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        border-radius: 16px;
                        padding: 16px 24px;
                        font-family: 'Poppins', 'Inter', sans-serif;
                        font-weight: 600;
                        font-size: 14px;
                        color: #1e293b;
                        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08), 
                                    inset 0 1px 1px rgba(255, 255, 255, 0.5);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        min-width: 320px;
                        max-width: 400px;
                        pointer-events: auto;
                        transform: translateX(120%) rotateY(-30deg) scale(0.9);
                        opacity: 0;
                        transform-origin: right center;
                        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .premium-toast.active {
                        transform: translateX(0) rotateY(0deg) scale(1);
                        opacity: 1;
                    }
                    .premium-toast.exit {
                        transform: translateX(120%) rotateY(30deg) scale(0.9);
                        opacity: 0;
                    }
                    .premium-toast::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 15%;
                        height: 70%;
                        width: 5px;
                        border-radius: 0 4px 4px 0;
                    }
                    .premium-toast.success::before { background: #12b76a; }
                    .premium-toast.error::before { background: #ef4444; }
                    .premium-toast.info::before { background: #3b82f6; }
                    .premium-toast.warning::before { background: #f59e0b; }
                    
                    .premium-toast-icon {
                        font-size: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .premium-toast.success .premium-toast-icon { color: #12b76a; }
                    .premium-toast.error .premium-toast-icon { color: #ef4444; }
                    .premium-toast.info .premium-toast-icon { color: #3b82f6; }
                    .premium-toast.warning .premium-toast-icon { color: #f59e0b; }
                `;
                document.head.appendChild(style);
            }
        }

        const toast = document.createElement('div');
        toast.className = `premium-toast ${type}`;

        const icons = {
            success: '✨',
            error: '🚨',
            info: '💡',
            warning: '⚠️'
        };

        toast.innerHTML = `
            <div class="premium-toast-icon">${icons[type] || '💡'}</div>
            <div style="flex: 1;">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('active');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('active');
            toast.classList.add('exit');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3500);
    }

    // 1. Google tugmasi bosilganda toast ko'rsatish
    const googleBtn = document.getElementById('google-login');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            showNotification("Google orqali kirish tez kunda sozlanadi!", "info");
        });
    }

    // 2. Facebook tugmasi bosilganda toast ko'rsatish
    const facebookBtn = document.getElementById('facebook-login');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => {
            showNotification("Facebook orqali kirish tez kunda sozlanadi!", "info");
        });
    }

    // 2.1 "Parolni unutdingizmi?" havolasi
    const forgotPassLink = document.querySelector('.forgot-pass');
    if (forgotPassLink) {
        forgotPassLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'Yordam.html#support-form';
        });
    }

    // 2.2 Til almashtirgich (UZ / RU / EN)
    const langSpans = document.querySelectorAll('.lang-selector span');
    langSpans.forEach(span => {
        span.addEventListener('click', () => {
            langSpans.forEach(s => s.classList.remove('active'));
            span.classList.add('active');
            const lang = span.textContent.trim();
            if (lang !== 'UZ') {
                showNotification(`Til o'zgartirildi: ${lang}`, "info");
            }
        });
    });

    // 3. Parolni ko'rsatish va yashirish (Ko'zcha ko'rinishi)
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('toggle-pwd-icon');

    if (togglePasswordIcon) {
        togglePasswordIcon.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordIcon.classList.remove('fa-eye');
                togglePasswordIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                togglePasswordIcon.classList.remove('fa-eye-slash');
                togglePasswordIcon.classList.add('fa-eye');
            }
        });
    }

    // 4. Chap tomondagi soatni jonli (Real-time) yangilab turish
    const liveClock = document.getElementById('live-clock');
    function updateClock() {
        if (!liveClock) return;
        const now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        liveClock.textContent = `${hours}:${minutes}`;
    }
    setInterval(updateClock, 1000);
    updateClock(); // Sahifa yuklanganda darhol ishlashi uchun

    // 5. Formani yuborish (Supabase orqali haqiqiy kirish)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailVal = document.getElementById('email').value.trim();
            const passwordVal = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('.submit-btn');

            if (!emailVal || !passwordVal) {
                showNotification("Iltimos, email va parolni to'ldiring.", "error");
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Kirilmoqda...";
            showNotification("Tizimga kirilmoqda...", "info");

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: emailVal,
                    password: passwordVal
                });

                if (error) throw error;

                // Supabase'dan foydalanuvchi roli va ismini yuklab olish
                let role = 'Talaba';
                let fullName = emailVal.split('@')[0];

                try {
                    const { data: profileData, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role, full_name')
                        .eq('id', data.user.id)
                        .single();

                    if (!profileError && profileData) {
                        role = profileData.role || 'Talaba';
                        fullName = profileData.full_name || fullName;
                    } else {
                        role = data.user.user_metadata?.role || 'Talaba';
                        fullName = data.user.user_metadata?.full_name || fullName;
                    }
                } catch (pErr) {
                    console.warn("Profil jadvalidan ma'lumot olishda xatolik:", pErr);
                    role = data.user.user_metadata?.role || 'Talaba';
                    fullName = data.user.user_metadata?.full_name || fullName;
                }

                // localStorage'ga yozish
                localStorage.setItem('user_role', role);
                localStorage.setItem('user_name', fullName);

                showNotification(`Muvaffaqiyatli kirdingiz! Xush kelibsiz, ${fullName} (${role}).`, "success");

                // Onboarding bajarilganini tekshirish
                const onboardingCompleted = localStorage.getItem(`onboarding_completed_${data.user.id}`) === 'true';
                setTimeout(() => {
                    if (onboardingCompleted) {
                        window.location.href = 'Asosiy.html';
                    } else {
                        window.location.href = 'onboarding1.html';
                    }
                }, 1500);

            } catch (error) {
                console.error("Kirishda xatolik:", error.message);
                let userFriendlyMsg = "Xatolik: Email yoki parol noto'g'ri!";

                if (error.message.includes("Email not confirmed")) {
                    userFriendlyMsg = "Xatolik: Elektron pochta hali tasdiqlanmagan! Pochtangizni tekshiring yoki sozlamalardan tasdiqlashni o'chiring.";
                } else if (error.message.includes("Invalid login credentials")) {
                    userFriendlyMsg = "Xatolik: Email yoki parol noto'g'ri!";
                } else {
                    userFriendlyMsg = `Xatolik: ${error.message}`;
                }

                showNotification(userFriendlyMsg, "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Tizimga kirish";
            }
        });
    }

    // Check for redirect message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('msg') === 'unauthorized') {
        setTimeout(() => {
            showNotification("Ushbu sahifadan foydalanish uchun iltimos avval tizimga kiring!", "info");
        }, 300);
    }
});
