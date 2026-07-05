// --- MA'LUMOTLAR OMBORI (MOCK DATA) ---
const dashboardData = {
    hafta: {
        stats: { days: "24", time: "48s", streak: "14", leaderboard: "#12", timeTrend: "+2s" },
        chartLabels: ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Yak"],
        chartValues: [30, 45, 65, 75, 70, 85, 110],
        habits: { suv: 100, kitob: 75, med: 90 },
        calendar: [
            { day: "D", status: "active" },
            { day: "S", status: "active" },
            { day: "C", status: "empty" },
            { day: "P", status: "dark" },
            { day: "J", status: "dark" },
            { day: "S", status: "active" },
            { day: "Y", status: "dark" }
        ],
        dailyActivity: [30, 50, 15, 75, 95, 60, 85],
        aiText: 'Ajoyib hafta, Aziz! Sen "Kitob o\'qish" odatida 14 kunlik streakka erishding. Tahlillar shuni ko\'rsatadiki, meditatsiyani kechroq bajarganingda muvaffaqiyat ehtimoli 20% ga oshmoqda.',
        alertText: 'Siz kechki payt 20:00 da eng faolsiz.'
    },
    oy: {
        stats: { days: "92", time: "184s", streak: "28", leaderboard: "#8", timeTrend: "+15s" },
        chartLabels: ["1-hafta", "2-hafta", "3-hafta", "4-hafta"],
        chartValues: [220, 290, 340, 410],
        habits: { suv: 85, kitob: 60, med: 70 },
        calendar: [
            { day: "H1", status: "dark" },
            { day: "H2", status: "active" },
            { day: "H3", status: "dark" },
            { day: "H4", status: "active" }
        ],
        dailyActivity: [70, 85, 60, 95],
        aiText: 'Oy yakunlari alo! Suv ichish odati barqaror saqlandi, lekin kitob oʻqishni haftaning oʻrtalarida koʻproq rejalashtirish foydali boʻladi.',
        alertText: 'Bu oy jami faolligingiz oʻtgan oydagidan 12% yuqori.'
    },
    yil: {
        stats: { days: "312", time: "740s", streak: "45", leaderboard: "#3", timeTrend: "+1s" },
        chartLabels: ["Chor-1", "Chor-2", "Chor-3", "Chor-4"],
        chartValues: [1200, 1500, 1800, 2400],
        habits: { suv: 92, kitob: 80, med: 85 },
        calendar: [
            { day: "C1", status: "dark" },
            { day: "C2", status: "dark" },
            { day: "C3", status: "active" },
            { day: "C4", status: "dark" }
        ],
        dailyActivity: [80, 90, 75, 95],
        aiText: 'Yillik natijangiz fantastik! Umumiy reytingda TOP 3% foydalanuvchilar qatoriga kirdingiz. Barakalla!',
        alertText: 'Yil davomida eng samarali oyingiz - May oyi boʻldi.'
    }
};

// --- GLOBAL O'ZGARUVCHILAR ---
let streakChart = null;

// --- GRAFIKNI CHIZISH FUNKSIYASI (CHART.JS) ---
function initChart(labels, dataValues) {
    const ctx = document.getElementById('streakChart').getContext('2d');
    
    // Gradient fon yaratish
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, 'rgba(108, 34, 166, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    if (streakChart) {
        streakChart.destroy(); // Eski grafikni o'chirish (yangilash uchun)
    }

    streakChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                borderColor: '#7B2CBF',
                borderWidth: 4,
                pointBackgroundColor: '#7B2CBF',
                pointHoverRadius: 6,
                fill: true,
                backgroundColor: gradient,
                tension: 0.4 // Chiziqning silliqligi
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#888', font: { family: 'Inter' } } },
                y: { display: false, grid: { display: false } }
            }
        }
    });
}

// --- INTERFEYSNI YANGILASH FUNKSIYASI ---
function updateDashboard(timePeriod) {
    const data = dashboardData[timePeriod];

    // 1. Stat kartalarini yangilash
    document.getElementById('stat-days').innerText = data.stats.days;
    document.getElementById('stat-time').innerText = data.stats.time;
    document.getElementById('stat-time-trend').innerText = data.stats.timeTrend;
    document.getElementById('stat-streak').innerText = data.stats.streak;
    document.getElementById('stat-leaderboard').innerText = data.stats.leaderboard;

    // 2. Sarlavhalarni o'zgartirish
    document.getElementById('chart-legend').innerText = `Bu ${timePeriod}`;

    // 3. Grafikni yangilash
    initChart(data.chartLabels, data.chartValues);

    // 4. Odatlar (Progress Bar) ni yangilash
    document.getElementById('p-suv').innerText = `~${data.habits.suv}%`;
    document.getElementById('bar-suv').style.width = `${data.habits.suv}%`;
    
    document.getElementById('p-kitob').innerText = `~${data.habits.kitob}%`;
    document.getElementById('bar-kitob').style.width = `${data.habits.kitob}%`;

    document.getElementById('p-med').innerText = `~${data.habits.med}%`;
    document.getElementById('bar-med').style.width = `${data.habits.med}%`;

    // 5. Aktivlik xaritasi (Kalendar) ni chizish
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    data.calendar.forEach(item => {
        const col = document.createElement('div');
        col.className = 'day-col';
        
        let dotClass = 'dot';
        let dotContent = '';
        if (item.status === 'active') { dotClass += ' active'; dotContent = '•'; }
        if (item.status === 'dark') { dotClass += ' active-dark'; dotContent = '•'; }

        col.innerHTML = `<span>${item.day}</span><div class="${dotClass}">${dotContent}</div>`;
        calendarGrid.appendChild(col);
    });

    // 6. AI matni va ogohlantirishni yangilash
    document.getElementById('ai-text-content').innerText = data.aiText;
    document.getElementById('alert-text').innerText = data.alertText;

    // 7. Kunlik Gistogrammani chizish
    const barChart = document.getElementById('dailyBarChart');
    barChart.innerHTML = '';
    
    const maxVal = Math.max(...data.dailyActivity);
    data.dailyActivity.forEach((val) => {
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';

        const heightPercentage = (val / maxVal) * 100;
        const isActive = heightPercentage > 80 ? 'active' : '';

        barWrapper.innerHTML = `<div class="bar ${isActive}" style="height: ${heightPercentage}%;" title="${val} soat"></div>`;
        barChart.appendChild(barWrapper);
    });
}

// --- EVENT LISTENERS (HODISALAR) ---
document.addEventListener("DOMContentLoaded", () => {
    // Sahifa ilk bor yuklanganda 'hafta' ma'lumotlarini chiqarish
    updateDashboard('hafta');

    // Filtrlarni bosganda ishlash
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Aktiv klassni almashtirish
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Tanlangan davr ma'lumotlarini yuklash
            const selectedTime = e.target.getAttribute('data-time');
            updateDashboard(selectedTime);
        });
    });

    // AI tugmasini bosganda oddiy interaktivlik
    document.getElementById('aiBtn').addEventListener('click', () => {
        alert("AI Tavsiyasi: Haftalik rejangiz muvaffaqiyatli tahlil qilindi. Davom eting!");
    });

    // Qo'ng'iroqcha tugmasi
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert("Yangi bildirishnomalar mavjud emas.");
        });
    }
});