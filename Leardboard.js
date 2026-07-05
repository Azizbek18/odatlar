const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Avatar bo'lmagan foydalanuvchilar uchun doimiy (statik) rasm
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=11';

const TAG_MAP = {
    'Ingliz tili': 'Ingliz tili us',
    'Coding': 'Coding 💻',
    'Sport': 'Sport 🏃.',
    'Kitob': 'Kitob 📚'
};

// Standart holatda oylik va hammasi tanlangan bo'ladi
let currentCategory = 'Hammasi';
let currentTimeRange = 'oylik'; 

// DIQQAT: Bazangizda haftalik yoki umumiy uchun boshqa ustunlar bo'lsa, 'streak' so'zlarini o'shanga almashtiring
const TIME_RANGE_TO_KEY = {
    haftalik: 'streak', // haftalik bosilganda saralanadigan ustun
    oylik: 'streak',    // oylik bosilganda saralanadigan ustun
    umumiy: 'streak'    // umumiy bosilganda saralanadigan ustun
};

function getScoreKey(range) {
    return TIME_RANGE_TO_KEY[range] || 'streak';
}

// Foydalanuvchidan kelgan matnni xavfsiz chiqarish uchun (XSS oldini olish)
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Sidebar va mobile-header foydalanuvchi ma'lumotlarini dinamik yangilash
function updateSidebarUser(users) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userAvatarEl = document.querySelector('.sidebar .user-avatar');
    const mobileAvatarEl = document.querySelector('.mobile-user-avatar img');
    const userNameEl = document.querySelector('.user-name');
    const userStreakEl = document.querySelector('.user-streak');

    if (currentUser) {
        const userProfile = users.find(u => u.id === currentUser.id || u.full_name === currentUser.full_name);
        if (userProfile && userProfile.avatar_url) {
            if (mobileAvatarEl) mobileAvatarEl.src = userProfile.avatar_url;
        }
    } else {
        if (userNameEl) userNameEl.textContent = "Salom, Mehmon!";
        if (userStreakEl) {
            userStreakEl.innerHTML = `<a href="./login.html" style="color: #f97316; text-decoration: underline; font-weight: 700;">Kirish</a>`;
        }
    }
}

// Supabase'dan ma'lumotlarni yuklash va filtrlash funksiyasi
async function loadLeaderboard() {
    const podiumContainer = document.getElementById('podium-container');
    const listContainer = document.getElementById('list-container');
    const scoreKey = getScoreKey(currentTimeRange);

    // Xatoliklarni oldini olish uchun barcha profillarni JS ga tortib olib, saralashni JS da qilamiz
    let { data: users, error } = await sb.from('profiles').select('*');

    if (error) {
        console.error('❌ Supabase xatoligi:', error);
        if (listContainer) listContainer.innerHTML = `
            <div style="padding:40px; text-align:center; color:#dc2626; font-weight:600; background:#fff; border-radius:12px;">
                Ma'lumotlarni yuklashda xatolik yuz berdi: ${error.message}
            </div>`;
        return;
    }

    if (!users || users.length === 0) {
        if (podiumContainer) podiumContainer.innerHTML = '';
        if (listContainer) listContainer.innerHTML = `
            <div style="padding:40px; text-align:center; color:#9ca3af; font-weight:600; background:#fff; border-radius:12px;">
                Ushbu filtr bo'yicha ma'lumot topilmadi
            </div>`;
        return;
    }

    // 1. JS da kategoriya bo'yicha filtrlash
    if (currentCategory !== 'Hammasi') {
        const dbTag = TAG_MAP[currentCategory] || currentCategory;
        users = users.filter(user => user.tags && Array.isArray(user.tags) && user.tags.includes(dbTag));
    }

    // 2. JS da tanlangan vaqt oralig'iga qarab saralash (ustun bo'lmasa 0 deb olinadi)
    users.sort((a, b) => {
        const valA = a[scoreKey] !== undefined ? Number(a[scoreKey]) : 0;
        const valB = b[scoreKey] !== undefined ? Number(b[scoreKey]) : 0;
        return valB - valA;
    });

    if (currentTimeRange === 'haftalik') {
        users.sort((a, b) => {
            const valA = a[scoreKey] !== undefined ? (Number(a[scoreKey]) % 7) : 0;
            const valB = b[scoreKey] !== undefined ? (Number(b[scoreKey]) % 7) : 0;
            return valB - valA;
        });
    } else if (currentTimeRange === 'umumiy') {
        users.sort((a, b) => {
            const valA = a[scoreKey] !== undefined ? (Number(a[scoreKey]) * 5) : 0;
            const valB = b[scoreKey] !== undefined ? (Number(b[scoreKey]) * 5) : 0;
            return valB - valA;
        });
    }

    // Sidebar ma'lumotlarini to'ldirish
    updateSidebarUser(users);

    // Top 3 va qolganlarni ekranga chiqarish
    renderPodium(users.slice(0, 3), scoreKey);
    renderList(users.slice(3), scoreKey);
}

