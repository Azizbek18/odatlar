// ========================================================
//  Streak.uz - shared sidebar, active navigation and state
// ========================================================

(function injectSidebarStyles() {
    if (document.getElementById('sidebar-shared-styles')) return;

    const style = document.createElement('style');
    style.id = 'sidebar-shared-styles';
    style.textContent = `
        :root {
            --primary: #7000ff;
            --primary-dark: #4c1d95;
            --primary-light: #e8dbff;
            --text-main: #162033;
            --text-light: #67748a;
            --sidebar-bg: #ffffff;
        }

        body.has-app-sidebar .app {
            margin-left: 280px;
            width: calc(100% - 280px);
        }

        .global-menu-toggle {
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 1001;
            width: 44px;
            height: 44px;
            border: 0;
            border-radius: 14px;
            background: #ffffff;
            color: #162033;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
            cursor: pointer;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }

        .sidebar {
            width: 280px;
            background: var(--sidebar-bg, #ffffff);
            padding: 30px 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-right: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 5px 0 25px rgba(0, 0, 0, 0.04);
            position: fixed;
            height: 100vh;
            top: 0;
            left: 0;
            z-index: 999;
            overflow-y: auto;
            overscroll-behavior: contain;
        }

        .sidebar .logo {
            font-size: clamp(20px, 2vw, 26px);
            font-weight: 900;
            color: var(--primary, #7000ff);
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 32px;
            line-height: 1.1;
            text-decoration: none;
            text-shadow: 0 4px 10px rgba(112, 0, 255, 0.15);
        }

        .user-welcome {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #fafafa;
            border-radius: 16px;
            margin-bottom: 20px;
            border-bottom: 3px solid #e0e0e0;
        }

        .user-avatar-fallback {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 2px solid var(--primary, #7000ff);
            background: linear-gradient(135deg, var(--primary-light, #e8dbff), #ffffff);
            color: var(--primary, #7000ff);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
            box-shadow: 0 6px 14px rgba(112, 0, 255, 0.16);
        }

        .user-avatar-fallback i {
            font-size: 18px;
        }

        .user-avatar-fallback img,
        .user-welcome img.user-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
            border: 0;
        }

        .user-avatar-fallback img[hidden],
        .user-welcome img.user-avatar[hidden] {
            display: none !important;
        }

        .user-welcome h4,
        .user-welcome .user-name {
            font-size: 14px;
            font-weight: 700;
            color: #2d3436;
            margin: 0;
        }

        .user-welcome p,
        .user-welcome .user-streak {
            font-size: 11px;
            color: #ff7675;
            font-weight: 600;
            margin: 0;
        }

        .menu-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 9px;
            flex-grow: 1;
            padding: 0;
            margin: 0;
        }

        .menu-item a {
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 13px 16px;
            color: var(--text-light, #67748a);
            text-decoration: none;
            font-weight: 800;
            border-radius: 14px;
            transition: all 0.2s ease;
            font-size: 14px;
            line-height: 1.2;
        }

        .menu-item:not(.active):not(.is-active) a:hover {
            background: #f1f2f6;
            transform: translateX(4px);
            color: var(--primary, #7000ff);
        }

        .btn-add-habit {
            background: var(--primary, #7000ff);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 16px;
            font-weight: 900;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.15s ease;
            box-shadow: 0 6px 0 var(--primary-dark, #4c1d95), 0 10px 20px rgba(112,0,255,0.2);
            width: 100%;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-top: 18px;
        }

        .sidebar-backdrop,
        .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.38);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
            z-index: 998;
        }

        .sidebar-backdrop.show,
        .sidebar-overlay.show,
        .sidebar-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .sidebar::-webkit-scrollbar { width: 6px; }
        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(112, 0, 255, 0.22);
            border-radius: 999px;
        }

        .sidebar-close {
            display: none !important;
        }

        .menu-item a i,
        .menu-svg-icon {
            font-size: 20px !important;
            width: 24px !important;
            height: 24px !important;
            text-align: center !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 0 0 24px !important;
        }

        .menu-svg-icon {
            object-fit: contain;
            filter: saturate(1.08);
        }

        .menu-item a > img.menu-svg-icon,
        .menu-item a > i + i {
            display: none !important;
        }

        .menu-item.active a,
        .menu-item.is-active a {
            background: var(--primary, #7000ff) !important;
            color: #ffffff !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 0 var(--primary-dark, #4c1d95), 0 10px 20px rgba(112,0,255,0.25);
        }

        .menu-item.active a .menu-svg-icon,
        .menu-item.is-active a .menu-svg-icon {
            filter: brightness(0) invert(1);
        }

        .btn-add-habit {
            min-height: 58px !important;
            height: 58px !important;
            width: 100% !important;
            padding: 0 18px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            font-size: 15px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            flex: 0 0 auto !important;
        }

        .btn-add-habit i {
            width: 20px !important;
            height: 20px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 18px !important;
            flex: 0 0 20px !important;
        }

        .main-container.single-col {
            grid-template-columns: 1fr !important;
            max-width: none;
        }

        @media (max-width: 900px) {
            .sidebar {
                width: min(280px, 85vw);
                transform: translateX(-110%);
                transition: transform 0.3s ease;
                z-index: 1000;
            }

            .sidebar.open,
            .sidebar.active,
            body.sidebar-open .sidebar {
                transform: translateX(0);
            }

            .sidebar-close {
                display: block !important;
                position: absolute !important;
                top: 18px !important;
                right: 18px !important;
                background: transparent !important;
                border: none !important;
                color: #2d3436 !important;
                font-size: 20px !important;
                cursor: pointer !important;
                z-index: 15 !important;
            }

            body.has-app-sidebar .app {
                margin-left: 0;
                width: 100%;
            }

            body.has-app-sidebar header {
                padding-left: 70px;
            }

            .global-menu-toggle {
                display: inline-flex;
            }
        }

        [data-theme="dark"] body {
            background: #121214 !important;
            color: #e5e7eb !important;
        }
        [data-theme="dark"] .sidebar {
            background: #1a1a1e !important;
            border-right-color: #2b2b30 !important;
            box-shadow: 6px 0 30px rgba(0, 0, 0, 0.3) !important;
        }
        [data-theme="dark"] .logo {
            color: #a78bfa !important;
            text-shadow: 0 2px 8px rgba(167, 139, 250, 0.25) !important;
        }
        [data-theme="dark"] .user-welcome,
        [data-theme="dark"] .card,
        [data-theme="dark"] .panel-card,
        [data-theme="dark"] .friend-card,
        [data-theme="dark"] .stat-card,
        [data-theme="dark"] .creative-card,
        [data-theme="dark"] .achieve-card,
        [data-theme="dark"] .list-row {
            background: #1a1a1e !important;
            border-color: #2b2b30 !important;
            color: #e5e7eb !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
        }
        [data-theme="dark"] .menu-item a { color: #9ca3af !important; }
        [data-theme="dark"] .menu-item:not(.active):not(.is-active) a:hover {
            background: #25252a !important;
            color: #a78bfa !important;
        }
        [data-theme="dark"] .main,
        [data-theme="dark"] .main-content,
        [data-theme="dark"] .main-container {
            color: #e5e7eb !important;
        }

        [data-animations="off"] *,
        [data-animations="off"] *::before,
        [data-animations="off"] *::after {
            transition: none !important;
            animation: none !important;
        }
    `;
    document.head.appendChild(style);
})();

