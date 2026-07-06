document.addEventListener('DOMContentLoaded', () => {
    const localStorageKey = 'sb-doboqtivghcdcoowoxmh-auth-token';
    const localToken = localStorage.getItem(localStorageKey);
    const isLoggedIn = !!localToken;

    // ===== TOASTIFY FUNKSIYASI =====
    function showNotification(message, type = 'success') {
        let bgColor = '#22c55e'; // Yashil
        if (type === 'error') bgColor = '#ef4444'; // Qizil
        if (type === 'info') bgColor = '#3b82f6'; // Ko'k

        Toastify({
            text: message,
            duration: 3500,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: bgColor,
                borderRadius: "12px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                padding: "14px 20px"
            }
        }).showToast();
    }

    // 1. Intercept header navigation "Xarita" link
    const xaritaLink = document.getElementById('xaritaLink');
    if (xaritaLink) {
        xaritaLink.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                e.preventDefault(); // Stop link navigation
                showNotification("Interaktiv xaritadan foydalanish uchun iltimos avval tizimga kiring!", "info");
                setTimeout(() => {
                    window.location.href = 'kirish.html';
                }, 1500);
            }
        });
    }

    // 2. Dynamically adjust header buttons based on login state
    const headerActions = document.querySelector('.header__actions');
    if (headerActions) {
        if (isLoggedIn) {
            headerActions.innerHTML = `
                <button class="btn btn--link" id="logoutBtn">Chiqish</button>
                <button class="btn btn--primary" onclick="window.location.href='Asosiy.html'">Asosiy sahifaga o'tish</button>
            `;

            // Add event listener to Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem(localStorageKey);
                    localStorage.removeItem('current_match');
                    showNotification("Tizimdan muvaffaqiyatli chiqdingiz.", "success");
                    setTimeout(() => {
                        location.reload();
                    }, 1200);
                });
            }

            // Logout logikasidan pastda quyidagi kodni ham qo'shing (agar foydalanuvchi tepadagi logotipni bossa ham Asosiy.html ga o'tsin):
            const logoLink = document.querySelector('.logo');
            if (logoLink) {
                logoLink.style.cursor = "pointer";
                logoLink.onclick = () => { window.location.href = 'Asosiy.html'; };
            }
        }
    }

    // FAQ Accordion click functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });

    // ===== BARCHA TUGMALAR VA LINKLAR UCHUN EVENT LISTENERLAR =====
    // 3. Ilovani yuklash tugmalari (App Store / Google Play)
    const storeButtons = document.querySelectorAll('.store-button');
    storeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('href');
            if (!target || target === '#') {
                e.preventDefault();
                showNotification("Birgalikda mobil ilovasi tez kunda App Store va Google Play'ga joylashtiriladi!", "info");
            }
        });
    });

    // 4. Ijtimoiy tarmoq piktogrammalari (Telegram, LinkedIn, Instagram)
    const socialLinks = document.querySelectorAll('.social-icons a');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (!target || target === '#') {
                e.preventDefault();
                const platformName = link.textContent.trim();
                showNotification(`Birgalikda ${platformName} kanali tez kunda ishga tushadi! Bizni kuzatib boring.`, "info");
            }
        });
    });

    // 5. Footer havolalari
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (!target || target === '#') {
                e.preventDefault();
                const text = link.textContent.trim();
                showNotification(`"${text}" bo'limi hozircha tayyorlanmoqda.`, "info");
            }
        });
    });

    // 6. Qolgan faol bo'lmagan tugmalar
    const secondaryHeroBtn = document.querySelector('.hero__buttons .btn--secondary');
    // Scroll behavior was added in html via onclick directly, but if not we can add it here too
    
});
