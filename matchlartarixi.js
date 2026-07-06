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

    // ===== MOCK DATA INITIALIZATION =====
    const defaultHistory = [
        {
            name: "Jasur Tursunov",
            role: "INHA Universiteti",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            rating: 5,
            chips: ["Python", "Startuplar", "AI/ML"],
            date: "12 May, 2024",
            location: "GroundZero Chilonzor",
            linkedinConnected: true,
            status: "matched",
            time: "new",
            comment: "Python va AI startuplari haqida ajoyib fikr almashdik."
        },
        {
            name: "Madina Aliyeva",
            role: "UI/UX Designer",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            rating: 5,
            chips: ["Figma", "User Research"],
            date: "8 May, 2024",
            location: "EVOS Sayram",
            linkedinConnected: false,
            status: "archived",
            time: "new",
            comment: "Ajoyib suhbat bo'ldi!"
        },
        {
            name: "Alisher Qodirov",
            role: "Frontend Team Lead",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            rating: 4,
            chips: ["React", "TypeScript", "Redux"],
            date: "28 Apr, 2024",
            location: "FeedUp Chilonzor",
            linkedinConnected: true,
            status: "matched",
            time: "old",
            comment: "React va Next.js arxitekturasi bo'yicha suhbatlashdik."
        },
        {
            name: "Dilnoza Hakimova",
            role: "Product PM at PM.uz",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            rating: 5,
            chips: ["Product Strategy", "Agile"],
            date: "15 Apr, 2024",
            location: "Rayhon Milliy Taomlari",
            linkedinConnected: true,
            status: "matched",
            time: "old",
            comment: "PM lavozimiga kirishish bo'yicha foydali maslahatlar."
        },
        {
            name: "Sardor Raimov",
            role: "DevOps Engineer",
            avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            rating: 3,
            chips: ["Docker", "Kubernetes", "AWS"],
            date: "10 Apr, 2024",
            location: "Yapona Mama",
            linkedinConnected: false,
            status: "archived",
            time: "old",
            comment: "CI/CD jarayonlarini avtomatlashtirish masalalari muhokama qilindi."
        }
    ];

    if (!localStorage.getItem('match_history')) {
        localStorage.setItem('match_history', JSON.stringify(defaultHistory));
    }

    // ===== RENDER MATCHES & METRICS DYNAMICALLY =====
    const matchContainer = document.getElementById('match-container');
    
    function loadAndRenderAll() {
        if (!matchContainer) return;
        
        const localHistory = localStorage.getItem('match_history');
        let historyList = [];
        try {
            historyList = JSON.parse(localHistory) || [];
        } catch (e) {
            historyList = [];
        }

        // 1. Calculate Metrics
        const totalMatches = historyList.length;
        
        let totalRating = 0;
        let ratingCount = 0;
        let positiveCount = 0;
        let linkedinCount = 0;

        historyList.forEach(item => {
            if (item.rating) {
                totalRating += item.rating;
                ratingCount++;
                if (item.rating >= 4) {
                    positiveCount++;
                }
            }
            if (item.linkedinConnected !== false) {
                linkedinCount++;
            }
        });

        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";
        const positiveImpression = totalMatches > 0 ? Math.round((positiveCount / totalMatches) * 100) : 0;

        // Update DOM metrics
        const metricNums = document.querySelectorAll('.metric-card .metric-num');
        if (metricNums.length >= 4) {
            metricNums[0].textContent = totalMatches;
            metricNums[1].textContent = avgRating;
            metricNums[2].textContent = positiveImpression + "%";
            metricNums[3].textContent = linkedinCount;
        }

        // 2. Render List Rows
        matchContainer.innerHTML = ''; // clear first

        if (totalMatches === 0) {
            matchContainer.innerHTML = `<div style="text-align:center;padding:40px;color:#888;">Hozircha matchlar tarixi mavjud emas.</div>`;
            return;
        }

        historyList.forEach(item => {
            const row = document.createElement('div');
            row.className = 'match-row';
            row.setAttribute('data-time', item.time || 'new');
            row.setAttribute('data-stars', (item.rating || 5).toString());
            row.setAttribute('data-name', item.name);

            // Rating Stars HTML
            let starHtml = '';
            const ratingVal = item.rating || 5;
            for (let i = 1; i <= 5; i++) {
                if (i <= ratingVal) {
                    starHtml += '<i class="fa-solid fa-star"></i>';
                } else {
                    starHtml += '<i class="fa-regular fa-star"></i>';
                }
            }

            // Chips / Skills HTML
            let chipsHtml = '';
            if (item.chips && item.chips.length > 0) {
                item.chips.forEach(chip => {
                    chipsHtml += `<span class="skill">${chip}</span>`;
                });
            } else {
                chipsHtml += `<span class="skill">${item.role || 'Mutaxassis'}</span>`;
            }

            // Badge, Status, Location icons
            const hasLinkedin = item.linkedinConnected !== false;
            const linkedinBadge = hasLinkedin ? `<span class="linkedin-badge"><i class="fa-brands fa-linkedin-in"></i></span>` : '';
            
            const statusLabel = item.status === 'archived' ? 'Arxivlangan' : 'Matched';
            const statusClass = item.status === 'archived' ? 'archived' : 'matched';

            // Right side column or quote
            let rightSideContent = '';
            if (item.comment && item.status === 'archived') {
                rightSideContent = `
                    <div class="stars-display">
                        ${starHtml}
                    </div>
                    <p class="feedback-quote">"${item.comment}"</p>
                `;
            } else {
                rightSideContent = `
                    <div class="stars-display">
                        ${starHtml}
                    </div>
                    <button class="btn-view-profile" type="button">Profilni ko'rish</button>
                `;
            }

            row.innerHTML = `
                <div class="row-left">
                    <div class="avatar-container">
                        <img src="${item.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}" alt="${item.name}" class="user-avatar">
                        ${linkedinBadge}
                    </div>
                    <div class="match-details">
                        <div class="name-status">
                            <h3>${item.name}</h3>
                            <span class="status-tag ${statusClass}">${statusLabel}</span>
                        </div>
                        <div class="meta-info">
                            <span><i class="fa-solid fa-briefcase"></i> ${item.role || 'Mutaxassis'}</span>
                            <span><i class="fa-regular fa-calendar"></i> ${item.date || 'Bugun'}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${item.location || 'Rayhon Milliy Taomlari'}</span>
                        </div>
                        <div class="skills-tags">
                            ${chipsHtml}
                        </div>
                    </div>
                </div>
                <div class="row-right ${item.status === 'archived' ? 'flex-end-layout' : ''}">
                    ${rightSideContent}
                </div>
            `;
            
            matchContainer.appendChild(row);
        });

        setupViewProfileBtns();
    }

    // ===== INPUT REAL-TIME SEARCH =====
    const searchInput = document.getElementById('nav-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const currentMatchRows = document.querySelectorAll('.match-row');

            currentMatchRows.forEach(row => {
                const matchName = row.getAttribute('data-name').toLowerCase();
                if (matchName.includes(query)) {
                    row.style.display = 'flex';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // ===== TAB FILTERS (All, This month, 5 Stars) =====
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterType = button.getAttribute('data-filter');
            const currentMatchRows = document.querySelectorAll('.match-row');

            currentMatchRows.forEach(row => {
                const time = row.getAttribute('data-time');
                const stars = row.getAttribute('data-stars');

                if (filterType === 'hammasi') {
                    row.style.display = 'flex';
                } else if (filterType === 'shu-oy') {
                    row.style.display = (time === 'new') ? 'flex' : 'none';
                } else if (filterType === '5-yulduzli') {
                    row.style.display = (stars === '5') ? 'flex' : 'none';
                }
            });
        });
    });

    // ===== SORT SELECT (Newest / Oldest / Highest Rated) =====
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && matchContainer) {
        sortSelect.addEventListener('change', () => {
            const sortValue = sortSelect.value;
            const rowsArray = Array.from(document.querySelectorAll('.match-row'));

            rowsArray.sort((a, b) => {
                const timeA = a.getAttribute('data-time');
                const timeB = b.getAttribute('data-time');
                const ratingA = parseFloat(a.getAttribute('data-stars'));
                const ratingB = parseFloat(b.getAttribute('data-stars'));

                if (sortValue === 'eng-yangi') {
                    return timeA === 'new' ? -1 : 1;
                } else if (sortValue === 'eng-eski') {
                    return timeA === 'old' ? -1 : 1;
                } else if (sortValue === 'reyting-yuqori') {
                    return ratingB - ratingA;
                }
                return 0;
            });

            rowsArray.forEach(row => matchContainer.appendChild(row));
        });
    }

    // ===== HISOBOTNI YUKLASH TUGMASI =====
    const downloadBtn = document.getElementById('download-report-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yuklanmoqda...`;
            downloadBtn.style.opacity = '0.7';

            setTimeout(() => {
                downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Hisobotni yuklash`;
                downloadBtn.style.opacity = '1';

                const localHistory = localStorage.getItem('match_history');
                let historyList = [];
                try {
                    historyList = JSON.parse(localHistory) || [];
                } catch (e) {
                    historyList = [];
                }

                const metricNums = document.querySelectorAll('.metric-card .metric-num');
                const totalMatches = metricNums[0] ? metricNums[0].textContent : '0';
                const avgRating = metricNums[1] ? metricNums[1].textContent : '0.0';
                const positiveImpression = metricNums[2] ? metricNums[2].textContent : '0%';
                const linkedinCount = metricNums[3] ? metricNums[3].textContent : '0';

                let reportContent = "Birgalikda - Matchlar tarixi hisoboti\n\n";
                reportContent += `Jami matchlar: ${totalMatches}\n`;
                reportContent += `O'rtacha reyting: ${avgRating}\n`;
                reportContent += `Ijobiy taassurot: ${positiveImpression}\n`;
                reportContent += `LinkedIn Connects: ${linkedinCount}\n\n`;
                reportContent += "Foydalanuvchi, Lavozim, Sana, Reyting, Izoh\n";

                historyList.forEach(item => {
                    reportContent += `${item.name}, ${item.role || 'Mutaxassis'}, ${item.date || 'Bugun'}, ${item.rating}/5, "${item.comment || ''}"\n`;
                });

                const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Birgalikda_hisobot.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showToast("Matchlar hisoboti yuklab olindi!", "success");
            }, 1200);
        });
    }

    // ===== PROFILNI KO'RISH TUGMASINI BOG'LASH =====
    function setupViewProfileBtns() {
        const viewProfileButtons = document.querySelectorAll('.btn-view-profile');
        viewProfileButtons.forEach(btn => {
            if (btn.dataset.bound === 'true') return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', () => {
                window.location.href = 'profileS.html';
            });
        });
    }

    // Re-bind view profile buttons if new items are inserted
    const observer = new MutationObserver(setupViewProfileBtns);
    if (matchContainer) {
        observer.observe(matchContainer, { childList: true });
    }

    // Dastlabki render
    loadAndRenderAll();
});
