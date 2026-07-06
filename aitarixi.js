document.addEventListener('DOMContentLoaded', () => {

    // ===== TOAST BILDIRISHNOMALAR FUNKSIYASI =====
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const colors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
        toast.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:14px 20px;border-radius:12px;font-family:'Inter',sans-serif;font-weight:600;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.15);transform:translateX(100%);transition:transform 0.3s ease;max-width:350px;`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => { toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3500);
    }

    // ===== Header hodisalari =====
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            window.location.href = 'Bildirishnomalar.html';
        });
    }

    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = 'profileS.html';
        });
    }

    // ===== Pagination hodisalari =====
    const pageNums = document.querySelectorAll('.pagination .page-num');
    pageNums.forEach(num => {
        num.addEventListener('click', () => {
            pageNums.forEach(n => n.classList.remove('active'));
            num.classList.add('active');
            showToast(`${num.textContent}-sahifa yuklandi`, "success");
        });
    });

    const pageArrows = document.querySelectorAll('.pagination .page-arrow');
    pageArrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            showToast("Sahifalash tez kunda!", "info");
        });
    });

    // ===== Barchasini ko'rish tugmasi =====
    const viewAllBtn = document.querySelector('.btn-view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            window.location.href = 'matchlartarixi.html';
        });
    }

    // 1. INPUT FILTR (KATEGORIYALAR TABI ALMAShINISHI)
    const tabs = document.querySelectorAll('.tab-item');
    const cards = document.querySelectorAll('.history-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Aktiv klassni o'zgartirish
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            cards.forEach(card => {
                const status = card.getAttribute('data-status');
                const isSaved = card.querySelector('.btn-save').classList.contains('saved');

                if (filterValue === 'barchasi') {
                    card.style.display = 'block';
                } else if (filterValue === 'saqlanganlar') {
                    card.style.display = isSaved ? 'block' : 'none';
                } else {
                    card.style.display = (status === filterValue) ? 'block' : 'none';
                }
            });
        });
    });

    // 2. YULDUZCHALAR REYTINGI (Interaktiv baholash)
    const starContainers = document.querySelectorAll('.stars');
    
    starContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                // Tanlangan yulduzgacha bo'lganlarini faollashtirish
                stars.forEach((s, idx) => {
                    if (idx <= index) {
                        s.className = 'fa-solid fa-star active';
                    } else {
                        s.className = 'fa-regular fa-star';
                    }
                });
                showToast(`Uchrashuv ${index + 1} yulduzga baholandi!`, "success");
            });
        });
    });

    // 3. SAQLASH (Bookmark) TUGMASI HODISASI
    const saveButtons = document.querySelectorAll('.btn-save');
    
    saveButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('saved')) {
                btn.classList.remove('saved');
                btn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Saqlash`;
                showToast("Saqlanganlardan olib tashlandi.", "info");
            } else {
                btn.classList.add('saved');
                btn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Saqlash`;
                showToast("Saqlanganlarga qo'shildi!", "success");
            }
        });
    });

    // 4. GLOBAL QIDIRUV (Navbar orqali matnlarni izlash)
    const globalSearch = document.getElementById('global-search');
    
    globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // 5. TEXTAREA (Fikringizni qoldiring) ENTER BILAN SODDA LOGGING
    const textareas = document.querySelectorAll('.feedback-input');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('blur', () => {
            if (textarea.value.trim() !== "") {
                showToast("Fikringiz saqlandi", "success");
            }
        });
    });
});