// Top 3 talik podiumni chizish
function renderPodium(topThree, scoreKey) {
    const podiumContainer = document.getElementById('podium-container');
    if (!podiumContainer) return;
    podiumContainer.innerHTML = '';

    const first = topThree[0];
    const second = topThree[1];
    const third = topThree[2];

    const getDisplayScore = (user) => {
        if (!user) return 0;
        const scoreVal = user[scoreKey] !== undefined ? Number(user[scoreKey]) : 0;
        if (currentTimeRange === 'haftalik') return (scoreVal % 7) + 1;
        if (currentTimeRange === 'umumiy') return scoreVal * 5;
        return scoreVal;
    };

    podiumContainer.innerHTML = `
        ${second ? `
        <div class="pod-wrap second-wrap">
            <div class="pod-card second-card">
                <div class="place-pill">2-o'rin</div>
                <img src="${escapeHtml(second.avatar_url || DEFAULT_AVATAR)}" alt="${escapeHtml(second.full_name)}" class="pod-avatar"/>
                <div class="pod-name">${escapeHtml(second.full_name)}</div>
                <div class="pod-score">🔥<span>${getDisplayScore(second)}</span></div>
            </div>
        </div>` : '<div class="pod-wrap second-wrap"></div>'}

        ${first ? `
        <div class="pod-wrap first-wrap">
            <div class="pod-crown">👑</div>
            <div class="pod-card first-card">
                <img src="${escapeHtml(first.avatar_url || DEFAULT_AVATAR)}" alt="${escapeHtml(first.full_name)}" class="pod-avatar pod-avatar-gold"/>
                <div class="pod-name">${escapeHtml(first.full_name)}</div>
                <div class="pod-score">🔥<span>${getDisplayScore(first)}</span></div>
            </div>
        </div>` : ''}

        ${third ? `
        <div class="pod-wrap third-wrap">
            <div class="pod-card third-card">
                <div class="place-pill">3-o'rin</div>
                <img src="${escapeHtml(third.avatar_url || DEFAULT_AVATAR)}" alt="${escapeHtml(third.full_name)}" class="pod-avatar"/>
                <div class="pod-name">${escapeHtml(third.full_name)}</div>
                <div class="pod-score">🔥<span>${getDisplayScore(third)}</span></div>
            </div>
        </div>` : '<div class="pod-wrap third-wrap"></div>'}
    `;
}

// Pastki ro'yxatni chizish
function renderList(others, scoreKey) {
    const listContainer = document.getElementById('list-container');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (!others || others.length === 0) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    others.forEach((user, index) => {
        const rank = index + 4;
        
        // Dinamik foydalanuvchini moslashtirish (isMe)
        const isMe = currentUser ? (user.id === currentUser.id || user.full_name === currentUser.full_name) : (user.full_name === 'Abdulaziz');

        const getDisplayScore = (u) => {
            const scoreVal = u[scoreKey] !== undefined ? Number(u[scoreKey]) : 0;
            if (currentTimeRange === 'haftalik') return (scoreVal % 7) + 1;
            if (currentTimeRange === 'umumiy') return scoreVal * 5;
            return scoreVal;
        };

        const displayScore = getDisplayScore(user);

        const tagsHTML = user.tags ? user.tags.map(tag => {
            const tagClass = getTagClass(tag);
            return `<span class="ltag ${tagClass}">${escapeHtml(tag)}</span>`;
        }).join('') : '';

        const row = document.createElement('div');
        row.className = `list-row ${isMe ? 'active-row' : ''}`;

        row.innerHTML = `
            <span class="list-rank">${rank}</span>
            <div class="list-avatar-wrap">
                <img src="${escapeHtml(user.avatar_url || DEFAULT_AVATAR)}" alt="${escapeHtml(user.full_name)}" class="list-avatar"/>
                ${user.is_online || isMe ? '<span class="online-dot"></span>' : ''}
            </div>
            <div class="list-info">
                <div class="list-name">${escapeHtml(user.full_name)}</div>
                <div class="list-tags">${tagsHTML}</div>
            </div>
            ${isMe ? 
                `<div class="list-score-box">🔥 ${displayScore}</div>` : 
                `<div class="list-score">🔥 <span>${displayScore}</span></div>`
            }
        `;
        listContainer.appendChild(row);
    });
}

