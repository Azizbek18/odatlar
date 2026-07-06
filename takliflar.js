document.addEventListener('DOMContentLoaded', () => {
    function isTimeExpired(endTimeStr, dateStr) {
        if (!endTimeStr) return false;
        if (dateStr) {
            const endDateTime = new Date(`${dateStr}T${endTimeStr}`);
            return new Date() > endDateTime;
        }
        const parts = endTimeStr.split(':');
        if (parts.length < 2) return false;
        const endHours = parseInt(parts[0], 10);
        const endMinutes = parseInt(parts[1], 10);
        
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        
        if (currentHours > endHours) {
            return true;
        } else if (currentHours === endHours) {
            return currentMinutes >= endMinutes;
        }
        return false;
    }

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

    // ===== MOCK USER DATA FOR FALLBACK / OTHER TABS =====
    const tabUsers = {
        connections: [],
        takliflar: [],
        tavsiyalar: []
    };

    let activeTab = 'connections';

    // ===== TOAST BILDIRISHNOMALAR FUNKSIYASI =====
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

    // ===== Header events =====
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            window.location.href = 'Bildirishnomalar.html';
        });
    }

    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        const userName = localStorage.getItem('user_name') || 'Azizbek';
        const avatarPlaceholder = profileBtn.querySelector('.avatar-placeholder');
        const userNameSpan = profileBtn.querySelector('span');
        if (avatarPlaceholder) avatarPlaceholder.textContent = userName.charAt(0).toUpperCase();
        if (userNameSpan) userNameSpan.textContent = userName;

        profileBtn.addEventListener('click', () => {
            window.location.href = 'profileS.html';
        });
    }

    // ===== DYNAMIC SUPABASE DATA INGESTION =====
    async function loadDynamicProposals() {
        const userId = getUserId();
        if (!supabaseClient || !userId) {
            renderTabCards(activeTab);
            return;
        }

        try {
            const { data: acceptedReqs, error: acceptedErr } = await supabaseClient
                .from('lunch_requests')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .eq('status', 'accepted');

            if (acceptedErr) throw acceptedErr;

            let acceptedData = [];
            if (acceptedReqs && acceptedReqs.length > 0) {
                const annIds = [...new Set(acceptedReqs.map(r => r.announcement_id).filter(Boolean))];
                const senderIds = [...new Set(acceptedReqs.map(r => r.sender_id).filter(Boolean))];
                const receiverIds = [...new Set(acceptedReqs.map(r => r.receiver_id).filter(Boolean))];
                const profileIds = [...new Set([...senderIds, ...receiverIds])];

                const { data: annData } = await supabaseClient.from('lunch_announcements').select('*').in('id', annIds);
                const { data: profData } = await supabaseClient.from('profiles').select('*').in('id', profileIds);

                acceptedData = acceptedReqs.map(req => {
                    const ann = annData ? annData.find(a => a.id === req.announcement_id) : null;
                    const sender = profData ? profData.find(p => p.id === req.sender_id) : null;
                    const receiver = profData ? profData.find(p => p.id === req.receiver_id) : null;
                    return { ...req, lunch_announcements: ann, sender, receiver };
                });
            }

            if (!acceptedErr && acceptedData && acceptedData.length > 0) {
                const validConnections = [];
                for (const req of acceptedData) {
                    const ann = req.lunch_announcements;
                    const localDate = new Date(ann?.created_at || req.created_at);
                    const yyyy = localDate.getFullYear();
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(localDate.getDate()).padStart(2, '0');
                    const datePart = ann?.lunch_date || `${yyyy}-${mm}-${dd}`;
                    if (ann && isTimeExpired(ann.end_time, datePart)) {
                        supabaseClient
                            .from('lunch_requests')
                            .update({ status: 'completed' })
                            .eq('id', req.id)
                            .then(() => {});
                        if (ann.id) {
                            supabaseClient
                                .from('lunch_announcements')
                                .update({ status: 'completed' })
                                .eq('id', ann.id)
                                .then(() => {});
                        }
                    } else {
                        validConnections.push(req);
                    }
                }

                tabUsers.connections = validConnections.map(req => {
                    const partner = req.sender_id === userId ? req.receiver : req.sender;
                    const name = partner?.full_name || partner?.name || "Foydalanuvchi";
                    const role = partner?.role || "Mutaxassis";
                    const avatar = partner?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                    const bio = partner?.bio || "";
                    const interests = partner?.interests || [];
                    const rating = partner?.points ? Math.min(5.0, 4.0 + (partner.points / 500)).toFixed(1) : '4.8';

                    return {
                        id: req.id,
                        partnerId: partner?.id,
                        name,
                        job: role,
                        rating,
                        img: avatar,
                        tags: interests,
                        online: true,
                        bio
                    };
                });
            }

            // B. Fetch pending requests (incoming & outgoing)
            const { data: pendingReqs, error: pendingErr } = await supabaseClient
                .from('lunch_requests')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .eq('status', 'pending');

            if (pendingErr) throw pendingErr;

            let pendingData = [];
            if (pendingReqs && pendingReqs.length > 0) {
                const annIds = [...new Set(pendingReqs.map(r => r.announcement_id).filter(Boolean))];
                const senderIds = [...new Set(pendingReqs.map(r => r.sender_id).filter(Boolean))];
                const receiverIds = [...new Set(pendingReqs.map(r => r.receiver_id).filter(Boolean))];
                const profileIds = [...new Set([...senderIds, ...receiverIds])];

                const { data: annData } = await supabaseClient.from('lunch_announcements').select('*').in('id', annIds);
                const { data: profData } = await supabaseClient.from('profiles').select('*').in('id', profileIds);

                pendingData = pendingReqs.map(req => {
                    const ann = annData ? annData.find(a => a.id === req.announcement_id) : null;
                    const sender = profData ? profData.find(p => p.id === req.sender_id) : null;
                    const receiver = profData ? profData.find(p => p.id === req.receiver_id) : null;
                    return { ...req, lunch_announcements: ann, sender, receiver };
                });
            }

            if (!pendingErr && pendingData) {
                const validPending = [];
                for (const req of pendingData) {
                    const ann = req.lunch_announcements;
                    const localDate = new Date(ann?.created_at || req.created_at);
                    const yyyy = localDate.getFullYear();
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(localDate.getDate()).padStart(2, '0');
                    const datePart = ann?.lunch_date || `${yyyy}-${mm}-${dd}`;
                    if (ann && isTimeExpired(ann.end_time, datePart)) {
                        supabaseClient
                            .from('lunch_requests')
                            .update({ status: 'expired' })
                            .eq('id', req.id)
                            .then(() => {});
                    } else {
                        validPending.push(req);
                    }
                }

                // If there are real requests, replace mock array, else we keep fallback
                if (validPending.length > 0) {
                    tabUsers.takliflar = validPending.map(req => {
                        const isIncoming = req.receiver_id === userId;
                        const partner = isIncoming ? req.sender : req.receiver;
                        const name = partner?.full_name || partner?.name || "Foydalanuvchi";
                        const role = partner?.role || "Mutaxassis";
                        const avatar = partner?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                        const bio = partner?.bio || "";
                        const interests = partner?.interests || [];
                        const rating = partner?.points ? Math.min(5.0, 4.0 + (partner.points / 500)).toFixed(1) : '4.8';

                        return {
                            id: req.id,
                            partnerId: partner?.id,
                            name,
                            job: role,
                            rating,
                            img: avatar,
                            tags: interests,
                            online: true,
                            incoming: isIncoming,
                            bio
                        };
                    });
                }
            }

            // C. Fetch recommended partners from DB
            const { data: profilesData, error: profilesErr } = await supabaseClient
                .from('profiles')
                .select('*')
                .neq('id', userId)
                .limit(6);

            if (!profilesErr && profilesData && profilesData.length > 0) {
                tabUsers.tavsiyalar = profilesData.map(p => {
                    const name = p.full_name || p.name || "Foydalanuvchi";
                    const role = p.role || "Mutaxassis";
                    const avatar = p.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                    const bio = p.bio || "";
                    const interests = p.interests || [];
                    const rating = p.points ? Math.min(5.0, 4.0 + (p.points / 500)).toFixed(1) : '4.8';

                    return {
                        id: p.id,
                        name,
                        job: role,
                        rating,
                        img: avatar,
                        tags: interests,
                        online: Math.random() > 0.4,
                        bio
                    };
                });
            }

            // Sync HTML tab labels
            updateTabBadgeLabels();

            // Re-render
            renderTabCards(activeTab);

        } catch (err) {
            console.error("Error loading dynamic proposals:", err);
        }
    }

    function updateTabBadgeLabels() {
        const connTab = document.querySelector('[data-tab="connections"]');
        const taklifTab = document.querySelector('[data-tab="takliflar"]');

        if (connTab) {
            connTab.innerHTML = `<i class="fa-solid fa-user-group"></i> Ulanishlar (${tabUsers.connections.length})`;
        }
        if (taklifTab) {
            taklifTab.innerHTML = `<i class="fa-regular fa-envelope"></i> Takliflar (${tabUsers.takliflar.length})`;
        }
    }

    // ===== DINAMIK RENDERING FUNKSIYASI =====
    const cardsContainer = document.getElementById('cards-container');

    function renderTabCards(tabName) {
        if (!cardsContainer) return;
        cardsContainer.innerHTML = '';
        activeTab = tabName;

        const users = tabUsers[tabName] || [];
        if (users.length === 0) {
            cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-style: italic;">Hozircha bu bo'limda foydalanuvchilar yo'q.</div>`;
            return;
        }

        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.setAttribute('data-name', user.name);
            card.setAttribute('data-job', user.job);

            let headerHtml = `
                <div class="card-header">
                    <div class="avatar-wrapper">
                        <img src="${user.img}" alt="${user.name}" class="user-img">
                        <span class="status-dot ${user.online ? 'online' : 'offline'}"></span>
                    </div>
                    <div class="user-info">
                        <div class="name-rating">
                            <h3>${user.name}</h3>
                            <span class="rating"><i class="fa-solid fa-star"></i> ${user.rating}</span>
                        </div>
                        <p class="job-title">${user.job}</p>
                        <div class="tags">
                            ${(Array.isArray(user.tags) ? user.tags : []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>

            `;

            let actionsHtml = '';
            if (tabName === 'takliflar') {
                if (user.incoming) {
                    actionsHtml = `
                        <div class="card-actions">
                            <button class="btn-invite accept-btn" style="background-color: #12b76a; border: none; color: white;"><i class="fa-solid fa-check"></i> Qabul qilish</button>
                            <button class="btn-invite reject-btn" style="background-color: #ef4444; border: none; color: white; margin-left: 8px;"><i class="fa-solid fa-xmark"></i> Rad etish</button>
                            <button class="btn-icon msg-btn"><i class="fa-regular fa-comment-dots"></i></button>
                        </div>
                    `;
                } else {
                    actionsHtml = `
                        <div class="card-actions">
                            <button class="btn-invite sent-btn" style="background-color: rgba(0, 90, 135, 0.1); color: var(--primary-color); border: none; cursor: default;" disabled><i class="fa-solid fa-paper-plane"></i> Kutilmoqda</button>
                            <button class="btn-icon reject-btn" style="color: #ef4444;" title="Bekor qilish"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                }
            } else {
                actionsHtml = `
                    <div class="card-actions">
                        <button class="btn-invite invite-action-btn"><i class="fa-solid fa-utensils"></i> Tushlikka taklif</button>
                        <button class="btn-icon msg-btn"><i class="fa-regular fa-comment-dots"></i></button>
                        <button class="btn-icon more-btn"><i class="fa-solid fa-ellipsis"></i></button>
                    </div>
                `;
            }

            card.innerHTML = headerHtml + actionsHtml;
            cardsContainer.appendChild(card);

            // Accept proposal event handler
            const acceptBtn = card.querySelector('.accept-btn');
            if (acceptBtn) {
                acceptBtn.addEventListener('click', async () => {
                    acceptBtn.disabled = true;
                    acceptBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

                    if (supabaseClient && !user.id.startsWith("mock")) {
                        const { error } = await supabaseClient
                            .from('lunch_requests')
                            .update({ status: 'accepted' })
                            .eq('id', user.id);
                        
                        if (error) {
                            showToast("Xatolik yuz berdi: " + error.message, "error");
                            acceptBtn.disabled = false;
                            acceptBtn.innerHTML = `<i class="fa-solid fa-check"></i> Qabul qilish`;
                            return;
                        }
                    }

                    showToast(`${user.name}ning tushlik taklifi qabul qilindi! Chat boshlanmoqda...`, "success");
                    
                    const partner = {
                        id: user.partnerId || user.id,
                        requestId: user.id,
                        name: user.name,
                        role: user.job,
                        avatar: user.img,
                        interests: user.tags,
                        location: "Belgilangan tushlik manzili",
                        icebreaker: `${user.name} bilan suhbatlashish uchun uning sohasiga oid savollar berishingiz mumkin!`
                    };
                    localStorage.setItem('current_match', JSON.stringify(partner));

                    setTimeout(() => {
                        window.location.href = 'chat.html';
                    }, 1500);
                });
            }

            // Reject / Cancel proposal event handler
            const rejectBtn = card.querySelector('.reject-btn');
            if (rejectBtn) {
                rejectBtn.addEventListener('click', async () => {
                    rejectBtn.disabled = true;
                    rejectBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

                    if (supabaseClient && !user.id.startsWith("mock")) {
                        const { error } = await supabaseClient
                            .from('lunch_requests')
                            .update({ status: 'cancelled' })
                            .eq('id', user.id);

                        if (error) {
                            showToast("Xatolik yuz berdi: " + error.message, "error");
                            rejectBtn.disabled = false;
                            rejectBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> Rad etish`;
                            return;
                        }
                    }

                    showToast(`${user.name}ning taklifi rad etildi.`, "warning");

                    // Show "Rad etildi" visual state on card before removing
                    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.overflow = 'hidden';
                    card.style.border = '1.5px solid #ef4444';
                    card.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.12)';
                    card.style.background = 'linear-gradient(135deg, rgba(254,242,242,0.95), rgba(255,255,255,0.9))';

                    // Replace action buttons with "Rad etildi" banner
                    const actionsArea = card.querySelector('.card-actions') || card.querySelector('.actions-row') || rejectBtn.closest('div');
                    if (actionsArea) {
                        actionsArea.innerHTML = `
                            <div style="display:flex; align-items:center; gap:10px; padding:6px 0; color:#ef4444; font-weight:700; font-size:14px;">
                                <div style="width:36px; height:36px; border-radius:50%; background:rgba(239,68,68,0.1); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
                                    <i class="fa-solid fa-xmark"></i>
                                </div>
                                <span>Taklif rad etildi</span>
                            </div>
                        `;
                    }

                    // Fade out and remove the card after 1.8 seconds
                    setTimeout(() => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateX(30px) scale(0.97)';
                        card.style.maxHeight = card.offsetHeight + 'px';
                        setTimeout(() => {
                            card.style.maxHeight = '0';
                            card.style.marginBottom = '0';
                            card.style.padding = '0';
                            setTimeout(() => {
                                card.remove();
                                loadDynamicProposals();
                            }, 350);
                        }, 300);
                    }, 1800);
                });
            }

            // New invitation sender
            const inviteBtn = card.querySelector('.invite-action-btn');
            if (inviteBtn) {
                inviteBtn.addEventListener('click', async () => {
                    // Check if it's a real profile ID (UUID format)
                    if (supabaseClient && !user.id.startsWith("mock")) {
                        showToast(`${user.name} ayni damda faol tushlik e'loni bermagan. Uni xarita sahifasidan qidirishga yo'naltirilmoqda...`, "info");
                        setTimeout(() => {
                            window.location.href = `xarita.html`;
                        }, 2000);
                    } else {
                        // Mock fallback simulator
                        if (!inviteBtn.classList.contains('sent')) {
                            inviteBtn.innerHTML = `<i class="fa-solid fa-check"></i> Yuborildi`;
                            inviteBtn.style.backgroundColor = '#12b76a';
                            inviteBtn.style.color = '#fff';
                            inviteBtn.classList.add('sent');
                            showToast(`${user.name}ga tushlik taklifi muvaffaqiyatli yuborildi!`, "success");
                        } else {
                            inviteBtn.innerHTML = `<i class="fa-solid fa-utensils"></i> Tushlikka taklif`;
                            inviteBtn.style.backgroundColor = '';
                            inviteBtn.style.color = '';
                            inviteBtn.classList.remove('sent');
                        }
                    }
                });
            }

            const msgBtn = card.querySelector('.msg-btn');
            if (msgBtn) {
                msgBtn.addEventListener('click', () => {
                    const partner = {
                        id: user.partnerId || user.id,
                        requestId: user.id,
                        name: user.name,
                        role: user.job,
                        avatar: user.img,
                        interests: user.tags,
                        location: "Tushlik manzili",
                        icebreaker: `${user.name} bilan suhbatlashish uchun uning sohasiga oid savollar berishingiz mumkin!`
                    };
                    localStorage.setItem('current_match', JSON.stringify(partner));

                    showToast(`${user.name} bilan chat sahifasi ochilmoqda...`, "success");
                    setTimeout(() => {
                        window.location.href = 'chat.html';
                    }, 1200);
                });
            }

            const moreBtn = card.querySelector('.more-btn');
            if (moreBtn) {
                moreBtn.addEventListener('click', () => {
                    showToast(`${user.name} profilining qo'shimcha ma'lumotlari: "${user.bio || 'Yaxshi hamroh'}"`, "info");
                });
            }
        });
    }

    // ===== TABS NAVIGATION (Toggle active tabs) =====
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            renderTabCards(tabName);
        });
    });

    // ===== QIDIRUV (SEARCH ACTION) =====
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const cardsInGrid = document.querySelectorAll('.user-card');

            cardsInGrid.forEach(card => {
                const name = card.getAttribute('data-name').toLowerCase();
                const job = card.getAttribute('data-job').toLowerCase();

                if (name.includes(searchTerm) || job.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            showToast('Filtrlash oynasi tez kunda!', 'info');
        });
    }

    const addFriendBtn = document.getElementById('add-friend-btn');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', () => {
            showToast('Yangi foydalanuvchilar va takliflar olish uchun xarita sahifasiga yo\'naltirilmoqda...', 'info');
            setTimeout(() => {
                window.location.href = 'xarita.html';
            }, 1200);
        });
    }

    // Load initial database data
    loadDynamicProposals();
});
