document.addEventListener("DOMContentLoaded", () => {
    // ===== GET USER UUID FROM LOCAL STORAGE =====
    function getUserId() {
        try {
            const token = localStorage.getItem('sb-doboqtivghcdcoowoxmh-auth-token');
            if (token) {
                const parsed = JSON.parse(token);
                return parsed?.user?.id || null;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    // ===== SUPABASE CLIENT INITIALIZATION =====
    const SUPABASE_URL = 'https://doboqtivghcdcoowoxmh.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
    const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    const myId = getUserId();

    // DOM Elementlarini tanlash
    const editToggleBtn = document.getElementById('edit-toggle-btn');
    const inputs = document.querySelectorAll('.form-grid input, .form-grid textarea');

    const inputName = document.getElementById('input-name');
    const inputRoles = document.getElementById('input-roles');
    const inputInterests = document.getElementById('input-interests');
    const inputBio = document.getElementById('input-bio');

    const displayName = document.getElementById('display-name');
    const displayHeadline = document.getElementById('display-headline');
    const avatarLetters = document.getElementById('avatar-letters');
    const avatarIcon = document.getElementById('avatar-icon');

    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('avatar-img');
    const profileInterestsContainer = document.getElementById('profile-interests-container');

    let isEditing = false;

    // Toast alerts helper
    function showToast(message, type = 'success') {
        let container = document.getElementById('premium-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'premium-toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                perspective: 1000px;
                pointer-events: none;
            `;
            document.body.appendChild(container);

            if (!document.getElementById('premium-toast-styles')) {
                const style = document.createElement('style');
                style.id = 'premium-toast-styles';
                style.innerHTML = `
                    .premium-toast {
                        background: rgba(255, 255, 255, 0.7);
                        backdrop-filter: blur(20px) saturate(180%);
                        -webkit-backdrop-filter: blur(20px) saturate(180%);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        border-radius: 16px;
                        padding: 16px 24px;
                        font-family: 'Poppins', 'Inter', sans-serif;
                        font-weight: 600;
                        font-size: 14px;
                        color: #1e293b;
                        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08), 
                                    inset 0 1px 1px rgba(255, 255, 255, 0.5);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        min-width: 320px;
                        max-width: 400px;
                        pointer-events: auto;
                        transform: translateX(120%) rotateY(-30deg) scale(0.9);
                        opacity: 0;
                        transform-origin: right center;
                        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    .premium-toast.active {
                        transform: translateX(0) rotateY(0deg) scale(1);
                        opacity: 1;
                    }
                    .premium-toast.exit {
                        transform: translateX(120%) rotateY(30deg) scale(0.9);
                        opacity: 0;
                    }
                    .premium-toast::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 15%;
                        height: 70%;
                        width: 5px;
                        border-radius: 0 4px 4px 0;
                    }
                    .premium-toast.success::before { background: #12b76a; }
                    .premium-toast.error::before { background: #ef4444; }
                    .premium-toast.info::before { background: #3b82f6; }
                    .premium-toast.warning::before { background: #f59e0b; }
                    
                    .premium-toast-icon {
                        font-size: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .premium-toast.success .premium-toast-icon { color: #12b76a; }
                    .premium-toast.error .premium-toast-icon { color: #ef4444; }
                    .premium-toast.info .premium-toast-icon { color: #3b82f6; }
                    .premium-toast.warning .premium-toast-icon { color: #f59e0b; }
                `;
                document.head.appendChild(style);
            }
        }

        const toast = document.createElement('div');
        toast.className = `premium-toast ${type}`;

        const icons = {
            success: '✨',
            error: '🚨',
            info: '💡',
            warning: '⚠️'
        };

        toast.innerHTML = `
            <div class="premium-toast-icon">${icons[type] || '💡'}</div>
            <div style="flex: 1;">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('active');
        }, 50);

        setTimeout(() => {
            toast.classList.remove('active');
            toast.classList.add('exit');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3500);
    }

    // formatHeadline
    function formatHeadline(inputValue) {
        if (!inputValue.trim()) return "";
        return inputValue.split(',')
                         .map(item => item.trim())
                         .filter(item => item.length > 0)
                         .join(' • ');
    }

    // updateAvatarLetters
    function updateAvatarLetters(name) {
        if (!name) return "LM";
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }

    function isUsableAvatar(src) {
        const value = String(src || '').trim();
        if (!value) return false;
        return ![
            'Foydalanuvchi rasmi',
            'pravatar.cc',
            'avatar',
            'default',
            'placeholder'
        ].some(token => value.toLowerCase().includes(token.toLowerCase()));
    }

    function showAvatarIcon() {
        if (avatarImg) {
            avatarImg.style.display = 'none';
            avatarImg.hidden = true;
            avatarImg.removeAttribute('src');
        }
        if (avatarLetters) {
            avatarLetters.style.display = 'none';
            avatarLetters.hidden = true;
        }
        if (avatarIcon) {
            avatarIcon.style.display = 'block';
            avatarIcon.hidden = false;
        }
    }

    function showAvatarImage(src) {
        if (!isUsableAvatar(src)) {
            showAvatarIcon();
            return;
        }

        if (avatarIcon) {
            avatarIcon.style.display = 'none';
            avatarIcon.hidden = true;
        }
        if (avatarLetters) {
            avatarLetters.style.display = 'none';
            avatarLetters.hidden = true;
        }

        avatarImg.onload = () => {
            avatarImg.style.display = 'block';
            avatarImg.hidden = false;
        };
        avatarImg.onerror = showAvatarIcon;
        avatarImg.src = src;
    }

    // Load User Profile from Supabase
    async function loadUserProfile() {
        if (!supabaseClient || !myId) return;

        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', myId)
                .single();

            if (!error && data) {
                inputName.value = data.full_name || data.name || "";
                inputRoles.value = data.role || "";
                inputBio.value = data.bio || "";
                inputInterests.value = data.interests ? data.interests.join(", ") : "";

                displayName.textContent = data.full_name || data.name || "Foydalanuvchi";
                displayHeadline.textContent = formatHeadline(data.role || "Mutaxassis");

                // Render interests tags
                if (profileInterestsContainer) {
                    profileInterestsContainer.innerHTML = '';
                    if (data.interests && data.interests.length > 0) {
                        data.interests.forEach(tag => {
                            const span = document.createElement('span');
                            span.className = 'tag';
                            span.textContent = tag;
                            profileInterestsContainer.appendChild(span);
                        });
                    } else {
                        profileInterestsContainer.innerHTML = '<span class="tag">Networking</span>';
                    }
                }

                showAvatarImage(data.avatar_url);

                // Retrieve points/stats
                const points = data.points || 0;
                const statsRating = document.querySelector('.stat-rating');
                if (statsRating) {
                    statsRating.innerHTML = `<i class="fa-solid fa-star"></i> ${(Math.min(5.0, 4.0 + (points / 500))).toFixed(1)}`;
                }
            } else if (error) {
                console.error("Supabase load user profile error:", error);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Toggle Editing & Saving
    editToggleBtn.addEventListener('click', async () => {
        isEditing = !isEditing;
        
        inputs.forEach(input => {
            input.disabled = !isEditing;
            if (isEditing) {
                input.style.transition = "all 0.35s cubic-bezier(0.25, 1, 0.5, 1)";
            }
        });

        if (isEditing) {
            editToggleBtn.innerHTML = `<i class="fa-solid fa-check"></i> Saqlash`;
            editToggleBtn.classList.add('editing');
            inputName.focus();
        } else {
            // Save to database
            const interestsArray = inputInterests.value.split(',')
                .map(i => i.trim())
                .filter(i => i.length > 0);

            if (supabaseClient && myId) {
                const { error } = await supabaseClient
                    .from('profiles')
                    .update({
                        full_name: inputName.value,
                        role: inputRoles.value,
                        bio: inputBio.value,
                        interests: interestsArray
                    })
                    .eq('id', myId);

                if (!error) {
                    showToast("Profil muvaffaqiyatli saqlandi!", "success");
                    displayName.textContent = inputName.value;
                    displayHeadline.textContent = formatHeadline(inputRoles.value);

                    // Re-render interests
                    if (profileInterestsContainer) {
                        profileInterestsContainer.innerHTML = '';
                        interestsArray.forEach(tag => {
                            const span = document.createElement('span');
                            span.className = 'tag';
                            span.textContent = tag;
                            profileInterestsContainer.appendChild(span);
                        });
                    }

                    if (avatarImg.style.display === 'none') {
                        showAvatarIcon();
                    }
                } else {
                    showToast("Saqlashda xatolik: " + error.message, "error");
                }
            }

            editToggleBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Profilni tahrirlash`;
            editToggleBtn.classList.remove('editing');
            
            editToggleBtn.style.transform = "scale(1.04)";
            setTimeout(() => editToggleBtn.style.transform = "scale(1)", 180);
        }
    });

    // Change avatar click triggers file input
    changeAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const base64Image = e.target.result;
                if (avatarIcon) {
                    avatarIcon.style.display = 'none';
                    avatarIcon.hidden = true;
                }
                if (avatarLetters) {
                    avatarLetters.style.display = 'none';
                    avatarLetters.hidden = true;
                }
                avatarImg.style.opacity = 0;
                avatarImg.src = base64Image;
                avatarImg.style.display = 'block';
                avatarImg.hidden = false;
                
                setTimeout(() => {
                    avatarImg.style.transition = "opacity 0.5s ease-in-out";
                    avatarImg.style.opacity = 1;
                }, 50);

                // Save avatar to Supabase
                if (supabaseClient && myId) {
                    const { error } = await supabaseClient
                        .from('profiles')
                        .update({ avatar_url: base64Image })
                        .eq('id', myId);
                    if (!error) {
                        showToast("Profil rasmi muvaffaqiyatli yangilandi!", "success");
                    } else {
                        showToast("Rasm saqlashda xatolik: " + error.message, "error");
                    }
                }
            }
            reader.readAsDataURL(file);
        }
    });

    // Inputs visual shift on focus
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = "translateX(5px)";
            input.parentElement.style.transition = "all 0.3s ease";
        });
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = "translateX(0)";
        });
    });

    // Initial Load
    loadUserProfile();
});
