document.addEventListener("DOMContentLoaded", () => {

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

    // ===== DYNAMIC ADMIN METRICS =====
    const localHistory = localStorage.getItem('match_history');
    if (localHistory) {
        try {
            const historyList = JSON.parse(localHistory);
            const historyCount = historyList.length;
            
            const totalMatchesCard = document.querySelector('.border-orange .card-value');
            if (totalMatchesCard) {
                totalMatchesCard.textContent = (1450 + historyCount).toLocaleString();
            }

            const ratingSum = historyList.reduce((sum, item) => sum + item.rating, 0);
            const averageRatingCard = document.querySelector('.border-purple .card-value');
            if (averageRatingCard && historyCount > 0) {
                const newAvg = ((1450 * 4.8 + ratingSum) / (1450 + historyCount)).toFixed(1);
                averageRatingCard.textContent = newAvg;
            }

            const activeUsersCard = document.querySelector('.border-blue .card-value');
            if (activeUsersCard) {
                activeUsersCard.textContent = (2842 + historyCount).toLocaleString();
            }
        } catch (e) {
            console.error("Error updating admin metrics:", e);
        }
    }

    // 1. CHIZIQLI GRAFIK (Uchrashuvlar dinamikasi)
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    
    // Grafikka chiroyli gradient (Aura) berish
    const gradientFill = ctxLine.createLinearGradient(0, 0, 0, 240);
    gradientFill.addColorStop(0, 'rgba(43, 92, 143, 0.2)');
    gradientFill.addColorStop(1, 'rgba(43, 92, 143, 0.0)');

    // Kunlik va Haftalik ma'lumotlar to'plami (har oy uchun)
    const monthlyChartData = {
        jan2024: {
            daily: {
                labels: ['01 Yan', '07 Yan', '14 Yan', '21 Yan', '30 Yan'],
                data: [10, 45, 35, 55, 48]
            },
            weekly: {
                labels: ['1-Hafta', '2-Hafta', '3-Hafta', '4-Hafta'],
                data: [120, 310, 280, 450]
            }
        },
        feb2024: {
            daily: {
                labels: ['01 Fev', '07 Fev', '14 Fev', '21 Fev', '29 Fev'],
                data: [18, 52, 40, 62, 55]
            },
            weekly: {
                labels: ['1-Hafta', '2-Hafta', '3-Hafta', '4-Hafta'],
                data: [145, 350, 320, 490]
            }
        },
        mar2024: {
            daily: {
                labels: ['01 Mar', '07 Mar', '14 Mar', '21 Mar', '31 Mar'],
                data: [22, 60, 48, 70, 63]
            },
            weekly: {
                labels: ['1-Hafta', '2-Hafta', '3-Hafta', '4-Hafta'],
                data: [170, 390, 360, 530]
            }
        }
    };

    let currentMonth = 'jan2024';
    let currentView = 'daily';

    let lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: monthlyChartData[currentMonth][currentView].labels,
            datasets: [{
                label: 'Uchrashuvlar',
                data: monthlyChartData[currentMonth][currentView].data,
                borderColor: '#2b5c8f',
                borderWidth: 3,
                fill: true,
                backgroundColor: gradientFill,
                tension: 0.4, // Silliq burilishlar (Curve)
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
                y: { display: false } // Rasmda chap o'q qiymatlari yashirilgan
            }
        }
    });

    // Grafikni yangilash yordamchi funksiya
    function updateChart() {
        const data = monthlyChartData[currentMonth][currentView];
        lineChart.data.labels = data.labels;
        lineChart.data.datasets[0].data = data.data;
        lineChart.update();
    }

    // Kunlik / Haftalik tugmalari almashishi
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggleButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentView = e.target.getAttribute('data-view');
            updateChart();
        });
    });

    // 2. DOIRAVIY GRAFIK (Donut - Foydalanuvchi tarkibi)
    const ctxDonut = document.getElementById('donutChart').getContext('2d');
    new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [65, 35],
                backgroundColor: ['#3b82f6', '#f97316'],
                borderWidth: 0,
                weight: 0.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '78%', // Markazni ochish foizi
            plugins: { legend: { display: false } }
        }
    });

    // 3. INTERAKTIV TUGMALAR EFFEKTI (CSV Export & Filter)
    const csvBtn = document.getElementById('csvExportBtn');
    csvBtn.addEventListener('click', () => {
        csvBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Tayyorlanmoqda...`;
        setTimeout(() => {
            // Hozirgi oy va ko'rinishdagi grafik ma'lumotlaridan CSV yaratish
            const data = monthlyChartData[currentMonth][currentView];
            let csvContent = 'Sana,Uchrashuvlar\n';
            data.labels.forEach((label, i) => {
                csvContent += `${label},${data.data[i]}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Birgalikda_statistika.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            csvBtn.innerHTML = `<i class="fa-solid fa-download"></i> CSV Eksport`;
            showToast('Statistika CSV shaklida yuklab olindi!', 'success');
        }, 1200);
    });

    // Sana filtrini o'zgartirish — grafikni yangilash
    const dateSelect = document.getElementById('dateSelect');
    dateSelect.addEventListener('change', (e) => {
        currentMonth = e.target.value;
        updateChart();
        const monthNames = { jan2024: 'Yanvar', feb2024: 'Fevral', mar2024: 'Mart' };
        showToast(`${monthNames[currentMonth] || currentMonth} oyi ma'lumotlari yuklandi`, 'info');
    });

    // "Barcha harakatlar" tugmasi
    const loadMoreBtn = document.getElementById('loadMoreActivities');
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.innerText = "Yuklanmoqda...";
        setTimeout(() => {
            showToast('Barcha harakatlar yuklandi!', 'success');
            loadMoreBtn.innerText = "Barcha harakatlar";
        }, 800);
    });

    // E'lon berish tugmasi -> tushlik sahifasiga o'tish
    const advertiseBtn = document.getElementById('btn-advertise');
    if (advertiseBtn) {
        advertiseBtn.addEventListener('click', () => {
            window.location.href = 'tushlik.html';
        });
    }

    // 4. SIDEBAR HAVOLALARI
    // Sozlamalar havolasi
    const sozlamalarLink = document.querySelector('.nav-menu .nav-item:last-child a');
    if (sozlamalarLink && sozlamalarLink.textContent.trim().includes('Sozlamalar')) {
        sozlamalarLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'xarita.html?openSettings=true';
        });
    }

    // Yordam havolasi
    const yordamLink = document.querySelector('.footer-link:not(.logout) a');
    if (yordamLink && yordamLink.textContent.trim().includes('Yordam')) {
        yordamLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'Yordam.html';
        });
    }

    // 5. BILDIRISHNOMA QONGIROG'I
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        notificationBadge.style.cursor = 'pointer';
        notificationBadge.addEventListener('click', () => {
            window.location.href = 'Bildirishnomalar.html';
        });
    }

    // 6. ADMIN AVATAR
    const adminAvatar = document.querySelector('.admin-avatar');
    if (adminAvatar) {
        adminAvatar.style.cursor = 'pointer';
        adminAvatar.addEventListener('click', () => {
            window.location.href = 'profileS.html';
        });
    }

    // 7. OMMABOP TEGLAR ELLIPSIS IKONKASI
    const tagsEllipsis = document.querySelector('.card-title-header .fa-ellipsis');
    if (tagsEllipsis) {
        tagsEllipsis.style.cursor = 'pointer';
        tagsEllipsis.addEventListener('click', () => {
            showToast('Teglar sozlamalari tez kunda!', 'info');
        });
    }

    // 8. FOOTER HAVOLALARI
});
