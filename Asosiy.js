document.addEventListener("DOMContentLoaded", () => {
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
        if (currentHours > endHours) return true;
        else if (currentHours === endHours) return currentMinutes >= endMinutes;
        return false;
    }

    const greetingNameEl = document.getElementById("user-greeting-name");
    if (greetingNameEl) {
        const storedName = localStorage.getItem("user_name");
        if (storedName) greetingNameEl.textContent = storedName;
    }

    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem('sb-doboqtivghcdcoowoxmh-auth-token');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_role');
            window.location.href = 'kirish.html';
        });
    }

    // =========================================================
    // 1. MAP SYSTEM
    // =========================================================
    const map = L.map('map', { zoomControl: true, fadeAnimation: true, zoomAnimation: true }).setView([41.3111, 69.2797], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    setTimeout(() => { map.invalidateSize(); }, 600);

    // =========================================================
    // 2. ANIMATIONS & MODAL STYLES
    // =========================================================
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes pulse-ring {
            0% { transform: translate(-50%, -50%) rotateX(70deg) scale(0.2); opacity: 1; border-width: 3px; }
            100% { transform: translate(-50%, -50%) rotateX(70deg) scale(3.5); opacity: 0; border-width: 0px; }
        }
        @keyframes float-marker {
            0%, 100% { transform: translateY(0); box-shadow: 0 0 12px rgba(0, 119, 182, 0.5); }
            50% { transform: translateY(-6px); box-shadow: 0 12px 18px rgba(0, 119, 182, 0.15); }
        }
        @keyframes float-rocket {
            0%, 100% { transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 0 0 rgba(0, 119, 182, 0)); }
            50% { transform: translateY(-20px) scale(1.25) rotate(15deg); filter: drop-shadow(0 15px 15px rgba(0, 119, 182, 0.4)); }
        }
        @keyframes css-shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            20%, 60% { transform: translateX(-12px) rotate(-5deg); }
            40%, 80% { transform: translateX(12px) rotate(5deg); }
        }
        .custom-pulse-glow::after {
            content: ''; position: absolute; width: 40px; height: 40px;
            background: transparent; border: 2px solid #0077b6;
            border-radius: 50%; left: 50%; top: 50%;
            animation: pulse-ring 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite; z-index: -1;
        }
        .custom-pulse-glow > div { animation: float-marker 2.5s ease-in-out infinite; position: relative; }
        .custom-confirm-modal {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px);
            display: flex; align-items: center; justify-content: center; z-index: 9999; opacity: 0;
            padding: 16px; box-sizing: border-box; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .custom-confirm-content {
            background: white; padding: 32px; border-radius: 22px; width: 100%; max-width: 440px; text-align: center;
            box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.04);
            transform: scale(0.7) translateY(30px); transition: transform 0.5s cubic-bezier(0.34, 1.75, 0.64, 1); box-sizing: border-box;
        }
        .custom-confirm-modal.active { opacity: 1; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .custom-confirm-modal.active .custom-confirm-content { transform: scale(1) translateY(0); }
        .animate-btn { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .animate-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 24px rgba(0, 119, 182, 0.2) !important; }
        .animate-btn:active { transform: translateY(1px) scale(0.96); }
        .shake-active { animation: css-shake 0.35s ease-in-out !important; }
    `;
    document.head.appendChild(styleSheet);

    let currentMarker = L.marker([41.3111, 69.2797]).addTo(map)
        .bindPopup('<b style="font-family:sans-serif; font-size:12px;">Siz shu yerdasiz</b>').openPopup();

    const searchInput = document.getElementById("map-search-input");
    const searchBtn = document.getElementById("map-search-btn");
    const bannerWrapper = document.getElementById("dynamic-banner-wrapper");

    // =========================================================
    // 3. CONFIRMATION CARD MODAL
    // =========================================================
    function showConfirmationCard(locationName, onConfirm) {
        const modal = document.createElement("div");
        modal.className = "custom-confirm-modal";
        modal.innerHTML = `
            <div class="custom-confirm-content" style="font-family: sans-serif;">
                <div style="font-size: 44px; margin-bottom: 14px; display:inline-block; animation: float-rocket 2s ease-in-out infinite;">📍</div>
                <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight:800; letter-spacing: -0.5px;">E'lon qo'shilsinmi?</h3>
                <p style="margin: 0 0 28px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Rostdan ham <b style="color: #0077b6;">"${locationName}"</b> joyiga tushlik e'lonini joylashtirmoqchimisiz?
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="modal-cancel" class="animate-btn" style="flex:1; background: #f1f5f9; color: #64748b; border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 13.5px; letter-spacing: -0.01em;">Yo'q, bekor qilish</button>
                    <button id="modal-confirm" class="animate-btn" style="flex:1; background: linear-gradient(135deg, #0077b6 0%, #005A87 100%); color: white; border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; font-size: 13.5px; box-shadow: 0 6px 18px rgba(0, 90, 135, 0.2); letter-spacing: -0.01em;">Ha, joylashtirilsin</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add("active"), 10);
        const closeModal = () => { modal.classList.remove("active"); setTimeout(() => modal.remove(), 400); };
        modal.querySelector("#modal-cancel").addEventListener("click", closeModal);
        modal.querySelector("#modal-confirm").addEventListener("click", () => { closeModal(); onConfirm(); });
    }



    // =========================================================
    // 5. GEOCODING SEARCH
    // =========================================================
    function searchAndProcessLocation(queryText) {
        if (!queryText) return;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText + ", Uzbekistan")}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    const cleanName = data[0].display_name.split(',')[0];
                    map.flyTo([lat, lon], 17, { animate: true, duration: 2.2 });
                    if (currentMarker) map.removeLayer(currentMarker);
                    const searchIcon = L.divIcon({
                        className: 'custom-pulse-glow',
                        html: '<div style="background: linear-gradient(135deg, #0077b6, #005A87); width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 14px rgba(0, 119, 182, 0.5);"></div>',
                        iconSize: [14, 14], iconAnchor: [7, 7]
                    });
                    currentMarker = L.marker([lat, lon], { icon: searchIcon }).addTo(map)
                        .bindPopup(`<b style="font-family:sans-serif; font-size:12px;">📍 ${cleanName}</b>`).openPopup();
                    showConfirmationCard(cleanName, () => { 
                        window.location.href = `tushlik.html?location=${encodeURIComponent(cleanName)}&lat=${lat}&lon=${lon}`; 
                    });
                }
            });
    }

    function executeSearchInput() {
        if (!searchInput) return;
        const textValue = searchInput.value.trim();
        if (!textValue) { searchInput.style.borderColor = "#ef4444"; return; }
        searchInput.style.borderColor = "";
        searchAndProcessLocation(textValue);
    }
    if (searchBtn) searchBtn.addEventListener("click", executeSearchInput);
    if (searchInput) searchInput.addEventListener("keypress", (e) => { if (e.key === "Enter") executeSearchInput(); });

    // =========================================================
    // 6. INPUT MODAL (MOBILE)
    // =========================================================
    function triggerMainModalFlow() {
        const inputModal = document.createElement("div");
        inputModal.className = "custom-confirm-modal";
        inputModal.innerHTML = `
            <div class="custom-confirm-content" style="font-family: sans-serif; text-align: left;">
                <h3 style="margin: 0 0 6px 0; color: #0f172a; font-size: 20px; font-weight:800; text-align: center; letter-spacing: -0.5px;">🚀 Tushlik e'lonini qo'shish</h3>
                <p style="margin: 0 0 22px 0; color: #64748b; font-size: 13.5px; text-align: center; line-height: 1.5;">Tushlik qilmoqchi bo'lgan joyingiz yoki kafengiz nomini kiriting.</p>
                <input id="custom-modal-input" type="text" placeholder="Masalan: Evos, Chilonzor yoki O'zMU..."
                    style="width: 100%; padding: 14px 16px; border: 1.5px solid #e2e8f0; border-radius: 14px; font-size: 14.5px; margin-bottom: 26px; outline: none; box-sizing: border-box; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: #f8fafc; color: #0f172a; font-weight: 500;">
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="modal-input-cancel" class="animate-btn" style="background: #f1f5f9; color: #64748b; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 13.5px;">Yopish</button>
                    <button id="modal-input-submit" class="animate-btn" style="background: linear-gradient(135deg, #0077b6 0%, #005A87 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 13.5px; box-shadow: 0 6px 18px rgba(0, 90, 135, 0.2);">Joyni qidirish</button>
                </div>
            </div>`;
        document.body.appendChild(inputModal);
        setTimeout(() => {
            inputModal.classList.add("active");
            const mInput = document.getElementById("custom-modal-input");
            if (mInput) {
                mInput.focus();
                mInput.addEventListener("focus", () => { mInput.style.borderColor = "#0077b6"; mInput.style.boxShadow = "0 0 0 4px rgba(0, 119, 182, 0.08)"; mInput.style.background = "#ffffff"; });
                mInput.addEventListener("blur", () => { mInput.style.boxShadow = "none"; mInput.style.borderColor = "#e2e8f0"; mInput.style.background = "#f8fafc"; });
            }
        }, 10);
        const closeInputModal = () => { inputModal.classList.remove("active"); setTimeout(() => inputModal.remove(), 400); };
        inputModal.querySelector("#modal-input-cancel").addEventListener("click", closeInputModal);
        const submitAction = () => {
            const inp = document.getElementById("custom-modal-input");
            if (!inp) return;
            const val = inp.value.trim();
            if (val) { closeInputModal(); searchAndProcessLocation(val); }
            else { inp.style.borderColor = "#ef4444"; inp.classList.remove("shake-active"); void inp.offsetWidth; inp.classList.add("shake-active"); }
        };
        inputModal.querySelector("#modal-input-submit").addEventListener("click", submitAction);
        document.getElementById("custom-modal-input").addEventListener("keypress", (ev) => { if (ev.key === "Enter") submitAction(); });
    }

    document.body.addEventListener("click", (e) => {
        if (e.target.closest(".banner-btn") || e.target.closest(".floating-add-btn") || e.target.closest(".btn-announce")) {
            e.preventDefault();
            triggerMainModalFlow();
        }
    });

    if (!document.querySelector(".floating-add-btn")) {
        const mobileButton = document.createElement("button");
        mobileButton.className = "floating-add-btn";
        mobileButton.innerHTML = "+";
        document.body.appendChild(mobileButton);
    }

    // =========================================================
    // 7. MAP EXPAND
    // =========================================================
    const mapBtn = document.querySelector(".outline-btn");
    const mapContainer = document.getElementById("map");
    if (mapBtn && mapContainer) {
        mapContainer.style.transition = "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
        mapBtn.addEventListener("click", () => {
            const center = map.getCenter();
            if (mapContainer.style.height === "190px" || !mapContainer.style.height) {
                mapContainer.style.height = "380px"; mapBtn.innerText = "Xaritani kichraytirish";
            } else {
                mapContainer.style.height = "190px"; mapBtn.innerText = "Xaritani kengaytirish";
            }
            setTimeout(() => { map.invalidateSize({ animate: true }); map.panTo(center, { animate: true, duration: 0.3 }); }, 200);
        });
    }

    // =========================================================
    // 8. DYNAMIC DATA FROM SUPABASE
    // =========================================================
    function getUserId() {
        try {
            const token = localStorage.getItem('sb-doboqtivghcdcoowoxmh-auth-token');
            if (token) { const parsed = JSON.parse(token); return parsed?.user?.id || null; }
        } catch (e) { console.error(e); }
        return null;
    }

    async function loadDashboardDynamicData() {
        const userId = getUserId();
        if (!window.supabaseClient) return;

        let matchedAnnIds = [];
        let sentAnnIds = [];
        let cachedSentReqs = [];

        // Pre-fetch sent requests to show status on cards
        let sentStatusMap = {}; // { announcement_id: 'pending' | 'accepted' }
        if (userId) {
            try {
                const { data: sentReqs, error: sentErr } = await window.supabaseClient
                    .from('lunch_requests')
                    .select('*, lunch_announcements(*)')
                    .eq('sender_id', userId)
                    .in('status', ['pending', 'accepted']);
                if (!sentErr && sentReqs) {
                    cachedSentReqs = sentReqs.filter(r => r.status === 'pending');
                    sentAnnIds = sentReqs.map(r => r.announcement_id).filter(Boolean);
                    sentReqs.forEach(r => {
                        if (r.announcement_id) sentStatusMap[r.announcement_id] = r.status;
                    });
                }
            } catch (err) { console.error("Pre-fetch sent requests error:", err); }
        }

        // A0. Pending requests
        if (userId) {
            try {
                const { data: pendingRequests, error } = await window.supabaseClient
                    .from('lunch_requests').select('id').eq('receiver_id', userId).eq('status', 'pending');
                if (!error && pendingRequests) {
                    const bannerEl = document.getElementById("pending-requests-banner");
                    const countEl = document.getElementById("pending-requests-count");
                    if (pendingRequests.length > 0) {
                        if (countEl) countEl.textContent = `Sizga ${pendingRequests.length} ta yangi uchrashuv taklifi keldi.`;
                        if (bannerEl) bannerEl.style.display = "flex";
                    } else { if (bannerEl) bannerEl.style.display = "none"; }
                }
            } catch (err) { console.error("Pending requests load error:", err); }
        }

        // A. Profile & greeting
        if (userId) {
            try {
                const { data: profile, error } = await window.supabaseClient
                    .from('profiles').select('*').eq('id', userId).single();
                if (profile && !error) {
                    if (greetingNameEl) greetingNameEl.innerHTML = profile.full_name || localStorage.getItem("user_name") || "Foydalanuvchi";
                    const streakEl = document.querySelector(".streak");
                    if (streakEl) streakEl.textContent = `${profile.streak || 0} kun`;
                }
            } catch (err) { console.error("Profile load error:", err); }
        }

        // A2. Contribution grid
        const gridContainer = document.querySelector(".contribution-grid");
        const footerText = document.querySelector(".activity-footer");
        if (gridContainer && userId) {
            try {
                const { data: matches, error } = await window.supabaseClient
                    .from('lunch_requests').select('*, lunch_announcements(*)')
                    .eq('status', 'completed').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
                if (!error && matches) {
                    if (footerText) footerText.textContent = `Oxirgi uchrashuvlar bo'yicha jami: ${matches.length} ta tushlik matchi!`;
                    gridContainer.innerHTML = "";
                    const today = new Date();
                    for (let i = 20; i >= 0; i--) {
                        const d = new Date(); d.setDate(today.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        const dayMatches = matches.filter(m => {
                            const matchDate = m.lunch_announcements?.lunch_date || (m.created_at ? m.created_at.split('T')[0] : '');
                            return matchDate === dateStr;
                        }).length;
                        let level = 0;
                        if (dayMatches === 1) level = 1; else if (dayMatches === 2) level = 2; else if (dayMatches > 2) level = 3;
                        const span = document.createElement("span");
                        span.className = `cube level-${level}`;
                        span.title = `${dateStr}: ${dayMatches} ta uchrashuv`;
                        gridContainer.appendChild(span);
                    }
                }
            } catch (err) { console.error("Contribution grid error:", err); }
        }

        // B. Active matches
        if (userId) {
            try {
                const { data: reqData, error: reqError } = await window.supabaseClient
                    .from('lunch_requests').select('*')
                    .eq('status', 'accepted').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
                if (reqError) throw reqError;

                let activeRequests = [];
                if (reqData && reqData.length > 0) {
                    const annIds = [...new Set(reqData.map(r => r.announcement_id).filter(Boolean))];
                    const senderIds = [...new Set(reqData.map(r => r.sender_id).filter(Boolean))];
                    const receiverIds = [...new Set(reqData.map(r => r.receiver_id).filter(Boolean))];
                    const profileIds = [...new Set([...senderIds, ...receiverIds])];

                    const { data: annData } = await window.supabaseClient
                        .from('lunch_announcements').select('*').in('id', annIds);
                    const { data: profData } = await window.supabaseClient
                        .from('profiles').select('*').in('id', profileIds);

                    activeRequests = reqData.map(req => {
                        const ann = annData ? annData.find(a => a.id === req.announcement_id) : null;
                        const sender = profData ? profData.find(p => p.id === req.sender_id) : null;
                        const receiver = profData ? profData.find(p => p.id === req.receiver_id) : null;
                        return { ...req, lunch_announcements: ann, sender, receiver };
                    });
                    matchedAnnIds = activeRequests.map(r => r.announcement_id).filter(Boolean);
                }
                const activeMatchCard = document.querySelector(".active-match-card");
                const activeMatchSection = activeMatchCard ? activeMatchCard.closest(".section-container") : null;
                let validRequest = null;
                if (activeRequests && activeRequests.length > 0) {
                    for (const req of activeRequests) {
                        const ann = req.lunch_announcements;
                        const localDate = new Date(ann?.created_at || req.created_at);
                        const yyyy = localDate.getFullYear();
                        const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                        const dd = String(localDate.getDate()).padStart(2, '0');
                        const datePart = ann?.lunch_date || `${yyyy}-${mm}-${dd}`;
                        if (ann && isTimeExpired(ann.end_time, datePart)) {
                            window.supabaseClient.from('lunch_requests').update({ status: 'completed' }).eq('id', req.id).then(() => {});
                            window.supabaseClient.from('lunch_announcements').update({ status: 'completed' }).eq('id', ann.id).then(() => {});
                        } else { validRequest = req; break; }
                    }
                }
                if (validRequest && activeMatchCard) {
                    const req = validRequest;
                    const partner = req.sender.id === userId ? req.receiver : req.sender;
                    const ann = req.lunch_announcements || {};
                    const localDate = new Date(ann.created_at || req.created_at);
                    const yyyy = localDate.getFullYear();
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(localDate.getDate()).padStart(2, '0');
                    const datePart = ann.lunch_date || `${yyyy}-${mm}-${dd}`;

                    activeMatchCard.innerHTML = `
                        <div class="match-left">
                            <div class="match-avatars"><img src="${partner.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="Avatar"></div>
                            <div class="match-details">
                                <h4>${ann.location_name || 'Tushlik joyi'} (${partner.full_name})</h4>
                                <div class="tags">${(partner.interests || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                                <p class="distance">📍 ${ann.title || 'Tushlik uchrashuvi'}</p>
                            </div>
                        </div>
                        <div class="match-right">
                            <span class="time-text">${ann.start_time ? ann.start_time.substring(0, 5) : '12:00'} da boshlanadi</span>
                            <div class="match-actions">
                                <button class="chat-btn" onclick="window.openMatchChat(event, '${datePart}', '${ann.start_time || '12:00:00'}')">💬</button>
                                <button class="route-btn" onclick="window.location.href='xarita.html'">Yo'nalish</button>
                            </div>
                        </div>`;
                    if (activeMatchSection) activeMatchSection.style.display = "block";
                } else { if (activeMatchSection) activeMatchSection.style.display = "none"; }
            } catch (err) { console.error("Active match load error:", err); }
        }

        // C. Lunch announcements
        try {
            const { data: annData, error: annError } = await window.supabaseClient
                .from('lunch_announcements').select('*').eq('status', 'active')
                .order('created_at', { ascending: false }).limit(6);
            if (annError) throw annError;

            let announcements = [];
            if (annData && annData.length > 0) {
                const unmatchedAnnData = annData.filter(a => !matchedAnnIds.includes(a.id));
                if (unmatchedAnnData.length > 0) {
                    const userIds = [...new Set(unmatchedAnnData.map(a => a.user_id).filter(Boolean))];
                    const { data: profData } = await window.supabaseClient
                        .from('profiles').select('*').in('id', userIds);
                    
                    announcements = unmatchedAnnData.map(ann => {
                        const profile = profData ? profData.find(p => p.id === ann.user_id) : null;
                        return { ...ann, profiles: profile || {} };
                    });
                }
            }
            const gridEl = document.getElementById("lunch-cards-grid");
            const myGridEl = document.getElementById("my-lunch-cards-grid");
            const mySectionEl = document.getElementById("my-lunches-section");

            if (announcements && gridEl) {
                const validAnnouncements = [];
                for (const ann of announcements) {
                    const localDate = new Date(ann.created_at);
                    const yyyy = localDate.getFullYear();
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(localDate.getDate()).padStart(2, '0');
                    const datePart = ann.lunch_date || `${yyyy}-${mm}-${dd}`;
                    if (isTimeExpired(ann.end_time, datePart)) {
                        window.supabaseClient.from('lunch_announcements').update({ status: 'expired' }).eq('id', ann.id).then(() => {});
                    } else { validAnnouncements.push(ann); }
                }

                const myAnnouncements = validAnnouncements.filter(ann => ann.user_id === userId);
                const othersAnnouncements = validAnnouncements.filter(ann => ann.user_id !== userId);

                const renderCardHtml = (ann, requestStatus) => {
                    const prof = ann.profiles || {};
                    const isOwn = ann.user_id === userId;
                    let mood = 'Rasmiy', people = '1-on-1';
                    if (ann.description) {
                        ann.description.split(', ').forEach(part => {
                            if (part.includes('Muhit:')) mood = part.replace('Muhit:', '').trim();
                            if (part.includes('Uchrashuv shakli:')) people = part.replace('Uchrashuv shakli:', '').trim();
                        });
                    }
                    const hasCustomDesc = ann.description && !ann.description.toLowerCase().includes("muhit:");

                    // Determine button / status badge
                    let actionHtml = '';
                    if (isOwn) {
                        actionHtml = `<button class="btn-apply" style="cursor: default; pointer-events: none;">Mening e'lonim</button>`;
                    } else if (requestStatus === 'accepted') {
                        actionHtml = `<button class="btn-apply" style="cursor: default; pointer-events: none; background: linear-gradient(135deg, #10b981, #059669); color: #fff;"><i class="fa-solid fa-circle-check" style="margin-right:4px;"></i>Qabul qilindi</button>`;
                    } else if (requestStatus === 'pending') {
                        actionHtml = `<button class="btn-apply" style="cursor: default; pointer-events: none; background: #f59e0b; color: #fff;"><i class="fa-solid fa-clock" style="margin-right:4px;"></i>Kutilmoqda</button>`;
                    } else {
                        actionHtml = `<a href="xarita.html?focus_announcement=${ann.id}" class="btn-apply" style="text-decoration: none;">Qo'shilish</a>`;
                    }

                    return `
                    <div class="card ${isOwn ? '' : 'card-alt'}" style="position:relative;">
                        <div class="card-header">
                            <div class="user-profile-row">
                                <div class="avatar-wrapper">
                                    <img src="${prof.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'}" alt="Avatar" class="avatar">
                                    <div class="avatar-status"></div>
                                </div>
                                <div class="user-meta">
                                    <span class="card-title">${isOwn ? 'Siz' : (prof.full_name || 'Noma\'lum')}</span>
                                    <div class="rating">
                                        <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                                        </svg>
                                        <span class="rating-value">${prof.points ? Math.min(5.0, 4.0 + (prof.points / 500)).toFixed(1) : '4.8'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="card-menu" onclick="toggleCardOptions(event, '${ann.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                </svg>
                                <div class="options-dropdown" id="dropdown-${ann.id}">
                                    ${isOwn ? `<button onclick="editAnnouncement(event, '${ann.id}')">✏️ Tahrirlash</button><button class="delete-opt" onclick="deleteAnnouncement(event, '${ann.id}')">🗑️ O'chirish</button>` : `<button onclick="shareAnnouncement(event, '${ann.id}')">🔗 Ulashish</button><button onclick="reportAnnouncement(event, '${ann.id}')">⚠️ Shikoyat</button>`}
                                </div>
                            </div>
                        </div>

                        <div class="card-info">
                            <h3 class="info-title">${ann.title || 'Tushlik uchrashuvi'}</h3>
                            <div class="info-details-row">
                                <div class="info-item location-item">
                                    <svg class="location-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    <span class="truncate-text">${ann.location_name || 'IT Park - Blok A'}</span>
                                </div>
                                <div class="info-item time-item">
                                    <svg class="time-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>${ann.start_time ? ann.start_time.substring(0, 5) : '13:00'} - ${ann.end_time ? ann.end_time.substring(0, 5) : '14:30'}</span>
                                </div>
                            </div>
                            ${hasCustomDesc ? `<p class="card-desc">${ann.description}</p>` : ''}
                        </div>

                        <div class="card-footer">
                            <div class="tags">
                                <span class="tag tag-official">${mood.toUpperCase()}</span>
                                <span class="tag tag-private">${people.toUpperCase()}</span>
                            </div>
                            ${actionHtml}
                        </div>
                    </div>`;
                };

                if (othersAnnouncements.length > 0) {
                    gridEl.innerHTML = othersAnnouncements.map(ann => renderCardHtml(ann, sentStatusMap[ann.id] || null)).join('');
                } else {
                    gridEl.innerHTML = `<div class="lunch-empty-state">🍽️ Atrofda hozircha boshqa tushlik e'lonlari mavjud emas.</div>`;
                }

                if (myAnnouncements.length > 0) {
                    if (myGridEl) myGridEl.innerHTML = myAnnouncements.map(ann => renderCardHtml(ann, null)).join('');
                    if (mySectionEl) mySectionEl.style.display = "block";
                } else {
                    if (mySectionEl) mySectionEl.style.display = "none";
                }
            }
        } catch (err) { console.error("Announcements load error:", err); }

        // C2. Sent requests
        if (userId) {
            try {
                const sentSectionEl = document.getElementById("sent-requests-section");
                const sentGridEl = document.getElementById("sent-requests-grid");

                if (cachedSentReqs && cachedSentReqs.length > 0 && sentSectionEl && sentGridEl) {
                    const ownerIds = [...new Set(cachedSentReqs.map(r => r.lunch_announcements?.user_id).filter(Boolean))];
                    let ownerProfs = [];
                    if (ownerIds.length > 0) {
                        const { data: profData } = await window.supabaseClient
                            .from('profiles').select('*').in('id', ownerIds);
                        ownerProfs = profData || [];
                    }

                    const sentRequestsData = sentReqs.map(req => {
                        const ann = req.lunch_announcements || {};
                        const profile = ownerProfs.find(p => p.id === ann.user_id) || {};
                        return { ...ann, profiles: profile, request_id: req.id };
                    });

                    sentGridEl.innerHTML = sentRequestsData.map(ann => {
                        const prof = ann.profiles || {};
                        let mood = 'Rasmiy', people = '1-on-1';
                        if (ann.description) {
                            ann.description.split(', ').forEach(part => {
                                if (part.includes('Muhit:')) mood = part.replace('Muhit:', '').trim();
                                if (part.includes('Uchrashuv shakli:')) people = part.replace('Uchrashuv shakli:', '').trim();
                            });
                        }
                        const hasCustomDesc = ann.description && !ann.description.toLowerCase().includes("muhit:");
                        return `
                        <div class="card card-alt" style="position:relative;">
                            <div class="card-header">
                                <div class="user-profile-row">
                                    <div class="avatar-wrapper">
                                        <img src="${prof.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'}" alt="Avatar" class="avatar">
                                        <div class="avatar-status"></div>
                                    </div>
                                    <div class="user-meta">
                                        <span class="card-title">${prof.full_name || 'Noma\'lum'}</span>
                                        <div class="rating">
                                            <svg class="star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
                                            </svg>
                                            <span class="rating-value">${prof.points ? Math.min(5.0, 4.0 + (prof.points / 500)).toFixed(1) : '4.8'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-info">
                                <h3 class="info-title">${ann.title || 'Tushlik uchrashuvi'}</h3>
                                <div class="info-details-row">
                                    <div class="info-item location-item">
                                        <svg class="location-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        <span class="truncate-text">${ann.location_name || 'IT Park - Blok A'}</span>
                                    </div>
                                    <div class="info-item time-item">
                                        <svg class="time-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>${ann.start_time ? ann.start_time.substring(0, 5) : '13:00'} - ${ann.end_time ? ann.end_time.substring(0, 5) : '14:30'}</span>
                                    </div>
                                </div>
                                ${hasCustomDesc ? `<p class="card-desc">${ann.description}</p>` : ''}
                            </div>

                            <div class="card-footer">
                                <div class="tags">
                                    <span class="tag tag-official">${mood.toUpperCase()}</span>
                                    <span class="tag tag-private">${people.toUpperCase()}</span>
                                </div>
                                <button class="btn-apply" onclick="cancelSentRequest(event, '${ann.request_id}')" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);">Bekor qilish</button>
                            </div>
                        </div>`;
                    }).join('');
                    sentSectionEl.style.display = "block";
                } else {
                    if (sentSectionEl) sentSectionEl.style.display = "none";
                }
            } catch (err) { console.error("Sent requests load error:", err); }
        }

        // D. Leaders
        try {
            const { data: leaders, error } = await window.supabaseClient
                .from('profiles').select('*').order('points', { ascending: false }).limit(3);
            const leadersList = document.getElementById("leaders-list");
            if (leaders && leaders.length > 0 && leadersList) {
                leadersList.innerHTML = leaders.map((leader, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    return `
                    <li>
                        <span class="rank" style="background: ${index === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : index === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#cd7c5e,#a0522d)'}; color:#fff; font-weight:800; font-size:11px;">${medals[index] || (index + 1)}</span>
                        <div class="leader-avatar" style="width:34px; height:34px; flex-shrink:0;"><img src="${leader.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}" alt="" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                        <span class="leader-name-text">${leader.full_name || 'Noma\'lum'}</span>
                        <span class="leader-score">${leader.points || 0}</span>
                    </li>`;
                }).join('');

            }
        } catch (err) { console.error("Leaders load error:", err); }

        // E. Active users count
        try {
            const { count, error } = await window.supabaseClient
                .from('profiles').select('*', { count: 'exact', head: true });
            const countEl = document.getElementById("active-users-count");
            if (countEl && count !== null && !error) countEl.textContent = Math.max(5, count);
        } catch (err) {}
    }

    // Toast notification
    window.showCustomConfirm = (message, onConfirm) => {
        let modal = document.getElementById('custom-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'custom-confirm-modal';
            modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.4); backdrop-filter:blur(12px); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:0; pointer-events:none; transition:opacity 0.3s ease;`;
            modal.innerHTML = `
                <div class="custom-confirm-content" style="background:#fff; border-radius:22px; padding:32px; width:380px; box-shadow:0 25px 60px -12px rgba(15,23,42,0.2), 0 0 0 1px rgba(15,23,42,0.03); text-align:center; transform:scale(0.9); transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);">
                    <div style="width:56px; height:56px; border-radius:16px; background:rgba(239,68,68,0.08); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:24px;">🗑️</div>
                    <h3 style="margin:0 0 10px; font-family:'Poppins',sans-serif; color:#0f172a; font-size:18px; font-weight:800; letter-spacing:-0.3px;">E'lonni o'chirish</h3>
                    <p id="custom-confirm-text" style="margin:0 0 26px; font-family:'Inter',sans-serif; color:#64748b; font-size:14px; line-height:1.6;"></p>
                    <div style="display:flex; gap:12px; justify-content:center;">
                        <button id="custom-confirm-cancel" style="background:#f1f5f9; color:#64748b; border:none; padding:12px 24px; border-radius:14px; font-weight:700; cursor:pointer; font-size:13.5px; transition:all 0.2s; letter-spacing:-0.01em;">Yo'q, qolsin</button>
                        <button id="custom-confirm-ok" style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%); color:#fff; border:none; padding:12px 24px; border-radius:14px; font-weight:700; cursor:pointer; font-size:13.5px; box-shadow:0 4px 14px rgba(239,68,68,0.2); transition:all 0.2s; letter-spacing:-0.01em;">Ha, o'chirilsin</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            const style = document.createElement('style');
            style.innerHTML = `#custom-confirm-modal.active .custom-confirm-content { transform: scale(1) !important; }`;
            document.head.appendChild(style);
        }
        document.getElementById('custom-confirm-text').textContent = message;
        modal.classList.add('active'); modal.style.opacity = '1'; modal.style.pointerEvents = 'auto';
        const btnOk = document.getElementById('custom-confirm-ok');
        const btnCancel = document.getElementById('custom-confirm-cancel');
        const newBtnOk = btnOk.cloneNode(true);
        const newBtnCancel = btnCancel.cloneNode(true);
        btnOk.parentNode.replaceChild(newBtnOk, btnOk);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
        const closeModal = () => { modal.classList.remove('active'); modal.style.opacity = '0'; modal.style.pointerEvents = 'none'; };
        newBtnCancel.addEventListener('click', closeModal);
        newBtnOk.addEventListener('click', () => { closeModal(); onConfirm(); });
    };

    window.toggleCardOptions = (event, id) => {
        event.stopPropagation();
        const dropdown = document.getElementById(`dropdown-${id}`);
        const wasOpen = dropdown.classList.contains('show');
        document.querySelectorAll('.options-dropdown').forEach(d => d.classList.remove('show'));
        if (!wasOpen) dropdown.classList.add('show');
    };
    document.addEventListener('click', () => { document.querySelectorAll('.options-dropdown').forEach(d => d.classList.remove('show')); });

    window.editAnnouncement = (event, id) => { event.stopPropagation(); window.location.href = `tushlik.html?edit_id=${id}`; };
    window.deleteAnnouncement = (event, id) => {
        event.stopPropagation();
        window.showCustomConfirm("Haqiqatan ham ushbu tushlik e'lonini o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.",
            async () => {
                try {
                    const { error } = await window.supabaseClient.from('lunch_announcements').delete().eq('id', id);
                    if (error) throw error;
                    showToast("E'lon muvaffaqiyatli o'chirildi!", "success");
                    loadDashboardDynamicData();
                } catch (err) { console.error("Delete error:", err); showToast("E'lonni o'chirishda xatolik: " + err.message, "error"); }
            });
    };
    window.shareAnnouncement = (event, id) => { event.stopPropagation(); navigator.clipboard.writeText(window.location.origin + `/xarita.html?ann_id=${id}`); showToast("E'lon havolasi buferga nusxalandi!", "success"); };
    window.cancelSentRequest = (event, requestId) => {
        event.stopPropagation();
        window.showCustomConfirm("Haqiqatan ham yuborilgan taklifni bekor qilmoqchimisiz?",
            async () => {
                try {
                    const { error } = await window.supabaseClient
                        .from('lunch_requests')
                        .delete()
                        .eq('id', requestId);
                    if (error) throw error;
                    showToast("Taklif muvaffaqiyatli bekor qilindi!", "success");
                    loadDashboardDynamicData();
                } catch (err) {
                    console.error("Cancel request error:", err);
                    showToast("Taklifni bekor qilishda xatolik: " + err.message, "error");
                }
            });
    };
    window.reportAnnouncement = (event, id) => { event.stopPropagation(); showToast("E'lon yuzasidan shikoyat qabul qilindi. Moderatorlarimiz tez orada uni ko'rib chiqishadi.", "info"); };
    window.openMatchChat = (event, lunchDate, startTime) => {
        event.stopPropagation();
        const startDateTime = new Date(`${lunchDate}T${startTime}`);
        const now = new Date();
        const chatOpenTime = new Date(startDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
        
        if (now < chatOpenTime) {
            showToast("Xavfsizlik yuzasidan suhbatdan 2 soat oldin chat ochiladi", "warning");
        } else {
            window.location.href = 'chat.html';
        }
    };

    function showToast(message, type = 'success') {
        let container = document.getElementById('premium-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'premium-toast-container';
            container.style.cssText = `position:fixed; top:20px; right:20px; z-index:10000; display:flex; flex-direction:column; gap:12px; perspective:1000px; pointer-events:none;`;
            document.body.appendChild(container);
            if (!document.getElementById('premium-toast-styles')) {
                const style = document.createElement('style');
                style.id = 'premium-toast-styles';
                style.innerHTML = `
                    .premium-toast { background:rgba(255,255,255,0.75); backdrop-filter:blur(20px) saturate(180%); -webkit-backdrop-filter:blur(20px) saturate(180%); border:1px solid rgba(255,255,255,0.5); border-radius:16px; padding:16px 24px; font-family:'Poppins','Inter',sans-serif; font-weight:600; font-size:14px; color:#1e293b; box-shadow:0 20px 40px rgba(15,23,42,0.08),inset 0 1px 1px rgba(255,255,255,0.5); display:flex; align-items:center; gap:12px; min-width:320px; max-width:400px; pointer-events:auto; transform:translateX(120%) rotateY(-30deg) scale(0.9); opacity:0; transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1); }
                    .premium-toast.active { transform:translateX(0) rotateY(0) scale(1); opacity:1; }
                    .premium-toast.exit { transform:translateX(120%) scale(0.9); opacity:0; }
                    .premium-toast.success { border-left:4px solid #10b981; }
                    .premium-toast.error { border-left:4px solid #ef4444; }
                    .premium-toast.info { border-left:4px solid #0077b6; }
                    .premium-toast.warning { border-left:4px solid #f59e0b; }
                    .premium-toast-icon { font-size:20px; display:flex; align-items:center; justify-content:center; }
                `;
                document.head.appendChild(style);
            }
        }
        const toast = document.createElement('div');
        toast.className = `premium-toast ${type}`;
        const icons = { success: '✨', error: '🚨', info: '💡', warning: '⚠️' };
        toast.innerHTML = `<div class="premium-toast-icon">${icons[type] || '💡'}</div><div style="flex:1;">${message}</div>`;
        container.appendChild(toast);
        setTimeout(() => { toast.classList.add('active'); }, 50);
        setTimeout(() => { toast.classList.remove('active'); toast.classList.add('exit'); setTimeout(() => { toast.remove(); }, 500); }, 3500);
    }

    // Smooth scroll to leaders
    const reytingLink = document.querySelector('.side-navigation nav a.uchinchisi');
    if (reytingLink) {
        reytingLink.addEventListener('click', (e) => {
            e.preventDefault();
            const rightPanel = document.querySelector('.right-panel');
            const leadersCard = document.querySelector('.leaders-card');
            if (rightPanel && leadersCard) { rightPanel.scrollTo({ top: leadersCard.offsetTop - 20, behavior: 'smooth' }); }
        });
    }
    if (window.location.hash === '#leaders-list') {
        setTimeout(() => {
            const rightPanel = document.querySelector('.right-panel');
            const leadersCard = document.querySelector('.leaders-card');
            if (rightPanel && leadersCard) { rightPanel.scrollTo({ top: leadersCard.offsetTop - 20, behavior: 'smooth' }); }
        }, 800);
    }

    loadDashboardDynamicData();
});