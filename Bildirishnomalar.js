document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // Global elements
    const notificationsList = document.getElementById("notifications-list");
    const btnClearAll = document.getElementById("btn-clear-all");
    const btnBack = document.getElementById("btn-back");
    const emptyState = document.getElementById("empty-state");
    const tabButtons = document.querySelectorAll(".filter-tabs .tab-btn");

    if (btnBack) {
        btnBack.addEventListener("click", () => {
            if (document.referrer && (document.referrer.includes(".html") || document.referrer.includes("127.0.0.1") || document.referrer.includes("localhost"))) {
                window.location.href = document.referrer;
            } else {
                window.location.href = "Asosiy.html";
            }
        });
    }

    // 1. MOCK DATA INITIALIZATION
    const defaultNotifications = [
        {
            id: "n1",
            type: "matches",
            status: "unread",
            timeSection: "bugun", // bugun, kecha, shu-hafta
            title: "Yangi match",
            timeStamp: "Hozir",
            content: "Jasur bilan tushlik uchrashuvi tasdiqlandi. <strong>Manzil: Central Park Cafe.</strong>",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80"
        },
        {
            id: "n2",
            type: "streak",
            status: "unread",
            timeSection: "bugun",
            title: "Streak xavfi",
            timeStamp: "15d avval",
            content: "Diqqat! Bugun tushlik streakingiz uzilib ketishi mumkin. Tezroq faollik ko'rsating! 🔥",
            iconClass: "fa-solid fa-bolt-lightning",
            iconBgClass: "icon-streak-danger"
        },
        {
            id: "n3",
            type: "streak",
            status: "unread",
            timeSection: "bugun",
            title: "Streak milestone",
            timeStamp: "1s avval",
            content: "Tabriklaymiz! Siz 10 kunlik \"Doimiy muloqot\" nishonini qo'lga kiritdingiz! 🎉",
            iconClass: "fa-solid fa-trophy",
            iconBgClass: "icon-streak-success"
        },
        {
            id: "n4",
            type: "system",
            status: "read",
            timeSection: "kecha",
            title: "Baholash eslatmasi",
            timeStamp: "Kecha",
            content: "Shaxlo bilan bo'lgan tushlik qanday o'tdi? Tajribangizni baholang.",
            iconClass: "fa-regular fa-star",
            iconBgClass: "icon-system-star"
        },
        {
            id: "n5",
            type: "system",
            status: "read",
            timeSection: "kecha",
            title: "Aktivlik",
            timeStamp: "Kecha",
            content: "Sizning sohangizga mos keluvchi yangi 3 ta foydalanuvchi bilan match bo'lishingiz mumkin.",
            iconClass: "fa-solid fa-chart-line",
            iconBgClass: "icon-system-activity"
        },
        {
            id: "n6",
            type: "system",
            status: "read",
            timeSection: "shu-hafta",
            title: "Yangi kuzatuvchi",
            timeStamp: "3 kun avval",
            content: "Akmal sizni kuzatishni boshladi.",
            iconClass: "fa-solid fa-user-plus",
            iconBgClass: "icon-user-follow"
        },
        {
            id: "n7",
            type: "system",
            status: "read",
            timeSection: "shu-hafta",
            title: "Tizim yangilanishi",
            timeStamp: "5 kun avval",
            content: "Ilova yangi talqiniga (v2.4.0) yangilandi. Yangiliklarni ko'ring.",
            iconClass: "fa-solid fa-gear",
            iconBgClass: "icon-system-update"
        }
    ];

    const STORAGE_VERSION = 'v1.1';
    if (localStorage.getItem('notifications_version') !== STORAGE_VERSION || !localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
        localStorage.setItem('notifications_version', STORAGE_VERSION);
    }

    const activeTabKey = "active_notification_filter";
    const savedFilter = localStorage.getItem(activeTabKey) || "all";

    // 2. RENDERING CORE PIPELINE
    function renderNotifications() {
        if (!notificationsList) return;

        const localNotifs = localStorage.getItem('notifications');
        let notifications = [];
        try {
            notifications = JSON.parse(localNotifs) || [];
        } catch (e) {
            notifications = [];
        }

        notificationsList.innerHTML = ""; // clear list

        const activeFilter = localStorage.getItem(activeTabKey) || "all";

        // Filter the array
        const filteredNotifs = notifications.filter(card => {
            if (activeFilter === "all") return true;
            if (activeFilter === "unread") return card.status === "unread";
            return card.type === activeFilter;
        });

        if (filteredNotifs.length === 0) {
            if (emptyState) emptyState.classList.remove("hidden");
            return;
        } else {
            if (emptyState) emptyState.classList.add("hidden");
        }

        // Group by time sections: bugun, kecha, shu-hafta
        const sections = [
            { id: "bugun", title: "BUGUN" },
            { id: "kecha", title: "KECHA" },
            { id: "shu-hafta", title: "SHU HAFTA" }
        ];

        sections.forEach(sec => {
            const secNotifs = filteredNotifs.filter(n => n.timeSection === sec.id);
            if (secNotifs.length === 0) return; // skip empty sections

            const secDiv = document.createElement("div");
            secDiv.className = "time-section";
            secDiv.setAttribute("data-section", sec.id);

            const titleH3 = document.createElement("h3");
            titleH3.className = "section-title";
            titleH3.textContent = sec.title;
            secDiv.appendChild(titleH3);

            secNotifs.forEach(item => {
                const card = document.createElement("div");
                const statusClass = item.status === "unread" ? `unread-${item.type}` : "read";
                card.className = `notif-card ${statusClass}`;
                card.setAttribute("data-id", item.id);
                card.setAttribute("data-type", item.type);
                card.setAttribute("data-status", item.status);

                // Body content based on match avatar vs icon
                let leftSideHtml = '';
                if (item.avatar) {
                    const statusDot = item.status === "unread" ? '<span class="status-indicator"></span>' : '';
                    leftSideHtml = `
                        <div class="avatar-wrapper">
                            <img src="${item.avatar}" alt="Avatar" class="user-avatar">
                            ${statusDot}
                        </div>
                    `;
                } else {
                    leftSideHtml = `
                        <div class="icon-box ${item.iconBgClass}">
                            <i class="${item.iconClass}"></i>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <div class="card-body">
                        ${leftSideHtml}
                        <div class="notif-content">
                            <div class="notif-top">
                                <h4>${item.title}</h4>
                                <span class="time-stamp">${item.timeStamp}</span>
                            </div>
                            <p>${item.content}</p>
                        </div>
                    </div>
                `;

                // Add click listener to mark as read
                card.addEventListener("click", () => {
                    if (item.status === "unread") {
                        markAsRead(item.id);
                    }
                });

                secDiv.appendChild(card);
            });

            notificationsList.appendChild(secDiv);
        });
    }

    // 3. MARK AS READ IMPLEMENTATION
    function markAsRead(id) {
        const localNotifs = localStorage.getItem('notifications');
        if (!localNotifs) return;
        try {
            let notifications = JSON.parse(localNotifs) || [];
            notifications = notifications.map(n => {
                if (n.id === id) {
                    n.status = "read";
                }
                return n;
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            // Re-render
            renderNotifications();
        } catch(e) {
            console.error(e);
        }
    }

    // 4. TAB BUTTON EVENT LISTENERS
    tabButtons.forEach(btn => {
        if (btn.getAttribute("data-filter") === savedFilter) {
            tabButtons.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
        }

        btn.addEventListener("click", function() {
            tabButtons.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            const filter = this.getAttribute("data-filter");
            localStorage.setItem(activeTabKey, filter);
            renderNotifications();
        });
    });

    // 5. CLEAR ALL DOMINO TRANSITION
    if (btnClearAll) {
        btnClearAll.addEventListener("click", () => {
            const cards = document.querySelectorAll(".notifications-list .notif-card");
            if (cards.length === 0) return;

            // Animate card removals
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add("removing");
                }, index * 60);
            });

            // After animation ends, clear localStorage and update DOM
            setTimeout(() => {
                localStorage.setItem('notifications', JSON.stringify([]));
                renderNotifications();
            }, cards.length * 60 + 300);
        });
    }

    // Initial render call
    renderNotifications();
});
