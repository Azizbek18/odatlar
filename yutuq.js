document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const achievementCards = document.querySelectorAll(".achieve-card");

    // ─── Filter Tabs Interaction ──────────────────────────────
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");

            achievementCards.forEach(card => {
                const cardStatus = card.getAttribute("data-status");

                if (filterValue === "all") {
                    showCard(card);
                } else if (filterValue === "unlocked" && cardStatus === "unlocked") {
                    showCard(card);
                } else if (filterValue === "locked" && cardStatus === "locked") {
                    showCard(card);
                } else if (filterValue === "near" && cardStatus === "near") {
                    showCard(card);
                } else {
                    hideCard(card);
                }
            });
        });
    });

    function showCard(card) {
        card.style.display = "flex";
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
        }, 10);
    }

    function hideCard(card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
            card.style.display = "none";
        }, 200);
    }

    // ─── Supabase Integration for Achievements ───────────────
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
    let sb;

    if (typeof supabase !== 'undefined') {
        sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        loadAchievementsData();
    } else {
        // Wait for Supabase script to load
        const interval = setInterval(() => {
            if (typeof supabase !== 'undefined') {
                clearInterval(interval);
                sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                loadAchievementsData();
            }
        }, 100);
    }

    async function loadAchievementsData() {
        try {
            // 1. Fetch user profile stats
            const { data: profile, error } = await sb
                .from('profiles')
                .select('xp, streak, gems')
                .eq('id', currentUser.id)
                .single();

            if (error) throw error;

            const xp = profile.xp || 0;
            const streak = profile.streak || 0;
            const gems = profile.gems || 0;

            // 2. Fetch completed habits count
            const { data: habits, error: habitsError } = await sb
                .from('habits')
                .select('description')
                .eq('user_id', currentUser.id);

            let completedCount = 0;
            if (!habitsError && habits) {
                habits.forEach(h => {
                    try {
                        const meta = JSON.parse(h.description);
                        if (meta.is_done) completedCount++;
                    } catch (e) {}
                });
            }

            // 3. Update Level Info in banner & circle
            const level = Math.floor(xp / 1000) + 1;
            const currentLevelXP = xp % 1000;
            const pct = Math.floor(currentLevelXP / 10); // 0 to 100
            const nextLevelTarget = level * 1000;
            const xpNeeded = 1000 - currentLevelXP;

            // Update UI elements
            const xpCountEl = document.querySelector('.banner-info .xp-count');
            if (xpCountEl) xpCountEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${xp.toLocaleString()} XP`;

            const lvlNumEl = document.querySelector('.level-circle .lvl-num');
            if (lvlNumEl) lvlNumEl.textContent = level;

            const progressCircle = document.querySelector('.level-circle .progress-circle');
            if (progressCircle) {
                progressCircle.style.strokeDashoffset = 251 - (251 * pct / 100);
            }

            const targetXpEl = document.querySelector('.progress-info .target-xp');
            if (targetXpEl) targetXpEl.textContent = `${nextLevelTarget} XP`;

            const nextLevelTextEl = document.querySelector('.progress-info span:first-child');
            if (nextLevelTextEl) nextLevelTextEl.textContent = `Keyingi levelga: ${xpNeeded} XP`;

            const progressBarEl = document.querySelector('.progress-card .bar');
            if (progressBarEl) progressBarEl.style.width = `${pct}%`;

            // 4. Update achievements status & unlock elements
            const achievementsList = [
                {
                    name: 'Early Bird',
                    check: () => completedCount > 0 || xp > 0,
                    progress: () => completedCount > 0 || xp > 0 ? 100 : 0
                },
                {
                    name: 'Water Master',
                    check: () => completedCount >= 3 || xp >= 300,
                    progress: () => Math.min(100, Math.floor((xp / 300) * 100))
                },
                {
                    name: 'Deep Work',
                    check: () => xp >= 1000,
                    progress: () => Math.min(100, Math.floor((xp / 1000) * 100))
                },
                {
                    name: 'Fire Streak',
                    check: () => streak >= 7,
                    progress: () => Math.min(100, Math.floor((streak / 7) * 100))
                },
                {
                    name: 'Book Worm',
                    check: () => completedCount >= 5 || xp >= 500,
                    progress: () => Math.min(100, Math.floor((xp / 500) * 100))
                },
                {
                    name: 'Iron Body',
                    check: () => streak >= 15 || xp >= 1500,
                    progress: () => Math.min(100, Math.floor((streak / 15) * 100))
                }
            ];

            const cards = document.querySelectorAll('.achieve-card');
            cards.forEach(card => {
                const titleEl = card.querySelector('h4');
                if (!titleEl) return;
                const name = titleEl.textContent.trim();
                const ach = achievementsList.find(a => a.name === name);
                if (ach) {
                    const isUnlocked = ach.check();
                    const pVal = ach.progress();

                    let status = 'locked';
                    if (isUnlocked) {
                        status = 'unlocked';
                    } else if (pVal >= 50) {
                        status = 'near';
                    }
                    card.setAttribute('data-status', status);

                    // Update layout classes
                    card.classList.remove('locked-card', 'featured');
                    if (status === 'locked') {
                        card.classList.add('locked-card');
                    } else if (status === 'near') {
                        card.classList.add('featured');
                    }

                    // Update UI elements inside card
                    let badge = card.querySelector('.status-badge');
                    let progressContainer = card.querySelector('.card-progress');
                    let progressLbl = card.querySelector('.progress-lbl');

                    if (isUnlocked) {
                        if (progressContainer) progressContainer.remove();
                        if (progressLbl) progressLbl.remove();
                        if (!badge) {
                            badge = document.createElement('span');
                            badge.className = 'status-badge';
                            card.appendChild(badge);
                        }
                        badge.className = 'status-badge opened';
                        badge.textContent = 'OCHILGAN';
                    } else {
                        if (badge) badge.remove();

                        if (!progressContainer) {
                            progressContainer = document.createElement('div');
                            progressContainer.className = 'card-progress';
                            progressContainer.innerHTML = '<div class="c-bar"></div>';
                            card.appendChild(progressContainer);
                        }
                        const cBar = progressContainer.querySelector('.c-bar');
                        if (cBar) cBar.style.width = `${pVal}%`;

                        if (!progressLbl) {
                            progressLbl = document.createElement('span');
                            progressLbl.className = 'progress-lbl';
                            card.appendChild(progressLbl);
                        }
                        progressLbl.textContent = `${pVal}% TAYYOR`;
                    }
                }
            });

        } catch (e) {
            console.error('Achievements loading failed:', e);
        }
    }
});