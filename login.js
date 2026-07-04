// ============================================
// Streak.uz — Login Page JS
// ============================================

const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Toast konteynerini yaratish
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // 3D Premium Toast yaratish funksiyasi
    function showPremiumToast(title, desc, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `premium-toast ${type}`;

        const icon = type === 'success' ? '🔥' : '⚠️';

        toast.innerHTML = `
            <div class="premium-toast-icon">${icon}</div>
            <div class="premium-toast-content">
                <div class="premium-toast-title">${title}</div>
                <div class="premium-toast-desc">${desc}</div>
            </div>
            <div class="premium-toast-progress"></div>
        `;

        toastContainer.appendChild(toast);

        // Yon tomondan 3D aylanib chiqishi uchun animatsiya
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // 3.2 soniyadan keyin toastni yopish va o'chirish
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            // Animatsiya tugagach o'chirish (600ms transition + bufer)
            setTimeout(() => {
                toast.remove();
            }, 650);
        }, 3200);
    }

    // Ko'zcha parolni ko'rsatish/yashirish mantiqi
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.classList.remove('fa-eye');
                togglePassword.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                togglePassword.classList.remove('fa-eye-slash');
                togglePassword.classList.add('fa-eye');
            }
        });
    }

    // Kirish formasini topshirish (profiles jadvali orqali tekshirish)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Elementlar mavjudligini tekshirish
            if (!emailInput || !passwordInput) {
                console.error("HTML sahifada kerakli elementlar topilmadi!");
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            const submitBtn = loginForm.querySelector('.kirish-tugmasi');
            let originalBtnHtml = '';

            // Loader (Loading holati) yoqish
            if (submitBtn) {
                originalBtnHtml = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                submitBtn.innerHTML = `<span class="spinner"></span> Kirilmoqda...`;
            }

            try {
                // profiles jadvalidan email va parol bo'yicha tekshirish
                const { data: users, error } = await sb
                    .from('profiles')
                    .select('*')
                    .eq('email', email)
                    .eq('password', password);

                if (error) {
                    console.error("Xatolik yuz berdi:", error.message);
                    showPremiumToast("Tizimda xatolik", "Qaytadan urinib ko'ring.", "error");

                    // Loader holatini o'chirish
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('loading');
                        submitBtn.innerHTML = originalBtnHtml;
                    }
                    return;
                }

                // Agar mos foydalanuvchi topilsa
                if (users && users.length > 0) {
                    const loggedInUser = users[0];

                    // Foydalanuvchi ma'lumotlarini brauzer xotirasiga (localStorage) saqlaymiz
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: loggedInUser.id,
                        full_name: loggedInUser.full_name,
                        email: loggedInUser.email
                    }));

                    showPremiumToast("Muvaffaqiyatli kirish", `Xush kelibsiz, ${loggedInUser.full_name}! 🔥`, "success");

                    // Asosiy sahifaga o'tkazish
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1800);

                } else {
                    // Foydalanuvchi bazada topilmasa yoki parol xato bo'lsa
                    showPremiumToast("Xatolik yuz berdi", "Bunday foydalanuvchi mavjud emas yoki parol noto'g'ri.", "error");

                    // Loader holatini o'chirish
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('loading');
                        submitBtn.innerHTML = originalBtnHtml;
                    }
                }
            } catch (err) {
                console.error("Tizimda kutilmagan xatolik:", err);
                showPremiumToast("Tarmoq xatosi", "Kutilmagan xatolik yuz berdi. Internetni tekshiring.", "error");

                // Loader holatini o'chirish
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }
});
