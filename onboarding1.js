let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const nextBtn = document.getElementById('nextBtn');
const totalSlides = slides.length;

function updateSlide(index) {
    if (slides.length === 0 || dots.length === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    dots[index].classList.add('active');

    if (nextBtn) {
        if (index === totalSlides - 1) {
            nextBtn.innerHTML = "Boshlash 🚀";
        } else {
            nextBtn.innerHTML = "Keyingisi →";
        }
    }
}

function nextSlide() {
    currentSlide++;

    if (currentSlide >= totalSlides) {
        currentSlide = totalSlides - 1; // Oxirgi slaydda ushlab turish
        openSuccessWorkflow(); // Alert o'rniga yangi oyna va mushaklar!
        return;
    }
    updateSlide(currentSlide);
}

function skipToLast() {
    window.location.href = 'onboarding.html';
}

// --- MODAL VA MUSHAKLAR MANTIQI ---

function openSuccessWorkflow() {
    // 1. Modal oynani ochish
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('active');

    // 2. Mushaklarni ketma-ket portlatish (Chap va o'ng chetlardan)
    launchFireworksLoop();
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('active');
    window.location.href = 'onboarding.html';
}

// Ekran chetlaridan kaskadli mushaklar otish tizimi
function launchFireworksLoop() {
    const container = document.getElementById('fireworks-container');
    if (!container) return;

    // Jami 6 ta katta portlash har xil chekkalardan otiladi
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            // Chap yoki o'ng tomondan otilish koordinatalari
            const isLeft = i % 2 === 0;
            const x = isLeft ? Math.random() * 20 + 5 : Math.random() * 20 + 75; // foizda %
            const y = Math.random() * 40 + 20; // foizda %
            
            createExplosion(x, y, container);
        }, i * 350); // Har 350ms da bittadan portlash silliq zanjir hosil qiladi
    }
}

// Bitta mushak portlashi va uning zarrachalari (particles)
function createExplosion(x, y, container) {
    const particleCount = 30; // Har bir portlashdagi rangli zarrachalar soni
    const colors = ['#ff5200', '#ffeb3b', '#2196f3', '#4caf50', '#e91e63', '#9c27b0', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework-particle');
        
        // Tasodifiy rang tanlash
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = randomColor;
        
        // Boshlang'ich koordinata
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;

        // Zarrachalar har tomonga sochilishi uchun tasodifiy burchak va masofa (CSS Variable)
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 120 + 40;
        const xMove = Math.cos(angle) * velocity;
        const yMove = Math.sin(angle) * velocity;

        particle.style.setProperty('--xMove', `${xMove}px`);
        particle.style.setProperty('--yMove', `${yMove}px`);

        container.appendChild(particle);

        // Animatsiya tugagach xotirani tozalash
        setTimeout(() => {
            particle.remove();
        }, 1200);
    }
}