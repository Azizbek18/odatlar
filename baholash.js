document.addEventListener('DOMContentLoaded', () => {
    // ===== DYNAMIC PARTNER LOADING =====
    const partnerName = document.getElementById('partner-name');
    const partnerRole = document.getElementById('partner-role');
    const partnerImg = document.getElementById('partner-img');
    const partnerTags = document.getElementById('partner-tags');

    // Default partner data (fallback)
    let partner = {
        name: "Jasur Tashpulatov",
        role: "Frontend Developer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        interests: ["Frontend", "Networking", "TechTalks"]
    };

    // Try loading partner from localStorage
    const matchData = localStorage.getItem('current_match');
    if (matchData) {
        try {
            partner = JSON.parse(matchData);
        } catch (e) {
            console.error("Error parsing match data:", e);
        }
    }

    // Render partner details
    if (partnerName) partnerName.textContent = partner.name;
    if (partnerRole) partnerRole.textContent = partner.role || "Mutaxassis";
    if (partnerImg) partnerImg.src = partner.avatar || partnerImg.src;
    if (partnerTags && partner.interests) {
        partnerTags.innerHTML = '';
        partner.interests.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'm-tag';
            span.textContent = `#${tag}`;
            partnerTags.appendChild(span);
        });
    }

    // ===== RATING STARS SYSTEM =====
    let selectedRating = 4;
    const stars = document.querySelectorAll('#star-rating .star-icon');
    const ratingDesc = document.getElementById('rating-desc');

    const statusTexts = {
        1: "Yomon 😞",
        2: "Qoniqarsiz 😐",
        3: "O'rtacha 🙂",
        4: "Yaxshi! 🚀",
        5: "Ajoyib! 🎉"
    };

    function updateStarsDisplay(ratingValue) {
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= ratingValue) {
                star.classList.remove('empty');
            } else {
                star.classList.add('empty');
            }
        });
    }

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-value'));
            updateStarsDisplay(selectedRating);
            if (ratingDesc) ratingDesc.textContent = statusTexts[selectedRating];
        });
        star.addEventListener('mouseenter', function() {
            const currentHoverValue = parseInt(this.getAttribute('data-value'));
            updateStarsDisplay(currentHoverValue);
        });
    });

    document.getElementById('star-rating').addEventListener('mouseleave', () => {
        updateStarsDisplay(selectedRating);
    });

    // ===== TOGGLE IMPRESSION CHIPS =====
    window.toggleTag = function(button) {
        button.classList.toggle('active');
    };

    // ===== AI FEEDBACK TOGGLES =====
    const aiOptions = document.querySelectorAll('#ai-feedback-group .toggle-option');
    aiOptions.forEach(option => {
        option.addEventListener('click', () => {
            aiOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });



    // ===== CLOSE BUTTON ACTION =====
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (confirm("Baholash oynasini yopmoqchimisiz? Kiritilgan ma'lumotlar saqlanmaydi.")) {
                window.location.href = 'xarita.html';
            }
        });
    }

    // ===== TOAST NOTIFICATION =====
    function showSuccessToast() {
        const container = document.getElementById('toast-container');
        if (!container) {
            const c = document.createElement('div');
            c.id = 'toast-container';
            document.body.appendChild(c);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="material-icons" style="color: #52c41a; font-size: 20px;">check_circle</span>
            <span>Fikringiz muvaffaqiyatli qabul qilindi. Rahmat!</span>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ===== FORM SUBMISSION =====
    window.submitFeedback = function(event) {
        event.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const comment = document.getElementById('comment-text').value;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Yuborilmoqda...`;
        submitBtn.style.opacity = "0.7";
        submitBtn.style.pointerEvents = "none";

        // Gather feedback data for history logging if needed
        const activeChips = [];
        document.querySelectorAll('#tassurot-chips .tag-btn.active').forEach(btn => {
            activeChips.push(btn.textContent.trim());
        });

        const aiUsefulness = document.querySelector('#ai-feedback-group .toggle-option.active')?.getAttribute('data-value') || 'ortacha';

        // Save to match history in localStorage to make Match History dynamic!
        const historyData = localStorage.getItem('match_history') || '[]';
        let historyList = [];
        try {
            historyList = JSON.parse(historyData);
        } catch (e) {
            historyList = [];
        }

        const newHistoryItem = {
            name: partner.name,
            role: partner.role,
            avatar: partner.avatar,
            rating: selectedRating,
            chips: activeChips,
            aiUsefulness: aiUsefulness,
            comment: comment,
            date: new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }),
            location: partner.location || "Rayhon Milliy Taomlari"
        };
        historyList.unshift(newHistoryItem);
        localStorage.setItem('match_history', JSON.stringify(historyList));

        setTimeout(() => {
            showSuccessToast();
            document.getElementById('feedback-form').reset();
            selectedRating = 4;
            updateStarsDisplay(4);
            document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
            submitBtn.innerHTML = `Yuborish <span class="material-icons-outlined">send</span>`;
            submitBtn.style.opacity = "1";
            submitBtn.style.pointerEvents = "auto";

            // Redirect back to match history page to show their rating!
            setTimeout(() => {
                window.location.href = 'matchlartarixi.html';
            }, 2000);
        }, 1200);
    };
});