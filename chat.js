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

    let activeConversationId = null;
    const myId = getUserId();

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

    // ===== DYNAMIC PARTNER DETAILS LOADING =====
    const matchData = localStorage.getItem('current_match');
    let partner = {
        id: "mock-partner",
        name: "Anvar Sultonov",
        role: "Senior Product Designer",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        interests: ["UI/UX", "FinTech", "Sayohat"],
        location: "Rayhon Milliy Taomlari",
        icebreaker: "Anvar UI dizayn bilan shug'ullanadi. Undan hozirgi kunda trenddagi dizayn tizimlari haqida so'rab ko'ring!"
    };

    if (matchData) {
        try {
            const parsed = JSON.parse(matchData);
            partner = { ...partner, ...parsed };
        } catch (e) {
            console.error("Error parsing current_match:", e);
        }
    }

    function renderPartnerUI() {
        const headerImg = document.querySelector('.chat-header .avatar');
        if (headerImg && partner.avatar) headerImg.src = partner.avatar;

        const headerName = document.querySelector('.chat-header .user-status h4');
        if (headerName) headerName.textContent = partner.name;

        const headerRole = document.querySelector('.chat-header .status-online span');
        if (headerRole) headerRole.textContent = partner.role || "Mutaxassis";

        const aiText = document.querySelector('.ai-suggestion .ai-text p');
        if (aiText) aiText.textContent = partner.icebreaker || `Suhbatlashish uchun uning sohasiga oid savollar berishingiz mumkin!`;

        const sideImg = document.querySelector('.right-panel .large-avatar');
        if (sideImg && partner.avatar) sideImg.src = partner.avatar;

        const sideName = document.querySelector('.right-panel .profile-card h3');
        if (sideName) sideName.textContent = partner.name;

        const sideRole = document.querySelector('.right-panel .profile-card p');
        if (sideRole) sideRole.textContent = partner.role || "Mutaxassis";

        const sidePlace = document.querySelector('.meeting-place .place-details h6');
        if (sidePlace) sidePlace.textContent = partner.location || "Rayhon Milliy Taomlari";

        const sideTags = document.querySelector('.right-panel .tags-container');
        if (sideTags && partner.interests) {
            sideTags.innerHTML = '';
            partner.interests.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                sideTags.appendChild(span);
            });
        }
    }

    // Render initially
    renderPartnerUI();

    // Fetch recent active database conversation if matchData is empty or mock
    async function loadRecentConversation() {
        if (!supabaseClient || !myId) {
            loadMockMessages();
            return;
        }

        try {
            const { data: convos, error: convoErr } = await supabaseClient
                .from('conversations')
                .select('*, user1:profiles!user1_id(*), user2:profiles!user2_id(*)')
                .or(`user1_id.eq.${myId},user2_id.eq.${myId}`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (!convoErr && convos && convos.length > 0) {
                const convo = convos[0];
                const isUser1 = convo.user1_id === myId;
                const dbPartner = isUser1 ? convo.user2 : convo.user1;
                
                if (dbPartner) {
                    partner = {
                        id: dbPartner.id,
                        requestId: convo.request_id,
                        name: dbPartner.full_name || dbPartner.name || "Foydalanuvchi",
                        role: dbPartner.role || "Mutaxassis",
                        avatar: dbPartner.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                        interests: dbPartner.interests || ["Networking"],
                        location: "Tushlik manzili",
                        icebreaker: `${dbPartner.full_name || dbPartner.name} bilan suhbatlashish uchun uning sohasiga oid savollar berishingiz mumkin!`
                    };
                    localStorage.setItem('current_match', JSON.stringify(partner));
                    renderPartnerUI();
                    loadChatMessages();
                    return;
                }
            }
        } catch (e) {
            console.error("Error loading recent conversation:", e);
        }
        
        loadMockMessages();
    }

    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    const chatMessages = document.getElementById("chatMessages");
    const replyButtons = document.querySelectorAll(".reply-btn");

    const renderedMessageIds = new Set();
    let pollInterval = null;

    // ===== POLLING FALLBACK FOR MESSAGE RETRIEVAL =====
    async function pollNewMessages() {
        if (!activeConversationId || !supabaseClient) return;
        try {
            const { data: msgs, error: msgsErr } = await supabaseClient
                .from('messages')
                .select('*')
                .eq('conversation_id', activeConversationId)
                .order('created_at', { ascending: true });

            if (!msgsErr && msgs) {
                msgs.forEach(msg => {
                    if (!renderedMessageIds.has(msg.id)) {
                        const side = msg.sender_id === myId ? 'outgoing' : 'incoming';
                        const time = new Date(msg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                        appendLocalMessage(msg.message_text, side, time, msg.id);
                    }
                });
            }
        } catch (e) {
            console.error("Polling error:", e);
        }
    }

    // ===== SUPABASE REALTIME MESSAGING LOADER =====
    async function loadChatMessages() {
        if (!supabaseClient || !myId || !partner.id || partner.id.startsWith("mock")) {
            // Render local mock messages in simulator mode
            loadMockMessages();
            return;
        }

        try {
            // 1. Fetch or Create Conversation Room (using a highly compatible query filtered in Javascript)
            const partnerId = partner.id;
            let { data: convos, error: convoErr } = await supabaseClient
                .from('conversations')
                .select('id, user1_id, user2_id')
                .or(`user1_id.eq.${myId},user2_id.eq.${myId}`);

            if (convoErr) {
                console.error("Conversation fetch error:", convoErr);
                return;
            }

            let convo = convos ? convos.find(c => 
                (c.user1_id === myId && c.user2_id === partnerId) || 
                (c.user1_id === partnerId && c.user2_id === myId)
            ) : null;

            if (!convo) {
                const { data: newConvo, error: createErr } = await supabaseClient
                    .from('conversations')
                    .insert({
                        request_id: partner.requestId && !partner.requestId.startsWith("mock") ? partner.requestId : null,
                        user1_id: myId,
                        user2_id: partnerId
                    })
                    .select('id, user1_id, user2_id')
                    .single();
                if (!createErr && newConvo) {
                    convo = newConvo;
                } else {
                    console.error("Conversation creation error:", createErr);
                    return;
                }
            }

            if (convo && convo.id) {
                activeConversationId = convo.id;

                // Fetch meeting timing validation details
                try {
                    const { data: convoDetails, error: detailsErr } = await supabaseClient
                        .from('conversations')
                        .select(`
                            id,
                            lunch_requests (
                                id,
                                lunch_announcements (
                                    lunch_date,
                                    start_time,
                                    end_time
                                )
                            )
                        `)
                        .eq('id', convo.id)
                        .single();

                    if (!detailsErr && convoDetails && convoDetails.lunch_requests) {
                        const ann = convoDetails.lunch_requests.lunch_announcements;
                        if (ann) {
                            const dateStr = ann.lunch_date;
                            const startTimeStr = ann.start_time;
                            const endTimeStr = ann.end_time;
                            
                            // Combine date and time strings (safe parse)
                            const startDateTime = new Date(`${dateStr}T${startTimeStr}`);
                            const endDateTime = new Date(`${dateStr}T${endTimeStr}`);
                            const now = new Date();
                            const chatOpenTime = new Date(startDateTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
                            
                            if (now < chatOpenTime) {
                                showChatNotAvailableYet(startDateTime);
                                return;
                            } else if (now > endDateTime) {
                                if (convoDetails.lunch_requests.status === 'accepted') {
                                    supabaseClient
                                        .from('lunch_requests')
                                        .update({ status: 'completed' })
                                        .eq('id', convoDetails.lunch_requests.id)
                                        .then(() => {});
                                    if (ann.id) {
                                        supabaseClient
                                            .from('lunch_announcements')
                                            .update({ status: 'completed' })
                                            .eq('id', ann.id)
                                            .then(() => {});
                                    }
                                }
                                showChatClosed();
                                return;
                            }
                            
                            // Set custom end time for the countdown timer
                            window.customMeetingEndTime = endDateTime.getTime();
                        }
                    }
                } catch (err) {
                    console.error("Meeting time validation failed:", err);
                }

                // 2. Fetch existing messages
                const { data: msgs, error: msgsErr } = await supabaseClient
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', activeConversationId)
                    .order('created_at', { ascending: true });

                if (!msgsErr && msgs) {
                    // Clear previous dynamic message rows
                    chatMessages.querySelectorAll('.msg-row').forEach(row => row.remove());
                    renderedMessageIds.clear();

                    msgs.forEach(msg => {
                        const side = msg.sender_id === myId ? 'outgoing' : 'incoming';
                        const time = new Date(msg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                        appendLocalMessage(msg.message_text, side, time, msg.id);
                    });
                }

                // 3. Subscribe to Real-Time Updates (Listening to all inserts and filtering client-side for max reliability)
                supabaseClient
                    .channel(`chat_${activeConversationId}`)
                    .on('postgres_changes', { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'messages'
                    }, payload => {
                        const newMsg = payload.new;
                        if (newMsg.conversation_id === activeConversationId && newMsg.sender_id !== myId) {
                            const time = new Date(newMsg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                            appendLocalMessage(newMsg.message_text, 'incoming', time, newMsg.id);
                        }
                    })
                    .subscribe();

                // 4. Start defensive polling fallback every 3 seconds
                if (pollInterval) clearInterval(pollInterval);
                pollInterval = setInterval(pollNewMessages, 3000);
            }
        } catch (e) {
            console.error("Supabase messaging load error:", e);
        }
    }

    function loadMockMessages() {
        if (chatMessages) {
            // Clear previous dynamic message rows
            chatMessages.querySelectorAll('.msg-row').forEach(row => row.remove());
            renderedMessageIds.clear();

            appendLocalMessage("Salom! Men yetib keldim, deraza yonidagi stolda o'tiribman.", 'incoming', '12:45', 'mock-msg-1');
            appendLocalMessage("Ajoyib! Men ham 2 daqiqada boraman. Qora rangli futboldaman.", 'outgoing', '12:46', 'mock-msg-2');
        }
    }

    function appendLocalMessage(text, side, timeStr = null, messageId = null) {
        if (!chatMessages) return;

        if (messageId) {
            if (renderedMessageIds.has(messageId)) return;
            renderedMessageIds.add(messageId);
        }

        const time = timeStr || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        const msgRow = document.createElement("div");
        msgRow.className = `msg-row ${side}`;

        if (side === 'incoming') {
            msgRow.innerHTML = `
                <img src="${partner.avatar}" alt="" class="avatar">
                <div>
                    <div class="msg-bubble">${text}</div>
                    <span class="msg-time">${time}</span>
                </div>
            `;
        } else {
            msgRow.innerHTML = `
                <div>
                    <div class="msg-bubble">${text}</div>
                    <span class="msg-time">${time} <i class="fa-solid fa-check-double" style="color:#e0f2fe; margin-left:2px;"></i></span>
                </div>
            `;
        }

        chatMessages.appendChild(msgRow);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleMessageSending() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Prevent mock replies when chatting with real partners
        if (partner && partner.id && !partner.id.startsWith("mock") && !activeConversationId) {
            showToast("Ulanish hosil qilinmagan. Sahifani qayta yangilang yoki tizimga qayta kiring.", "error");
            chatInput.value = '';
            loadChatMessages(); // Try to reconnect in the background
            return;
        }

        chatInput.value = '';

        if (supabaseClient && activeConversationId && !partner.id.startsWith("mock")) {
            const { data, error } = await supabaseClient
                .from('messages')
                .insert({
                    conversation_id: activeConversationId,
                    sender_id: myId,
                    message_text: text
                })
                .select('id')
                .single();

            if (error) {
                showToast("Xabar yuborishda xatolik: " + error.message, "error");
            } else if (data) {
                appendLocalMessage(text, 'outgoing', null, data.id);
            }
        } else {
            // Simulator Mode (Mock message flow for true mock users only)
            const mockMsgId = 'mock-msg-' + Date.now();
            appendLocalMessage(text, 'outgoing', null, mockMsgId);
            
            // Auto reply generator after delay
            setTimeout(() => {
                const replies = [
                    "Ajoyib g'oya! Bu borada fikringizga to'liq qo'shilaman.",
                    "Hozir buyurtma beraman, sizga nima olay?",
                    "Kofe ustida networking qilish judayam ajoyib tashabbus bo'ldi.",
                    "Tushunarli, kutaman."
                ];
                const reply = replies[Math.floor(Math.random() * replies.length)];
                appendLocalMessage(reply, 'incoming');
            }, 1500);
        }
    }

    // ===== Event Listeners =====
    if (sendBtn) {
        sendBtn.addEventListener("click", handleMessageSending);
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleMessageSending();
        });
    }

    replyButtons.forEach(button => {
        button.addEventListener("click", () => {
            chatInput.value = button.textContent;
            chatInput.focus();
        });
    });

    const sozlamalarLink = document.getElementById('sozlamalar-link');
    if (sozlamalarLink) {
        sozlamalarLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'Sozlamalar.html';
        });
    }

    const yordamLink = document.getElementById('yordam-link');
    if (yordamLink) {
        yordamLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'Yordam.html';
        });
    }

    const phoneBtn = document.getElementById('phone-btn');
    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => {
            // Check if call modal already exists
            if (document.getElementById('call-simulation-modal')) return;

            const modal = document.createElement('div');
            modal.id = 'call-simulation-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(15px);
                z-index: 20000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-family: 'Poppins', 'Inter', sans-serif;
            `;

            modal.innerHTML = `
                <div style="position:relative; width:120px; height:120px; margin-bottom:24px;">
                    <img src="${partner.avatar}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border: 4px solid #12b76a;" />
                    <div style="position:absolute; top:-5px; left:-5px; width:130px; height:130px; border-radius:50%; border:2px solid #12b76a; animation: pulseCall 1.5s infinite;"></div>
                </div>
                <h3 style="font-size:24px; font-weight:600; margin-bottom:8px; color:#ffffff;">${partner.name}</h3>
                <p style="font-size:16px; color:#94a3b8; margin-bottom:40px;" id="call-status">Qo'ng'iroq qilinmoqda...</p>
                <button id="end-call-btn" style="background:#ef4444; border:none; color:#ffffff; width:64px; height:64px; border-radius:50%; font-size:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 25px rgba(239,68,68,0.4); transition: transform 0.2s ease;">
                    <i class="fa-solid fa-phone-slash"></i>
                </button>
            `;

            document.body.appendChild(modal);

            // Ringing phase 1
            const statusLabel = document.getElementById('call-status');
            const endBtn = document.getElementById('end-call-btn');

            let timeout1 = setTimeout(() => {
                if (statusLabel) statusLabel.textContent = 'Ulanmoqda...';
            }, 3000);

            let timeout2 = setTimeout(() => {
                if (statusLabel) statusLabel.textContent = 'Suhbatdosh band. Iltimos keyinroq qayta urining...';
            }, 5500);

            let timeout3 = setTimeout(() => {
                modal.remove();
            }, 8500);

            const closeCall = () => {
                clearTimeout(timeout1);
                clearTimeout(timeout2);
                clearTimeout(timeout3);
                modal.remove();
                showToast("Qo'ng'iroq bekor qilindi.", 'info');
            };

            if (endBtn) {
                endBtn.addEventListener('click', closeCall);
            }
        });
    }

    // Toggle Dropdown Menu
    const moreOptionsBtn = document.getElementById('more-options-btn');
    const optionsDropdown = document.getElementById('chat-more-dropdown');

    if (moreOptionsBtn && optionsDropdown) {
        moreOptionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (optionsDropdown.style.display === 'flex') {
                optionsDropdown.style.display = 'none';
            } else {
                optionsDropdown.style.display = 'flex';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            optionsDropdown.style.display = 'none';
        });

        // "Joylashuvni ko'rish" click handler
        const optLocation = document.getElementById('opt-location');
        if (optLocation) {
            optLocation.addEventListener('click', (e) => {
                e.preventDefault();
                optionsDropdown.style.display = 'none';
                const locBox = document.getElementById('info-location-box');
                if (locBox) {
                    locBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight flash effect
                    const meetPlace = locBox.querySelector('.meeting-place');
                    if (meetPlace) {
                        meetPlace.style.border = '2px solid #005a87';
                        meetPlace.style.boxShadow = '0 0 15px rgba(0, 90, 135, 0.4)';
                        setTimeout(() => {
                            meetPlace.style.border = '';
                            meetPlace.style.boxShadow = '';
                        }, 2500);
                    }
                }
            });
        }

        // "Chatni yakunlash" click handler
        const optFinish = document.getElementById('opt-finish');
        if (optFinish) {
            optFinish.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(`meeting_end_time_${partner.id}`);
                window.location.href = 'baholash.html';
            });
        }
    }

    const attachBtn = document.querySelector('.attach-btn');
    if (attachBtn) {
        attachBtn.addEventListener('click', () => {
            showToast('Fayl yuklash funksiyasi tez kunda!', 'info');
        });
    }

    const emojiBtn = document.getElementById('emoji-btn');
    if (emojiBtn) {
        emojiBtn.addEventListener('click', () => {
            showToast('Emoji tanlash paneli tez kunda!', 'info');
        });
    }

    // ===== Ortga hisob taymeri (Countdown) va Footer Notice Sync with Persistence =====
    const timerDisplay = document.getElementById('timer-display');
    const footerNotice = document.querySelector('.footer-notice');
    if (timerDisplay) {
        const STORAGE_KEY = `meeting_end_time_${partner.id}`;
        let endTime = localStorage.getItem(STORAGE_KEY);

        if (!endTime) {
            // Set end time to 1 hour, 24 minutes, 30 seconds from now
            const durationMs = (1 * 3600 + 24 * 60 + 30) * 1000;
            endTime = Date.now() + durationMs;
            localStorage.setItem(STORAGE_KEY, endTime);
        } else {
            endTime = parseInt(endTime);
        }

        const updateTimer = () => {
            const now = Date.now();
            let totalSeconds = Math.floor((endTime - now) / 1000);

            if (totalSeconds <= 0) {
                totalSeconds = 0;
                clearInterval(timerInterval);
                localStorage.removeItem(STORAGE_KEY);
                timerDisplay.textContent = '00:00:00';
                if (footerNotice) {
                    footerNotice.innerHTML = `<i class="fa-regular fa-clock"></i> Chat yopildi.`;
                }
                showToast('Uchrashuv vaqti yakunlandi!', 'warning');
                setTimeout(() => {
                    window.location.href = 'baholash.html';
                }, 2000);
            } else {
                const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
                const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                const s = (totalSeconds % 60).toString().padStart(2, '0');
                const formattedTime = `${h}:${m}:${s}`;
                timerDisplay.textContent = formattedTime;
                if (footerNotice) {
                    footerNotice.innerHTML = `<i class="fa-regular fa-clock"></i> Chat ${formattedTime} dan so'ng yopiladi va barcha xabarlar o'chiriladi.`;
                }
            }
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    // cancel / finish meeting
    const cancelBtn = document.getElementById("cancel-meeting-btn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (confirm("Uchrashuvni bekor qilishni xohlaysizmi?")) {
                localStorage.removeItem(`meeting_end_time_${partner.id}`);
                window.location.href = 'xarita.html';
            }
        });
    }

    const finishBtn = document.getElementById("finish-meeting-btn");
    if (finishBtn) {
        finishBtn.addEventListener("click", () => {
            localStorage.removeItem(`meeting_end_time_${partner.id}`);
            window.location.href = 'baholash.html';
        });
    }

    // ===== BLOCKED CHAT SCREENS RENDERERS =====
    function showChatNotAvailableYet(startDateTime) {
        const timeStr = startDateTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        const dateStr = startDateTime.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });
        
        const chatMessages = document.getElementById("chatMessages");
        const chatFooter = document.querySelector(".chat-footer");
        
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:40px; font-family:'Inter',sans-serif; color:var(--text-dark);">
                    <div style="width:80px; height:80px; border-radius:50%; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:36px; margin-bottom:24px; box-shadow:0 8px 20px rgba(59,130,246,0.15);">
                        <i class="fa-regular fa-clock"></i>
                    </div>
                    <h3 style="font-size:20px; font-weight:700; margin-bottom:12px;">Muloqot hali faollashmagan</h3>
                    <p style="font-size:14px; color:var(--text-muted); max-width:300px; line-height:1.6; margin-bottom:24px;">
                        Uchrashuv suhbati uchrashuv boshlanishidan 2 soat oldin ochiladi.<br>
                        <strong>Kutilayotgan vaqt:</strong> ${dateStr}, soat ${timeStr} da.
                    </p>
                    <button onclick="window.location.href='Asosiy.html'" style="background:var(--primary-color); border:none; color:#fff; padding:12px 24px; border-radius:12px; font-weight:600; cursor:pointer; font-size:13.5px; box-shadow:0 4px 12px rgba(0,90,135,0.2);">Asosiy sahifaga qaytish</button>
                </div>
            `;
        }
        if (chatFooter) {
            chatFooter.style.display = 'none';
        }
    }

    function showChatClosed() {
        const chatMessages = document.getElementById("chatMessages");
        const chatFooter = document.querySelector(".chat-footer");
        
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:40px; font-family:'Inter',sans-serif; color:var(--text-dark);">
                    <div style="width:80px; height:80px; border-radius:50%; background:#fef2f2; color:#ef4444; display:flex; align-items:center; justify-content:center; font-size:36px; margin-bottom:24px; box-shadow:0 8px 20px rgba(239,68,68,0.15);">
                        <i class="fa-solid fa-lock"></i>
                    </div>
                    <h3 style="font-size:20px; font-weight:700; margin-bottom:12px;">Uchrashuv yakunlangan</h3>
                    <p style="font-size:14px; color:var(--text-muted); max-width:300px; line-height:1.6; margin-bottom:24px;">
                        Uchrashuv vaqti yakunlanganligi sababli ushbu muloqot xonasi yopilgan va xabarlar o'chirilgan.
                    </p>
                    <button onclick="window.location.href='baholash.html'" style="background:#16a34a; border:none; color:#fff; padding:12px 24px; border-radius:12px; font-weight:600; cursor:pointer; font-size:13.5px; box-shadow:0 4px 12px rgba(22,163,74,0.2);">Baholash sahifasiga o'tish</button>
                </div>
            `;
        }
        if (chatFooter) {
            chatFooter.style.display = 'none';
        }
    }

    // Ingest and load active chat messages
    if (!matchData || partner.id === "mock-partner") {
        loadRecentConversation();
    } else {
        loadChatMessages();
    }
});