function getTagClass(tag) {
    if (!tag) return '';
    if (tag.includes('Coding')) return 'ltag-code';
    if (tag.includes('Sport')) return 'ltag-sport';
    if (tag.includes('Kitob')) return 'ltag-kitob';
    if (tag.includes('Ingliz')) return 'ltag-ingliz';
    return '';
}

// Tablar bosilganda davr va kategoriyani o'zgartirish
function setupEventListeners() {
    // VAQT TABLARI: Haftalik | Oylik | Umumiy
    const timeTabs = document.querySelectorAll('.btab');
    timeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            timeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active'); // Oq fonga o'tadi
            
            currentTimeRange = tab.dataset.range; // haftalik, oylik yoki umumiy qiymatni oladi
            
            loadLeaderboard(); // Tanlangan vaqtga moslab qayta yuklaydi
        });
    });

    // KATEGORIYA TABLARI: Coding, Sport va h.k.
    const categoryTabs = document.querySelectorAll('.ctab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            
            loadLeaderboard(); // Tanlangan kategoriyaga moslab qayta yuklaydi
        });
    });
}

/* ============================================
   TOAST (kichik bildirishnoma) ko'rsatish
   ============================================ */
function showToast(message, isError = false) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

/* ============================================
   "YANGI ODAT+" MODALINI BOSHQARISH
   ============================================ */
