/**
 * sidebar.js — Global sidebar drawer controller
 * Works on all pages that have .side-navigation
 */
(function () {
    'use strict';

    // ── Get page title from <title> tag ──
    function getPageTitle() {
        const titleMap = {
            'asosiy': 'Asosiy',
            'xarita': 'Xarita',
            'chat': 'Muloqotlar',
            'statistika': 'Statistika',
            'sozlamalar': 'Sozlamalar',
            'takliflar': 'Takliflar',
            'yordam': 'Yordam',
            'profils': 'Profil',
            'matching': 'Matching',
            'tushlik': 'Tushlik',
        };
        const path = window.location.pathname.toLowerCase();
        for (const [key, label] of Object.entries(titleMap)) {
            if (path.includes(key)) return label;
        }
        return document.title.replace('Birgalikda - ', '') || 'Birgalikda';
    }

    function init() {
        const sidebar = document.querySelector('.side-navigation');
        // xarita.html uses its own enterprise header — skip sidebar injection
        if (!sidebar || document.body.classList.contains('enterprise-app-mode')) return;

        // 1. Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-btn';
        hamburger.id = 'hamburger-btn';
        hamburger.setAttribute('aria-label', 'Menyuni ochish');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        document.body.prepend(hamburger);

        // 2. Create overlay backdrop
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // 3. Create mobile top bar
        const topbar = document.createElement('div');
        topbar.className = 'mobile-topbar';
        topbar.id = 'mobile-topbar';
        topbar.innerHTML = `
            <span class="mobile-topbar-title">${getPageTitle()}</span>
        `;
        document.body.appendChild(topbar);

        // 4. Create mobile sidebar header
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'sidebar-mobile-header';
        mobileHeader.innerHTML = `
            <div class="sidebar-mobile-logo-text">🍽️ Birgalikda</div>
            <button type="button" class="sidebar-close-btn" aria-label="Yopish">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        sidebar.prepend(mobileHeader);

        const sidebarCloseBtn = mobileHeader.querySelector('.sidebar-close-btn');

        // 5. Open/close functions
        function openSidebar() {
            sidebar.classList.add('is-open');
            hamburger.classList.add('is-open');
            document.body.classList.add('sidebar-open');
            overlay.classList.add('is-visible');
            hamburger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            sidebar.classList.remove('is-open');
            hamburger.classList.remove('is-open');
            document.body.classList.remove('sidebar-open');
            overlay.classList.remove('is-visible');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        function toggleSidebar() {
            if (sidebar.classList.contains('is-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }

        // 5. Event listeners
        hamburger.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', closeSidebar);
        sidebarCloseBtn.addEventListener('click', closeSidebar);

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
                closeSidebar();
            }
        });

        // Close when a nav link is clicked (on mobile)
        sidebar.querySelectorAll('nav a, .container-0 a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 1024) {
                    closeSidebar();
                }
            });
        });

        // Handle "E'lon qo'shish" sidebar button navigation globally
        const btnAnnounceLunch = document.getElementById('btn-announce-lunch');
        if (btnAnnounceLunch) {
            btnAnnounceLunch.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'tushlik.html';
            });
        }

        // Handle resize — reset sidebar state on desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                document.body.classList.remove('sidebar-open');
                overlay.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        });

        // 6. Enable transition after initial layout to prevent FOUC load transition flash
        setTimeout(() => {
            sidebar.classList.add('has-transition');
        }, 150);
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
