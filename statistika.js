document.addEventListener("DOMContentLoaded", () => {
    let lineChartInstance = null;
    let doughnutChartInstance = null;

    const dashboardData = {
        hafta: {
            date: "15-21 Dekabr, 2026",
            streakCount: "18 kun 🔥",
            recordBadge: "Bu hafta yangilandi",
            intro: "Bu hafta 4 ta yangi tanishuv va 2 ta yuqori reytingli suhbat bo'ldi.",
            progress: 72,
            miniStats: ["24", "12", "98%", "5.0", "6s", "2"],
            activityPattern: [0, 1, 0, 2, 1, 0, 2, 3, 1, 0, 1, 2, 1, 0, 2, 3, 4, 1, 0, 2, 1, 0, 2, 3, 1, 0, 1, 2, 3, 4, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 1, 0, 2, 1, 0, 2, 3, 1, 0, 2, 1, 0, 1, 2, 3, 1, 0, 2, 3, 4, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 1, 0, 2, 1, 0, 2, 3, 4, 1, 0],
            lineChart: [2, 3, 2, 4, 3, 1, 5],
            doughnut: [55, 25, 20],
            centerText: { total: 10, label: "Hamkorlar" },
            legend: [
                { label: "IT Park", value: "55%", color: "#0070f3" },
                { label: "EPAM", value: "25%", color: "#ff5a5f" },
                { label: "Boshqa", value: "20%", color: "#cbd5e1" }
            ],
            peakHours: [
                { label: "12:00 - 13:00", percent: "82%", count: "41 marta" },
                { label: "13:00 - 14:00", percent: "63%", count: "31 marta" },
                { label: "11:00 - 12:00", percent: "28%", count: "14 marta" }
            ],
            timeline: [
                { title: "Yangilangan mentorlik", desc: "2 ta yangi sherik bilan birinchi suhbat", date: "Bugun", icon: "fa-solid fa-handshake", color: "#e0f2fe", iconColor: "#0369a1" },
                { title: "Uzoq muddatli streak", desc: "Bu hafta davomida 5 kun ketma-ket faol bo'ldingiz", date: "Kecha", icon: "fa-solid fa-fire-flame-curved", color: "#ffedd5", iconColor: "#c2410c" }
            ]
        },
        oy: {
            date: "1-21 Dekabr, 2026",
            streakCount: "23 kun 🔥",
            recordBadge: "Eng yaxshi rekord",
            intro: "Oylik faoliyat shuni ko'rsatadiki, sizning takliflaringiz ancha ko'paygan.",
            progress: 65,
            miniStats: ["142", "86", "94%", "4.9", "28s", "12"],
            activityPattern: [1, 0, 2, 1, 0, 2, 3, 1, 0, 2, 1, 0, 2, 3, 4, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 0, 2, 3, 4, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 3, 1, 0, 2, 3, 4, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 0, 1, 2, 3, 1, 0, 2, 3, 4],
            lineChart: [3, 2, 2, 5, 4, 1, 4],
            doughnut: [45, 20, 35],
            centerText: { total: 12, label: "Kompaniyalar" },
            legend: [
                { label: "IT Park", value: "45%", color: "#0070f3" },
                { label: "EPAM", value: "20%", color: "#ff5a5f" },
                { label: "Boshqa", value: "35%", color: "#cbd5e1" }
            ],
            peakHours: [
                { label: "12:00 - 13:00", percent: "90%", count: "48 marta" },
                { label: "13:00 - 14:00", percent: "65%", count: "32 marta" },
                { label: "11:00 - 12:00", percent: "30%", count: "14 marta" }
            ],
            timeline: [
                { title: "Hafta qahramoni", desc: "7 kun davomida uzluksiz faol bo'ldingiz", date: "Aprel, 14:20", icon: "fa-solid fa-medal", color: "#e0f2fe", iconColor: "#0369a1" },
                { title: "Ijtimoiy magnat", desc: "50 ta turli soha vakillari bilan tanishdingiz", date: "12-fevral", icon: "fa-solid fa-handshake", color: "#dcfce7", iconColor: "#15803d" },
                { title: "Birinchi rekord", desc: "Uchrashuvlar soni bo'yicha TOP 10% ga kirdingiz", date: "3-Yanvar", icon: "fa-solid fa-fire-flame-curved", color: "#ffedd5", iconColor: "#c2410c" }
            ]
        },
        hammasi: {
            date: "Yillik Jami, 2026",
            streakCount: "41 kun 🔥",
            recordBadge: "Yil davomida uzluksiz",
            intro: "Yillar davomida umumiy faoliyat ko'rsatkichlari sezilarli darajada oshgan.",
            progress: 88,
            miniStats: ["840", "412", "91%", "4.8", "164s", "45"],
            activityPattern: [2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2, 3, 4, 2, 1, 0, 2],
            lineChart: [25, 18, 22, 35, 30, 12, 28],
            doughnut: [50, 25, 25],
            centerText: { total: 24, label: "Tashkilotlar" },
            legend: [
                { label: "IT Park", value: "50%", color: "#0070f3" },
                { label: "EPAM", value: "25%", color: "#ff5a5f" },
                { label: "Boshqa", value: "25%", color: "#cbd5e1" }
            ],
            peakHours: [
                { label: "12:00 - 13:00", percent: "95%", count: "280 marta" },
                { label: "13:00 - 14:00", percent: "80%", count: "210 marta" },
                { label: "11:00 - 12:00", percent: "45%", count: "95 marta" }
            ],
            timeline: [
                { title: "Yil davomida eng yaxshi reyting", desc: "Har oy davomida yuqori faollikni saqladingiz", date: "Noyabr", icon: "fa-solid fa-trophy", color: "#e0f2fe", iconColor: "#0369a1" },
                { title: "Yangi loyihalar guruhi", desc: "Beshta yangi guruh bilan ishlash boshladingiz", date: "Avgust", icon: "fa-solid fa-users", color: "#dcfce7", iconColor: "#15803d" }
            ]
        }
    };

    const activityGrid = document.getElementById("activityGrid");
    const miniCards = document.querySelectorAll(".mini-card");
    const dateIndicator = document.querySelector(".date-indicator");
    const fillBars = document.querySelectorAll(".fill-bar");
    const countLabels = document.querySelectorAll(".count-label");
    const streakCountEl = document.querySelector(".streak-count");
    const recordBadgeEl = document.querySelector(".record-badge");
    const bannerIntroEl = document.querySelector(".banner-left p");
    const progressBar = document.querySelector(".progress-bar-fill");
    const subTextEl = document.querySelector(".sub-text");
    const doughnutCenter = document.querySelector(".doughnut-center-text");
    const doughnutLegend = document.querySelector(".doughnut-legend-list");
    const timelineEl = document.querySelector(".timeline");

    function renderActivityGrid(pattern) {
        if (!activityGrid) return;
        activityGrid.innerHTML = "";
        const totalCells = 12 * 7;

        for (let i = 0; i < totalCells; i += 1) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";
            cell.style.opacity = "0";
            cell.style.transform = "scale(0.9)";
            cell.style.transition = "all 0.25s ease";

            const level = pattern[i] ?? 0;
            cell.classList.add(`lvl-${level}`);
            if (i === totalCells - 3) cell.classList.add("lvl-special");

            activityGrid.appendChild(cell);
            setTimeout(() => {
                cell.style.opacity = "1";
                cell.style.transform = "scale(1)";
            }, i * 3);
        }
    }

    function renderCharts(data) {
        if (!window.Chart) return;

        const lineCanvas = document.getElementById("lineChart");
        const doughnutCanvas = document.getElementById("doughnutChart");

        if (lineChartInstance) lineChartInstance.destroy();
        if (doughnutChartInstance) doughnutChartInstance.destroy();

        if (lineCanvas) {
            const ctx = lineCanvas.getContext("2d");
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, "rgba(0, 112, 243, 0.28)");
            gradient.addColorStop(1, "rgba(0, 112, 243, 0)");

            lineChartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels: ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Yak"],
                    datasets: [{
                        data: data.lineChart,
                        borderColor: "#0070f3",
                        borderWidth: 2.5,
                        fill: true,
                        backgroundColor: gradient,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 11 } } },
                        y: { display: false }
                    }
                }
            });
        }

        if (doughnutCanvas) {
            doughnutChartInstance = new Chart(doughnutCanvas.getContext("2d"), {
                type: "doughnut",
                data: {
                    datasets: [{
                        data: data.doughnut,
                        backgroundColor: ["#0070f3", "#ff5a5f", "#cbd5e1"],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "78%",
                    plugins: { legend: { display: false } }
                }
            });
        }
    }

    function renderMiniCards(values) {
        miniCards.forEach((card, index) => {
            card.classList.remove("reveal-animate");
            const valueEl = card.querySelector("p");
            if (valueEl) valueEl.textContent = values[index] ?? "—";
            setTimeout(() => card.classList.add("reveal-animate"), index * 85);
        });
    }

    function renderPeakHours(items) {
        const rows = document.querySelectorAll(".time-row");
        rows.forEach((row, index) => {
            const label = row.querySelector(".time-label");
            const bar = row.querySelector(".fill-bar");
            const count = row.querySelector(".count-label");
            const item = items[index];
            if (!item) return;
            if (label) label.textContent = item.label;
            if (bar) bar.style.width = item.percent;
            if (count) count.textContent = item.count;
        });
    }

    function renderLegend(items) {
        if (!doughnutLegend) return;
        doughnutLegend.innerHTML = items.map(item => `
            <div class="legend-item">
                <span class="dot" style="background: ${item.color};"></span>
                ${item.label}
                <span class="val">${item.value}</span>
            </div>
        `).join("");
    }

    function renderTimeline(items) {
        if (!timelineEl) return;
        timelineEl.innerHTML = items.map(item => `
            <div class="timeline-item">
                <div class="timeline-icon" style="background: ${item.color}; color: ${item.iconColor};">
                    <i class="${item.icon}"></i>
                </div>
                <div class="timeline-details">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                    <span>${item.date}</span>
                </div>
            </div>
        `).join("");
    }

    function updateDashboard(rangeKey) {
        const data = dashboardData[rangeKey];
        if (!data) return;

        if (dateIndicator) dateIndicator.innerHTML = `<i class="fa-regular fa-calendar"></i> ${data.date}`;
        if (streakCountEl) streakCountEl.textContent = data.streakCount;
        if (recordBadgeEl) recordBadgeEl.textContent = data.recordBadge;
        if (bannerIntroEl) bannerIntroEl.textContent = data.intro;
        if (subTextEl) subTextEl.textContent = data.intro;
        if (progressBar) progressBar.style.width = `${data.progress}%`;

        if (doughnutCenter) {
            doughnutCenter.innerHTML = `
                <h3>${data.centerText.total}</h3>
                <p>${data.centerText.label}</p>
            `;
        }

        renderMiniCards(data.miniStats);
        renderActivityGrid(data.activityPattern);
        renderCharts(data);
        renderPeakHours(data.peakHours);
        renderLegend(data.legend);
        renderTimeline(data.timeline);
    }

    updateDashboard("oy");

    document.querySelectorAll(".tab-btn").forEach((button) => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            const key = button.textContent.trim().toLowerCase();
            if (key === "hafta") updateDashboard("hafta");
            else if (key === "oy") updateDashboard("oy");
            else if (key === "hammasi") updateDashboard("hammasi");
        });
    });
});