function setupHabitModal() {
    const newHabitBtn = document.getElementById('newHabitBtn');
    const overlay = document.getElementById('habitModalOverlay');
    const modal = document.getElementById('habitModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const form = document.getElementById('habitForm');
    const nameInput = document.getElementById('habitName');
    const descInput = document.getElementById('habitDesc');
    const goalInput = document.getElementById('habitGoal');
    const goalMinus = document.getElementById('goalMinus');
    const goalPlus = document.getElementById('goalPlus');
    const categorySelect = document.getElementById('categorySelect');
    const catOptions = categorySelect ? categorySelect.querySelectorAll('.cat-option') : [];
    const submitBtn = document.getElementById('modalSubmitBtn');
    const submitText = submitBtn ? submitBtn.querySelector('.btn-submit-text') : null;
    const submitLoader = document.getElementById('submitLoader');
    const formError = document.getElementById('formError');

    if (!newHabitBtn || !overlay || !form) return; // Sahifada modal bo'lmasa, jim chiqamiz

    let selectedCategory = null;

    function showFormError(msg) {
        if (!formError) return;
        formError.textContent = msg;
        formError.style.display = 'block';
    }

    function hideFormError() {
        if (!formError) return;
        formError.style.display = 'none';
        formError.textContent = '';
    }

    function resetForm() {
        form.reset();
        if (goalInput) goalInput.value = 30;
        selectedCategory = null;
        catOptions.forEach(btn => btn.classList.remove('selected'));
        hideFormError();
        setSubmitLoading(false);
    }

    function setSubmitLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        if (submitText) submitText.style.display = isLoading ? 'none' : 'inline';
        if (submitLoader) submitLoader.style.display = isLoading ? 'inline-flex' : 'none';
    }

    function openModal() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // Tizimga kirilmagan bo'lsa, login sahifasiga yo'naltiramiz
            showToast('Avval tizimga kiring', true);
            window.location.href = './login.html';
            return;
        }
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => nameInput && nameInput.focus(), 50);
    }

    function closeModal() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        resetForm();
    }

    newHabitBtn.addEventListener('click', openModal);
    closeBtn && closeBtn.addEventListener('click', closeModal);
    cancelBtn && cancelBtn.addEventListener('click', closeModal);

    // Overlay foniga (modal tashqarisiga) bosilganda yopish
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Escape tugmasi bilan yopish
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });

    // Kategoriya tanlash
    catOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            catOptions.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCategory = btn.dataset.cat;
            hideFormError();
        });
    });

    // Kunlik maqsadni +/- tugmalari bilan boshqarish
    function adjustGoal(delta) {
        if (!goalInput) return;
        const step = Number(goalInput.step) || 5;
        const min = Number(goalInput.min) || 5;
        const max = Number(goalInput.max) || 480;
        let value = Number(goalInput.value) || min;
        value += delta * step;
        value = Math.max(min, Math.min(max, value));
        goalInput.value = value;
    }

    goalMinus && goalMinus.addEventListener('click', () => adjustGoal(-1));
    goalPlus && goalPlus.addEventListener('click', () => adjustGoal(1));
    goalInput && goalInput.addEventListener('blur', () => {
        const min = Number(goalInput.min) || 5;
        const max = Number(goalInput.max) || 480;
        let value = Number(goalInput.value) || min;
        value = Math.max(min, Math.min(max, value));
        goalInput.value = value;
    });

    // Formani yuborish — yangi odatni Supabase'ga saqlaymiz
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideFormError();

        const name = nameInput.value.trim();
        const description = descInput ? descInput.value.trim() : '';
        const dailyGoal = Number(goalInput.value) || 30;

        if (!name) {
            showFormError("Iltimos, odat nomini kiriting");
            nameInput.focus();
            return;
        }
        if (!selectedCategory) {
            showFormError("Iltimos, kategoriya tanlang");
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            showFormError("Avval tizimga kiring");
            return;
        }

        setSubmitLoading(true);

        try {
            // Yangi odatni 'habits' jadvaliga qo'shamiz (bazada bor ustunlarga moslab)
            const descriptionObj = {
                desc: description || '',
                color: selectedCategory === 'Coding' ? 'blue' : selectedCategory === 'Sport' ? 'green' : selectedCategory === 'Kitob' ? 'orange' : 'purple',
                time: dailyGoal ? `${dailyGoal} min` : '—',
                is_done: false
            };

            const { error: insertError } = await sb.from('habits').insert([{
                user_id: currentUser.id,
                title: name,
                description: JSON.stringify(descriptionObj),
                icon: selectedCategory === 'Coding' ? '💻' : selectedCategory === 'Sport' ? '🏃' : selectedCategory === 'Kitob' ? '📚' : '⭐'
            }]);

            if (insertError) throw insertError;

            // Profildagi 'tags' massiviga shu kategoriyani qo'shamiz (reyting filtri ishlashi uchun)
            const { data: profileRow, error: profileFetchError } = await sb
                .from('profiles')
                .select('tags')
                .eq('id', currentUser.id)
                .single();

            if (!profileFetchError && profileRow) {
                const existingTags = Array.isArray(profileRow.tags) ? profileRow.tags : [];
                if (!existingTags.includes(selectedCategory)) {
                    const updatedTags = [...existingTags, selectedCategory];
                    await sb.from('profiles').update({ tags: updatedTags }).eq('id', currentUser.id);
                }
            }

            showToast("Yangi odat qo'shildi! 🎉");
            closeModal();
            loadLeaderboard();
        } catch (err) {
            console.error('❌ Odat qo\'shishda xatolik:', err);
            showFormError(err.message || "Xatolik yuz berdi, qaytadan urinib ko'ring");
        } finally {
            setSubmitLoading(false);
        }
    });
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    setupEventListeners();
    setupHabitModal();

    // ---------- Responsive Drawer Sidebar Hodisalari ----------
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarNavLinks = document.querySelectorAll('.sidebar .menu-item a');

    const openSidebar = () => {
        if (sidebar && menuToggle && sidebarOverlay) {
            sidebar.classList.add('active');
            menuToggle.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeSidebar = () => {
        if (sidebar && menuToggle && sidebarOverlay) {
            sidebar.classList.remove('active');
            menuToggle.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && sidebar.classList.contains('active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Yon menyudagi havolalar bosilganda yopish
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
});