(function applyGlobalSettings() {
    const THEME_KEY = 'streak_theme';
    const ANIM_KEY = 'streak_animations';
    const FONT_KEY = 'streak_font_size';

    function applyTheme() {
        const theme = localStorage.getItem(THEME_KEY) || 'auto';
        const actualTheme = theme === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;
        document.documentElement.setAttribute('data-theme', actualTheme);
    }

    function applyAnimations() {
        const enabled = localStorage.getItem(ANIM_KEY) !== 'off';
        document.documentElement.setAttribute('data-animations', enabled ? 'on' : 'off');
    }

    function applyFontSize() {
        const size = localStorage.getItem(FONT_KEY) || 'medium';
        const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };
        document.documentElement.style.fontSize = sizes[size] || sizes.medium;
    }

    applyTheme();
    applyAnimations();
    applyFontSize();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if ((localStorage.getItem(THEME_KEY) || 'auto') === 'auto') applyTheme();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === THEME_KEY) applyTheme();
        if (e.key === ANIM_KEY) applyAnimations();
        if (e.key === FONT_KEY) applyFontSize();
    });
})();

document.addEventListener('DOMContentLoaded', () => {
    const LANG_KEY = 'streak_lang';
    const translations = {
        uz: {
            nav_dashboard: 'Boshqaruv',
            nav_courses: 'Darslar',
            nav_flashcards: 'Flashcards',
            nav_ai_tasks: 'AI reja',
            nav_ai_generator: 'AI generator',
            nav_ai_analysis: 'AI tahlil',
            nav_reports: 'Hisobotlar',
            nav_friends: "Do'stlar",
            nav_achievements: 'Yutuqlar',
            nav_rating: 'Reyting',
            nav_profile: 'Profil',
            nav_settings: 'Sozlamalar',
            btn_add_habit: 'Yangi odat',
            greeting: 'Salom, {name}!',
            streak_suffix: '{n} kunlik streak'
        },
        ru: {
            nav_dashboard: 'Panel',
            nav_courses: 'Uroki',
            nav_flashcards: 'Kartochki',
            nav_ai_tasks: 'AI plan',
            nav_ai_generator: 'AI generator',
            nav_ai_analysis: 'AI analiz',
            nav_reports: 'Otchety',
            nav_friends: 'Druzya',
            nav_achievements: 'Dostizheniya',
            nav_rating: 'Reyting',
            nav_profile: 'Profil',
            nav_settings: 'Nastroyki',
            btn_add_habit: 'Novaya privychka',
            greeting: 'Privet, {name}!',
            streak_suffix: 'Seriya: {n} dney'
        },
        en: {
            nav_dashboard: 'Dashboard',
            nav_courses: 'Courses',
            nav_flashcards: 'Flashcards',
            nav_ai_tasks: 'AI Plan',
            nav_ai_generator: 'AI Generator',
            nav_ai_analysis: 'AI Analysis',
            nav_reports: 'Reports',
            nav_friends: 'Friends',
            nav_achievements: 'Achievements',
            nav_rating: 'Leaderboard',
            nav_profile: 'Profile',
            nav_settings: 'Settings',
            btn_add_habit: 'New habit',
            greeting: 'Hi, {name}!',
            streak_suffix: '{n}-day streak'
        }
    };

    const navItems = [
        { cls: 'nav-dashboard', href: './dashboard.html', icon: 'nav-dashboard.svg', fa: 'fa-table-cells-large', key: 'nav_dashboard', label: 'Boshqaruv', match: ['dashboard.html', 'habitdetail.html'] },
        { cls: 'nav-courses', href: './darslar.html', icon: 'nav-courses.svg', fa: 'fa-graduation-cap', key: 'nav_courses', label: 'Darslar', match: ['darslar.html', 'darsbolimi.html'] },
        { cls: 'nav-flashcards', href: './flashcards.html', icon: 'nav-flashcards.svg', fa: 'fa-layer-group', key: 'nav_flashcards', label: 'Flashcards', match: ['flashcards.html'] },
        { cls: 'nav-ai-tasks', href: './ai.html', icon: 'nav-ai-tasks.svg', fa: 'fa-calendar-check', key: 'nav_ai_tasks', label: 'AI reja', match: ['ai.html'] },
        { cls: 'nav-ai-generator', href: './aigenerator.html', icon: 'nav-ai-generator.svg', fa: 'fa-wand-magic-sparkles', key: 'nav_ai_generator', label: 'AI generator', match: ['aigenerator.html'] },
        { cls: 'nav-ai-analysis', href: './aitahlil.html', icon: 'nav-ai-analysis.svg', fa: 'fa-brain', key: 'nav_ai_analysis', label: 'AI tahlil', match: ['aitahlil.html'] },
        { cls: 'nav-reports', href: './hisobotlar.html', icon: 'nav-reports.svg', fa: 'fa-chart-line', key: 'nav_reports', label: 'Hisobotlar', match: ['hisobotlar.html'] },
        { cls: 'nav-friends', href: './friends.html', icon: 'nav-friends.svg', fa: 'fa-users', key: 'nav_friends', label: "Do'stlar", match: ['friends.html'] },
        { cls: 'nav-achievements', href: './yutuq.html', icon: 'nav-achievements.svg', fa: 'fa-medal', key: 'nav_achievements', label: 'Yutuqlar', match: ['yutuq.html'] },
        { cls: 'nav-rating', href: './Leardboard.html', icon: 'nav-rating.svg', fa: 'fa-ranking-star', key: 'nav_rating', label: 'Reyting', match: ['Leardboard.html'] },
        { cls: 'nav-profile', href: './profil.html', icon: 'nav-profile.svg', fa: 'fa-user', key: 'nav_profile', label: 'Profil', match: ['profil.html'] },
        { cls: 'nav-settings', href: './sozlamalar.html', icon: 'nav-settings.svg', fa: 'fa-gear', key: 'nav_settings', label: 'Sozlamalar', match: ['sozlamalar.html', 'hatib.html'] },
    ];

    let currentLang = localStorage.getItem(LANG_KEY) || 'uz';

    function t(key, vars = {}) {
        let str = translations[currentLang]?.[key] || translations.uz[key] || key;
        Object.keys(vars).forEach(k => { str = str.replace(`{${k}}`, vars[k]); });
        return str;
    }

    function iconMarkup(item) {
        return `<i class="fa-solid ${item.fa}" aria-hidden="true"></i>`;
    }

    function menuMarkup() {
        return navItems.map(item => `
            <li class="menu-item ${item.cls}"><a href="${item.href}">${iconMarkup(item)} <span data-i18n="${item.key}">${item.label}</span></a></li>
        `).join('');
    }

    function buildSidebarShell() {
        return `
            <button class="sidebar-close" aria-label="Yopish"><i class="fa-solid fa-xmark"></i></button>
            <div>
                <div class="logo"><i class="fa-solid fa-bolt"></i> Streak.uz</div>
                <div class="user-welcome">
                    <div class="user-avatar-fallback">
                        <i class="fa-solid fa-user"></i>
                        <img src="" alt="Avatar" class="user-avatar" hidden>
                    </div>
                    <div>
                        <h4 id="welcome-greeting" class="user-name" data-name="Foydalanuvchi">Salom, Foydalanuvchi!</h4>
                        <p><i class="fa-solid fa-fire"></i> <span id="sidebar-streak-text" class="user-streak" data-days="0">0 kunlik streak</span></p>
                    </div>
                </div>
                <ul class="menu-list"></ul>
            </div>
            <button class="btn-add-habit"><i class="fa-solid fa-plus"></i> <span data-i18n="btn_add_habit">Yangi odat</span></button>
        `;
    }

    function ensureSidebarShell() {
        let sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            sidebar = document.createElement('aside');
            sidebar.className = 'sidebar';
            sidebar.innerHTML = buildSidebarShell();
            document.body.insertBefore(sidebar, document.body.firstChild);
            document.body.classList.add('has-app-sidebar');
        } else if (!sidebar.querySelector('.menu-list')) {
            sidebar.innerHTML = buildSidebarShell();
            document.body.classList.add('has-app-sidebar');
        }

        if (!document.querySelector('.sidebar-backdrop') && !document.querySelector('.sidebar-overlay') && !document.getElementById('sidebarOverlay')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            sidebar.after(backdrop);
        }

        if (!document.querySelector('.menu-toggle') && !document.getElementById('menuToggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'global-menu-toggle menu-toggle';
            toggle.setAttribute('aria-label', 'Menyu');
            toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            document.body.insertBefore(toggle, document.body.firstChild);
        }
    }

    function normalizeSidebarAvatar() {
        const userWelcome = document.querySelector('.sidebar .user-welcome');
        if (!userWelcome || userWelcome.querySelector('.user-avatar-fallback')) return;

        const oldImg = userWelcome.querySelector('img.user-avatar');
        const wrapper = document.createElement('div');
        wrapper.className = 'user-avatar-fallback';
        wrapper.innerHTML = '<i class="fa-solid fa-user"></i><img src="" alt="Avatar" class="user-avatar" hidden>';

        const newImg = wrapper.querySelector('img');
        if (oldImg) {
            const oldSrc = oldImg.getAttribute('src') || '';
            if (oldSrc && !oldSrc.includes('Foydalanuvchi rasmi')) {
                newImg.src = oldSrc;
                newImg.hidden = false;
                wrapper.querySelector('i').hidden = true;
            }
            oldImg.replaceWith(wrapper);
        } else {
            userWelcome.prepend(wrapper);
        }
    }

    function normalizeSidebarMenuIcons() {
        document.querySelectorAll('.sidebar .menu-item a').forEach(link => {
            const label = link.querySelector('span[data-i18n]');
            if (!label) return;

            const item = navItems.find(nav => nav.key === label.dataset.i18n);
            if (!item) return;

            link.querySelectorAll('img.menu-svg-icon, i').forEach(icon => icon.remove());
            link.insertAdjacentHTML('afterbegin', `${iconMarkup(item)} `);
        });
    }

    function applySidebarTranslations(nameVal, streakVal) {
        document.querySelectorAll('.sidebar [data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = t(key);
        });

        const welcomeGreeting = document.getElementById('welcome-greeting');
        if (welcomeGreeting && nameVal) {
            welcomeGreeting.textContent = t('greeting', { name: nameVal });
            welcomeGreeting.dataset.name = nameVal;
        }

        const sidebarStreakText = document.getElementById('sidebar-streak-text');
        if (sidebarStreakText && streakVal !== undefined) {
            sidebarStreakText.textContent = t('streak_suffix', { n: streakVal });
            sidebarStreakText.dataset.days = streakVal;
        }
    }

    function updateActiveMenuItem() {
        const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.sidebar .menu-item').forEach(li => li.classList.remove('active', 'is-active'));

        const activeItem = navItems.find(item => item.match.some(file => currentFile.includes(file)));
        if (!activeItem) return;

        const activeEl = document.querySelector(`.sidebar .menu-item.${activeItem.cls}`);
        if (activeEl) activeEl.classList.add('active', 'is-active');
    }

    function bindSidebarChrome() {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop') || document.querySelector('.sidebar-overlay') || document.getElementById('sidebarOverlay');
        const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menuToggle');
        const closeBtn = document.querySelector('.sidebar-close');

        function openSidebarGlobal() {
            sidebar?.classList.add('open', 'active');
            backdrop?.classList.add('show', 'active');
            menuToggle?.classList.add('active');
            document.body.classList.add('sidebar-open');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebarGlobal() {
            sidebar?.classList.remove('open', 'active');
            backdrop?.classList.remove('show', 'active');
            menuToggle?.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            document.body.style.overflow = '';
        }

        menuToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = sidebar?.classList.contains('open') || sidebar?.classList.contains('active');
            isOpen ? closeSidebarGlobal() : openSidebarGlobal();
        });
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSidebarGlobal();
        });
        backdrop?.addEventListener('click', closeSidebarGlobal);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeSidebarGlobal();
        });
    }

    function syncUserState() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) {
            const publicPages = ['login.html', 'royxat.html', 'index.html', 'reytingAbout.html', 'yutuqAbout.html', 'profilAbout.html', 'onboarding.html'];
            const currentFile = window.location.pathname.split('/').pop();
            if (!publicPages.includes(currentFile)) window.location.href = 'login.html';
            return;
        }

        const initialName = currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Foydalanuvchi';
        const initialStreak = currentUser.streak !== undefined ? currentUser.streak : 0;
        applySidebarTranslations(initialName, initialStreak);

        const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
        setSidebarAvatar(currentUser.avatar_url);

        function setSidebarAvatar(src) {
            if (!sidebarAvatar) return;
            const wrapper = sidebarAvatar.closest('.user-avatar-fallback');
            const icon = wrapper?.querySelector('i');

            if (!src) {
                sidebarAvatar.hidden = true;
                sidebarAvatar.removeAttribute('src');
                if (icon) icon.hidden = false;
                return;
            }

            sidebarAvatar.hidden = false;
            sidebarAvatar.src = src;
            if (icon) icon.hidden = true;
            sidebarAvatar.onerror = () => {
                sidebarAvatar.hidden = true;
                sidebarAvatar.removeAttribute('src');
                if (icon) icon.hidden = false;
            };
        }

        function initSupabaseAndSync() {
            if (typeof supabase === 'undefined') return;
            const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
            const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
            const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            sb.from('profiles').select('*').eq('id', currentUser.id).single().then(({ data: profile, error }) => {
                if (error || !profile) return;
                currentUser.full_name = profile.full_name;
                currentUser.streak = profile.streak;
                currentUser.avatar_url = profile.avatar_url;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                const freshName = profile.full_name ? profile.full_name.split(' ')[0] : 'Foydalanuvchi';
                const freshStreak = profile.streak !== undefined ? profile.streak : 0;
                applySidebarTranslations(freshName, freshStreak);
                setSidebarAvatar(profile.avatar_url);
            });
        }

        if (typeof supabase === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = initSupabaseAndSync;
            document.head.appendChild(script);
        } else {
            initSupabaseAndSync();
        }
    }

    ensureSidebarShell();
    normalizeSidebarAvatar();
    const menuList = document.querySelector('.sidebar .menu-list');
    if (menuList) menuList.innerHTML = menuMarkup();
    normalizeSidebarMenuIcons();

    applySidebarTranslations(
        document.getElementById('welcome-greeting')?.dataset.name || 'Foydalanuvchi',
        document.getElementById('sidebar-streak-text')?.dataset.days || 0
    );
    updateActiveMenuItem();
    bindSidebarChrome();
    syncUserState();

    window.addEventListener('hashchange', updateActiveMenuItem);
    window.addEventListener('storage', (e) => {
        if (e.key !== LANG_KEY) return;
        currentLang = e.newValue || 'uz';
        const nameVal = document.getElementById('welcome-greeting')?.dataset.name || 'Foydalanuvchi';
        const streakVal = document.getElementById('sidebar-streak-text')?.dataset.days || 0;
        applySidebarTranslations(nameVal, streakVal);
    });

    const addHabitBtnGlobal = document.querySelector('.btn-add-habit');
    addHabitBtnGlobal?.addEventListener('click', (e) => {
        if (window.location.pathname.includes('dashboard.html')) return;
        e.preventDefault();
        const fromPage = window.location.pathname.split('/').pop() || 'unknown';
        const params = new URLSearchParams({ addHabit: 'true', source: fromPage });
        window.location.href = `./dashboard.html?${params.toString()}`;
    });

    window.syncSidebarLanguage = function(lang) {
        currentLang = lang;
        const nameVal = document.getElementById('welcome-greeting')?.dataset.name || 'Foydalanuvchi';
        const streakVal = document.getElementById('sidebar-streak-text')?.dataset.days || 0;
        applySidebarTranslations(nameVal, streakVal);
    };
});
