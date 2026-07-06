/**
 * ==========================================================================
 * ARCHITECTURE CORE: Birgalikda ARCHITECTURE INFRASTRUCTURE ENGINE
 * DESIGN PATTERNS: OOP, PubSub Event Aggregator, State Machine, Fuzzy Search
 * ==========================================================================
 */

// GET USER UUID FROM SUPABASE STORAGE
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

// SUPABASE ULASH
const SUPABASE_URL = 'https://doboqtivghcdcoowoxmh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// 1. GLOBAL PUB-SUB EVENT BROKER
class EventBus {
    constructor() {
        this.events = {};
    }
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }
    emit(event, data) {
        if (this.events[event]) this.events[event].forEach(cb => cb(data));
    }
}
const appBus = new EventBus();

// 2. FUZZY SEARCH ALGORITHM (LEVENSHTEIN DISTANCE METHODOLOGY)
class FuzzySearchProcessor {
    static calculateDistance(str1, str2) {
        const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
        for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        return track[str2.length][str1.length];
    }

    static filterCollection(list, criteria) {
        if (!criteria) return list;
        const normalizedQuery = criteria.toLowerCase();

        return list.map(user => {
            let coreScore = 0;
            const operationalFields = [user.name, user.profession, ...user.interests];

            operationalFields.forEach(field => {
                const semanticTokens = field.toLowerCase().split(/\s+/);
                semanticTokens.forEach(token => {
                    if (token.includes(normalizedQuery)) {
                        coreScore = 100;
                    } else {
                        const distance = this.calculateDistance(normalizedQuery, token);
                        const logicSimilarity = 1 - distance / Math.max(normalizedQuery.length, token.length);
                        const targetWeight = logicSimilarity * 100;
                        if (targetWeight > coreScore) coreScore = targetWeight;
                    }
                });
            });
            return { user, matrixWeight: coreScore };
        }).filter(node => node.matrixWeight > 35)
            .sort((alpha, beta) => beta.matrixWeight - alpha.matrixWeight)
            .map(node => node.user);
    }
}

// 3. CENTRAL REDUX-LIKE DATA STORE
class DataCentralStore {
    #state = {
        users: [],
        filteredUsers: [],
        selectedUser: null,
        activeInterestsFilter: [],
        activeTimeFilter: null,
        activeDistanceFilter: "all",
        activeScoreRange: 50,
        recentSearches: ["Dizayn", "iOS", "Kofe"],
        currentAccount: {
            name: "Sardor Azimov",
            title: "Senior Product Manager • Google",
            bio: "IT sohasida 6 yillik tajriba. Tushlik vaqtida networking qilish va yangi startap g'oyalarni muhokama qilishni xush ko'raman.",
            interests: ["Product", "Startap", "Kofe", "Stol tennisi"],
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
        }
    };

    constructor() {
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    #publish() {
        this.subscribers.forEach(callback => callback({ ...this.#state }));
    }

    hydrateUsers(payload) {
        this.#state.users = payload;
        this.compileComplexPipeline();
    }

    updateQueryFilter(query) {
        if (query && !this.#state.recentSearches.includes(query)) {
            this.#state.recentSearches.unshift(query);
            if (this.#state.recentSearches.length > 5) this.#state.recentSearches.pop();
        }
        this.#state.filteredUsers = FuzzySearchProcessor.filterCollection(this.#state.users, query);
        this.#publish();
    }

    toggleInterestFilter(interest) {
        const locationIndex = this.#state.activeInterestsFilter.indexOf(interest);
        if (locationIndex > -1) {
            this.#state.activeInterestsFilter.splice(locationIndex, 1);
        } else {
            this.#state.activeInterestsFilter.push(interest);
        }
        this.compileComplexPipeline();
    }

    setInterestsFilter(interestsArray) {
        this.#state.activeInterestsFilter = interestsArray;
        this.compileComplexPipeline();
    }

    setTimeFilter(time) {
        this.#state.activeTimeFilter = time;
        this.compileComplexPipeline();
    }

    setAdvancedFilters(range, distance) {
        this.#state.activeScoreRange = parseInt(range);
        this.#state.activeDistanceFilter = distance;
        this.compileComplexPipeline();
    }

    clearFilters() {
        this.#state.activeInterestsFilter = [];
        this.#state.activeTimeFilter = null;
        this.#state.activeDistanceFilter = "all";
        this.#state.activeScoreRange = 50;
        this.compileComplexPipeline();
    }

    selectActiveUser(id) {
        this.#state.selectedUser = this.#state.users.find(u => u.id === id) || null;
        this.#publish();
    }

    async fetchInitialProfile() {
        const userId = getUserId();
        if (supabaseClient && userId) {
            const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', userId).single();
            if (data && !error) {
                this.#state.currentAccount = {
                    ...this.#state.currentAccount,
                    name: data.full_name || data.name || this.#state.currentAccount.name,
                    title: data.role || data.company || this.#state.currentAccount.title,
                    bio: data.bio || this.#state.currentAccount.bio,
                    interests: data.interests || this.#state.currentAccount.interests || [],
                    avatar: data.avatar_url || this.#state.currentAccount.avatar
                };
                this.#publish();
            } else if (error) {
                console.error("Supabase-dan ma'lumot olishda xatolik:", error.message);
            }
        }
    }

    async modifyAccountProfile(data) {
        this.#state.currentAccount = { ...this.#state.currentAccount, ...data };
        this.#publish();

        const userId = getUserId();
        if (supabaseClient && userId) {
            const { error } = await supabaseClient.from('profiles').upsert({
                id: userId,
                full_name: data.name,
                role: data.title,
                bio: data.bio,
                interests: data.interests
            }, { onConflict: 'id' });

            if (error) {
                console.error("Supabase saqlash xatosi:", error);
            } else {
                appBus.emit("alertNotification", { text: "Profil Supabase'ga saqlandi!", stateClass: "success" });
                localStorage.setItem('user_name', data.name);
                localStorage.setItem('user_role', data.title);
            }
        } else {
            appBus.emit("alertNotification", { text: "Profil sozlamalari tizimda yangilandi!", stateClass: "success" });
        }
    }

    compileComplexPipeline() {
        let ongoingCollection = [...this.#state.users];

        // Interest multi-tag query filter
        if (this.#state.activeInterestsFilter.length > 0) {
            ongoingCollection = ongoingCollection.filter(u =>
                this.#state.activeInterestsFilter.every(tag => u.interests.includes(tag))
            );
        }

        // Time slot filter pipeline
        if (this.#state.activeTimeFilter) {
            ongoingCollection = ongoingCollection.filter(u => u.time.includes(this.#state.activeTimeFilter));
        }

        // Score range logic
        ongoingCollection = ongoingCollection.filter(u => u.score >= this.#state.activeScoreRange);

        // Distance range parse logic
        if (this.#state.activeDistanceFilter !== "all") {
            const boundary = parseInt(this.#state.activeDistanceFilter);
            ongoingCollection = ongoingCollection.filter(u => {
                const metricValue = u.distance.includes("km") ? parseFloat(u.distance) * 1000 : parseInt(u.distance);
                return metricValue <= boundary;
            });
        }

        this.#state.filteredUsers = ongoingCollection;
        this.#publish();
    }
}
const centralStore = new AppCentralStoreInstance();

function AppCentralStoreInstance() {
    return new DataCentralStore();
}

// 4. MAIN INTERACTION CONTROLLER LAYER
class BirgalikdaSystemController {
    constructor() {
        this.cacheRegistry = new Map();
        this.grabState = { active: false, initialY: 0, currentTranslateY: 0 };
        this.mapMarkers = []; // Leaflet markers array
        this.userLocationMarker = null;

        // Initialize Live Map
        this.map = L.map('vectorMapCanvas', {
            zoomControl: false,
            fadeAnimation: true,
            zoomAnimation: true
        }).setView([41.311081, 69.279737], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.gatherElements();
        this.wireEventListeners();

        centralStore.subscribe(state => this.orchestrateRender(state));
        this.triggerDataIngestion();
        this.updateNotificationBadge();
    }

    isTimeExpired(endTimeStr, dateStr) {
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

    updateNotificationBadge() {
        const STORAGE_VERSION = 'v1.1';
        if (localStorage.getItem('notifications_version') !== STORAGE_VERSION || !localStorage.getItem('notifications')) {
            const defaultNotifications = [
                {
                    id: "n1",
                    type: "matches",
                    status: "unread",
                    timeSection: "bugun",
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
            localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
            localStorage.setItem('notifications_version', STORAGE_VERSION);
        }

        const notiBadge = document.getElementById("notiCountBadge");
        if (notiBadge) {
            const localNotifs = localStorage.getItem('notifications');
            if (localNotifs) {
                try {
                    const notifList = JSON.parse(localNotifs);
                    const unreadCount = notifList.filter(n => n.status === 'unread').length;
                    if (unreadCount > 0) {
                        notiBadge.textContent = unreadCount;
                        notiBadge.style.display = "";
                    } else {
                        notiBadge.style.display = "none";
                    }
                } catch(e) {
                    console.error(e);
                }
            }
        }
    }

    gatherElements() {
        this.dom = {
            viewportList: document.getElementById("usersListContainer"),
            mainSearchInput: document.getElementById("mainSearch"),
            searchClearBtn: document.getElementById("searchClearBtn"),
            suggestionsDropdown: document.getElementById("searchSuggestions"),
            recentSearchBox: document.getElementById("recentSearchesList"),
            counterBadge: document.getElementById("activeOffersCount"),
            userModal: document.getElementById("userDetailsModal"),
            userModalBody: document.getElementById("modalDynamicContent"),
            profileTrigger: document.getElementById("userProfileMenu"),
            profileDrawer: document.getElementById("profileSettingsDrawer"),
            profileForm: document.getElementById("profileUpdateForm"),
            closeProfileDrawer: document.getElementById("closeDrawerBtn"),
            filterTrigger: document.getElementById("filterToggleBtn"),
            filterDrawer: document.getElementById("advancedFilterDrawer"),
            closeFilterDrawer: document.getElementById("closeFilterDrawerBtn"),
            applyAdvancedBtn: document.getElementById("applyAdvancedFiltersBtn"),
            clearAdvancedBtn: document.getElementById("clearAllFiltersBtn"),
            rangeSlider: document.getElementById("filterMatchRange"),
            rangeDisplay: document.getElementById("rangeValueDisplay"),
            distanceSelect: document.getElementById("filterDistanceSelect"),
            interestsTrigger: document.getElementById("btnQiziqishlar"),
            interestsPanel: document.getElementById("interestsDropdownPanel"),
            interestsContainer: document.getElementById("interestsFilterList"),
            timeTrigger: document.getElementById("btnVaqt"),
            timePanel: document.getElementById("timeDropdownPanel"),
            dragBar: document.getElementById("dragHandleArea"),
            bottomSheet: document.getElementById("mainCardContainer"),
            mapCanvas: document.getElementById("vectorMapCanvas"),
            geoLocateBtn: document.getElementById("geoLocateBtn"),
            zoomInBtn: document.getElementById("zoomInBtn"),
            zoomOutBtn: document.getElementById("zoomOutBtn")
        };
    }

    wireEventListeners() {
        // Event delegation architecture for cards click flow
        this.dom.viewportList.addEventListener("click", (event) => {
            const cardInstance = event.target.closest(".user-match-card");
            const structuralActionBtn = event.target.closest(".btn-submit-action");
            if (structuralActionBtn && cardInstance) {
                event.stopPropagation();
                this.executeActionPipeline(structuralActionBtn);
            } else if (cardInstance) {
                centralStore.selectActiveUser(cardInstance.getAttribute("data-announcement-id"));
            }
        });

        // Smart input listener workflow
        this.dom.mainSearchInput.addEventListener("input", this.createDebounce((event) => {
            const query = event.target.value;
            if (query.length > 0) this.dom.searchClearBtn.classList.remove("hidden");
            else this.dom.searchClearBtn.classList.add("hidden");
            centralStore.updateQueryFilter(query);
        }, 250));

        this.dom.mainSearchInput.addEventListener("focus", () => this.dom.suggestionsDropdown.classList.remove("hidden"));
        this.dom.searchClearBtn.addEventListener("click", () => {
            this.dom.mainSearchInput.value = "";
            this.dom.searchClearBtn.classList.add("hidden");
            centralStore.updateQueryFilter("");
        });

        // Clicks outside dropdown layers closure
        document.addEventListener("click", (event) => {
            if (!event.target.closest(".search-container")) this.dom.suggestionsDropdown.classList.add("hidden");
            if (!event.target.closest("#btnQiziqishlar") && !event.target.closest("#interestsDropdownPanel")) this.dom.interestsPanel.classList.add("hidden");
            if (!event.target.closest("#btnVaqt") && !event.target.closest("#timeDropdownPanel")) this.dom.timePanel.classList.add("hidden");
        });

        // Dropdown toggle triggers
        this.dom.interestsTrigger.addEventListener("click", () => this.dom.interestsPanel.classList.toggle("hidden"));
        this.dom.timeTrigger.addEventListener("click", () => this.dom.timePanel.classList.toggle("hidden"));

        // Time selection grid items flow
        document.querySelectorAll(".time-slot-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                centralStore.setTimeFilter(e.target.getAttribute("data-time"));
            });
        });
        document.getElementById("resetTimeFilter").addEventListener("click", () => {
            document.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("active"));
            centralStore.setTimeFilter(null);
        });

        // Drawers triggers wiring
        this.dom.profileTrigger.addEventListener("click", () => this.dom.profileDrawer.classList.add("active"));
        this.dom.closeProfileDrawer.addEventListener("click", () => this.dom.profileDrawer.classList.remove("active"));
        this.dom.filterTrigger.addEventListener("click", () => this.dom.filterDrawer.classList.add("active"));
        this.dom.closeFilterDrawer.addEventListener("click", () => this.dom.filterDrawer.classList.remove("active"));

        this.dom.rangeSlider.addEventListener("input", (e) => this.dom.rangeDisplay.textContent = `${e.target.value}%`);

        this.dom.applyAdvancedBtn.addEventListener("click", () => {
            centralStore.setAdvancedFilters(this.dom.rangeSlider.value, this.dom.distanceSelect.value);
            this.dom.filterDrawer.classList.remove("active");
        });
        this.dom.clearAdvancedBtn.addEventListener("click", () => {
            centralStore.clearFilters();
            this.dom.rangeSlider.value = 50;
            this.dom.rangeDisplay.textContent = "50%";
            this.dom.distanceSelect.value = "all";
            this.dom.filterDrawer.classList.remove("active");
        });

        // View all offers trigger in bottom sheet
        const viewAllBtn = document.getElementById("viewAllOffersBtn");
        if (viewAllBtn) {
            viewAllBtn.addEventListener("click", () => {
                centralStore.clearFilters();
                this.dom.mainSearchInput.value = "";
                this.dom.searchClearBtn.classList.add("hidden");
                document.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("active"));
                this.dom.rangeSlider.value = 50;
                this.dom.rangeDisplay.textContent = "50%";
                this.dom.distanceSelect.value = "all";
                this.injectToastBanner("Barcha tushlik takliflari ko'rsatilmoqda", "success");
            });
        }

        // Profile Form execution
        this.dom.profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            centralStore.modifyAccountProfile({
                name: document.getElementById("profName").value,
                title: document.getElementById("profTitle").value,
                bio: document.getElementById("profBio").value,
                interests: document.getElementById("profInterests").value.split(",").map(i => i.trim())
            });
            this.dom.profileDrawer.classList.remove("active");
        });

        document.getElementById("closeModalBtn").addEventListener("click", () => centralStore.selectActiveUser(null));
        this.dom.userModal.addEventListener("click", (e) => { if (e.target === this.dom.userModal) centralStore.selectActiveUser(null); });

        // Map elements linking
        this.dom.mapCanvas.addEventListener("click", (e) => {
            const node = e.target.closest(".map-node");
            if (node) centralStore.selectActiveUser(node.getAttribute("data-target"));
        });

        // Map control buttons
        if (this.dom.zoomInBtn) {
            this.dom.zoomInBtn.addEventListener("click", () => this.map.zoomIn());
        }
        if (this.dom.zoomOutBtn) {
            this.dom.zoomOutBtn.addEventListener("click", () => this.map.zoomOut());
        }
        if (this.dom.geoLocateBtn) {
            this.dom.geoLocateBtn.addEventListener("click", () => this.locateUserPosition());
        }

        // Bottom sheet vertical drag mechanics
        this.dom.dragBar.addEventListener("mousedown", (e) => this.initDragPipeline(e));
        window.addEventListener("mousemove", (e) => this.processDragPipeline(e));
        window.addEventListener("mouseup", () => this.destroyDragPipeline());

        // Keyboard accessibility shortcuts engine
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { centralStore.selectActiveUser(null); this.dom.profileDrawer.classList.remove("active"); this.dom.filterDrawer.classList.remove("active"); }
            if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); this.dom.mainSearchInput.focus(); }
        });

        // Keyword suggestion tags clicks injection
        this.dom.suggestionsDropdown.addEventListener("click", (e) => {
            const tag = e.target.closest(".suggest-tag");
            if (tag) {
                const val = tag.getAttribute("data-keyword");
                this.dom.mainSearchInput.value = val;
                centralStore.updateQueryFilter(val);
                this.dom.suggestionsDropdown.classList.add("hidden");
                this.dom.searchClearBtn.classList.remove("hidden");
            }
        });

        // Qiziqishlar apply / clear handlers
        const applyInterestsBtn = document.getElementById("applyInterestsBtn");
        if (applyInterestsBtn) {
            applyInterestsBtn.addEventListener("click", () => {
                const checkedBoxes = this.dom.interestsContainer.querySelectorAll("input[type='checkbox']:checked");
                const selected = Array.from(checkedBoxes).map(box => box.closest(".dropdown-item-checkbox").getAttribute("data-interest"));
                centralStore.setInterestsFilter(selected);
                this.dom.interestsPanel.classList.add("hidden");
            });
        }

        const clearInterestsBtn = document.getElementById("clearInterestsBtn");
        if (clearInterestsBtn) {
            clearInterestsBtn.addEventListener("click", () => {
                const checkedBoxes = this.dom.interestsContainer.querySelectorAll("input[type='checkbox']");
                checkedBoxes.forEach(box => box.checked = false);
                centralStore.setInterestsFilter([]);
                this.dom.interestsPanel.classList.add("hidden");
            });
        }

        // Dynamic back button logic
        const backBtnLink = document.getElementById("backBtnLink");
        if (backBtnLink) {
            backBtnLink.addEventListener("click", (e) => {
                e.preventDefault();
                if (document.referrer && document.referrer.indexOf(window.location.host) !== -1 && document.referrer.indexOf("xarita.html") === -1) {
                    window.location.href = document.referrer;
                } else {
                    window.location.href = "Asosiy.html";
                }
            });
        }

        // Reconfigure Onboarding trigger
        const reconfigureBtn = document.getElementById('reconfigure-onboarding-btn');
        if (reconfigureBtn) {
            reconfigureBtn.addEventListener('click', () => {
                const userId = getUserId() || 'guest';
                localStorage.removeItem(`onboarding_completed_${userId}`);
                window.location.href = 'onboarding1.html';
            });
        }

        // URL parameters checking for settings
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('openSettings') === 'true') {
            setTimeout(() => {
                const profileTrigger = document.getElementById("userProfileMenu");
                if (profileTrigger) profileTrigger.click();
            }, 500);
        }

        // Communication alerts channel linking
        appBus.on("alertNotification", data => this.injectToastBanner(data.text, data.stateClass));

    }

    locateUserPosition() {
        if (!navigator.geolocation) {
            this.injectToastBanner("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi.", "warning");
            return;
        }

        if (this.dom.geoLocateBtn) {
            this.dom.geoLocateBtn.disabled = true;
            this.dom.geoLocateBtn.classList.add("is-loading");
        }

        const fallbackCenter = [41.311081, 69.279737];

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const isValidCoordinate = Number.isFinite(latitude) && Number.isFinite(longitude);
                const isInUzbekistan = latitude >= 37.1 && latitude <= 45.6 && longitude >= 56.1 && longitude <= 73.1;
                const isAccurateEnough = accuracy <= 2000;

                if (!isValidCoordinate || !isInUzbekistan || !isAccurateEnough) {
                    this.map.flyTo(fallbackCenter, 13, { animate: true, duration: 1.2 });
                    this.injectToastBanner("Joylashuv juda noaniq bo'lgani uchun Toshkent markazi ko'rsatilmoqda.", "warning");
                } else {
                    this.map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.2 });

                    if (this.userLocationMarker) {
                        this.map.removeLayer(this.userLocationMarker);
                    }

                    this.userLocationMarker = L.circleMarker([latitude, longitude], {
                        radius: 10,
                        color: '#0ea5e9',
                        fillColor: '#38bdf8',
                        fillOpacity: 0.28,
                        weight: 3
                    }).addTo(this.map);

                    this.injectToastBanner("Joylashuvingiz xaritada ko'rsatilmoqda.", "success");
                }

                if (this.dom.geoLocateBtn) {
                    this.dom.geoLocateBtn.disabled = false;
                    this.dom.geoLocateBtn.classList.remove("is-loading");
                }
            },
            (error) => {
                this.map.flyTo(fallbackCenter, 13, { animate: true, duration: 1.2 });
                let message = "Joylashuvingizni aniqlab bo'lmadi.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Joylashuv ruxsatini berganingizni tekshiring.";
                }
                this.injectToastBanner(message, "warning");

                if (this.dom.geoLocateBtn) {
                    this.dom.geoLocateBtn.disabled = false;
                    this.dom.geoLocateBtn.classList.remove("is-loading");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    createDebounce(logic, latency) {
        let activeTimer;
        return (...args) => {
            clearTimeout(activeTimer);
            activeTimer = setTimeout(() => logic.apply(this, args), latency);
        };
    }

    initDragPipeline(e) {
        this.grabState.active = true;
        this.grabState.initialY = e.clientY;
        this.dom.bottomSheet.style.transition = "none";
    }

    processDragPipeline(e) {
        if (!this.grabState.active) return;
        const deltaY = e.clientY - this.grabState.initialY;
        if (deltaY > 0) { // Limit upwards bounce out of window
            this.grabState.currentTranslateY = deltaY;
            this.dom.bottomSheet.style.transform = `translateY(${deltaY}px)`;
        }
    }

    destroyDragPipeline() {
        if (!this.grabState.active) return;
        this.grabState.active = false;
        this.dom.bottomSheet.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        if (this.grabState.currentTranslateY > 180) { // Dismiss collapse state simulation
            this.dom.bottomSheet.style.transform = "translateY(calc(76vh - 70px))";
        } else {
            this.dom.bottomSheet.style.transform = "translateY(0)";
        }
        this.grabState.currentTranslateY = 0;
    }

    async executeActionPipeline(element) {
        if (element.disabled) return;
        element.disabled = true;
        const initialLabel = element.innerHTML;
        element.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
        element.style.opacity = "0.6";

        const card = element.closest(".user-match-card");
        if (card) {
            const announcementId = card.getAttribute("data-announcement-id");
            const receiverId = card.getAttribute("data-receiver-id");
            const senderId = getUserId();

            if (supabaseClient && senderId && announcementId && receiverId && !receiverId.startsWith("00000000")) {
                try {
                    const { error } = await supabaseClient
                        .from('lunch_requests')
                        .insert({
                            announcement_id: announcementId,
                            sender_id: senderId,
                            receiver_id: receiverId,
                            status: 'pending'
                        });
                    if (error) {
                        console.error("Supabase insert request error:", error);
                        appBus.emit("alertNotification", { text: "Xatolik yuz berdi: " + error.message, stateClass: "error" });
                        element.disabled = false;
                        element.innerHTML = initialLabel;
                        element.style.opacity = "1";
                        return;
                    }
                } catch (err) {
                    console.error("Supabase insert request error:", err);
                }
            }
        }

        await new Promise(success => setTimeout(success, 1200));

        element.innerHTML = `Yuborilgan`;
        element.style.background = "#64748b";
        element.style.color = "#fff";
        element.style.cursor = "default";
        element.style.opacity = "0.8";
        element.disabled = true;
        appBus.emit("alertNotification", { text: "Tushlik uchrashuvi taklifi muvaffaqiyatli jo'natildi!", stateClass: "success" });
    }

    injectToastBanner(msg, type) {
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
            <div style="flex: 1;">${msg}</div>
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

    async triggerDataIngestion() {
        // Profilni Supabase'dan yuklash
        centralStore.fetchInitialProfile();

        if (supabaseClient) {
            try {
                // Fetch announcements joined with user profiles
                let { data: annData, error: annError } = await supabaseClient
                    .from('lunch_announcements')
                    .select('*')
                    .eq('status', 'active');
                if (annError) throw annError;

                let announcements = [];
                if (annData && annData.length > 0) {
                    const userIds = [...new Set(annData.map(a => a.user_id).filter(Boolean))];
                    const { data: profData } = await supabaseClient
                        .from('profiles').select('*').in('id', userIds);
                    
                    announcements = annData.map(ann => {
                        const profile = profData ? profData.find(p => p.id === ann.user_id) : null;
                        return { ...ann, profiles: profile || {} };
                    });
                }



                // Seed database disabled to show only real active announcements

                const currentUserId = getUserId();
                let sentAnnIds = [];
                if (currentUserId) {
                    try {
                        const { data: reqData } = await supabaseClient
                            .from('lunch_requests')
                            .select('announcement_id')
                            .eq('sender_id', currentUserId)
                            .eq('status', 'pending');
                        if (reqData) {
                            sentAnnIds = reqData.map(r => r.announcement_id).filter(Boolean);
                        }
                    } catch (err) {
                        console.error("Fetch sentAnnIds error:", err);
                    }
                }

                let filteredAnnouncements = (announcements || []).filter(ann => {
                    if (ann.user_id === currentUserId) return false;
                    const localDate = new Date(ann.created_at);
                    const yyyy = localDate.getFullYear();
                    const mm = String(localDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(localDate.getDate()).padStart(2, '0');
                    const datePart = ann.lunch_date || `${yyyy}-${mm}-${dd}`;
                    const isExpired = this.isTimeExpired(ann.end_time, datePart);
                    if (isExpired) {
                        supabaseClient
                            .from('lunch_announcements')
                            .update({ status: 'expired' })
                            .eq('id', ann.id)
                            .then(() => {});
                    }
                    return !isExpired;
                });

                // Fallback local mock data disabled to show only real announcements

                // Map data from database to local state model
                const mappedUsers = filteredAnnouncements.map(ann => {
                    const prof = ann.profiles || {};
                    const myInterests = JSON.parse(localStorage.getItem(`Birgalikda_fields_${getUserId()}`) || '[]');
                    const sharedCount = (prof.interests || []).filter(interest => myInterests.includes(interest)).length;
                    const matchScore = Math.min(65 + (sharedCount * 10), 99);

                    const centerLat = 41.311081;
                    const centerLng = 69.279737;
                    const topPos = Math.max(10, Math.min(90, 50 - (ann.latitude - centerLat) * 3500)) + "%";
                    const leftPos = Math.max(10, Math.min(90, 50 + (ann.longitude - centerLng) * 3500)) + "%";

                    return {
                        id: ann.id,
                        receiverId: ann.user_id,
                        name: prof.full_name || "Noma'lum",
                        profession: prof.role || "Talaba",
                        avatar: prof.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                        bio: ann.description || prof.bio || "Batafsil ma'lumot yo'q.",
                        interests: prof.interests || [],
                        score: matchScore,
                        distance: ann.location_name,
                        time: ann.start_time.substring(0, 5) + " da",
                        topPosition: topPos,
                        leftPosition: leftPos,
                        latitude: ann.latitude,
                        longitude: ann.longitude,
                        hasSentRequest: sentAnnIds.includes(ann.id)
                    };
                });

                centralStore.hydrateUsers(mappedUsers);

                // Auto focus announcement from URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const focusAnnId = urlParams.get('focus_announcement');
                if (focusAnnId) {
                    setTimeout(() => {
                        centralStore.selectActiveUser(focusAnnId);
                    }, 300);
                }

                const defaultInterests = [
                    "Frontend", "Backend", "Mobile Developer", "UI/UX Designer",
                    "Project Manager", "Data Science", "Marketing", "HR Specialist",
                    "DevOps", "QA Engineer", "Fintech", "Tajriba almashish",
                    "Karyera maslahatlari", "Startup & Biznes", "AI", "Kofe"
                ];
                const activeInterests = mappedUsers.flatMap(u => u.interests || []);
                const mappedInterests = [...new Set([...defaultInterests, ...activeInterests])];
                this.dom.interestsContainer.innerHTML = mappedInterests.map(interest => `
                    <div class="dropdown-item-checkbox" data-interest="${interest}">
                        <input type="checkbox" id="chk-${interest}">
                        <span>${interest}</span>
                    </div>
                `).join('');

                this.dom.interestsContainer.addEventListener("click", (e) => {
                    const item = e.target.closest(".dropdown-item-checkbox");
                    if (item) {
                        const targetBox = item.querySelector("input");
                        if (e.target !== targetBox) {
                            targetBox.checked = !targetBox.checked;
                        }
                    }
                });

            } catch (err) {
                console.error("Data ingestion error:", err);
            }
        }
    }

    orchestrateRender(state) {
        // Render collection lists elements counters update
        this.dom.counterBadge.textContent = state.filteredUsers.length;

        const viewAllBtn = document.getElementById("viewAllOffersBtn");
        if (viewAllBtn) {
            const spanEl = viewAllBtn.querySelector("span");
            if (spanEl) {
                spanEl.textContent = `Barcha ${state.filteredUsers.length} ta taklifni ko'rish`;
            }
        }

        if (state.filteredUsers.length === 0) {
            this.dom.viewportList.innerHTML = `<p class="text-gray-400 text-center py-12 text-sm">Siz qidirgan ma'lumotlar bo'yicha hech kim topilmadi.</p>`;
        } else {
            this.dom.viewportList.innerHTML = state.filteredUsers.map(user => `
                <div class="user-match-card" data-announcement-id="${user.id}" data-receiver-id="${user.receiverId || ''}">
                    <div class="card-left-section">
                        <div class="avatar-container">
                            <img src="${user.avatar}" alt="${user.name}" class="user-avatar-img">
                            <span class="status-indicator"></span>
                        </div>
                        <div class="user-meta-info">
                            <h4 class="user-full-name">${user.name}</h4>
                            <div class="meta-tags-row">
                                <span class="meta-tag"><i class="fa-solid fa-location-dot"></i> ${user.distance}</span>
                                <span class="meta-divider">•</span>
                                <span class="meta-tag"><i class="fa-regular fa-clock"></i> ${user.time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-right-section">
                        <div class="compatibility-score-block">
                            <span class="score-percentage">${user.score}%</span>
                            <span class="score-label">Moslik</span>
                        </div>
                        ${user.hasSentRequest ? 
                            `<button class="btn-submit-action" disabled style="background:#64748b; color:#fff; cursor:default; opacity:0.8;">Yuborilgan</button>` : 
                            `<button class="btn-submit-action">Yuborish</button>`
                        }
                    </div>
                </div>
            `).join('');
        }

        // Clear old markers from the Leaflet map
        this.mapMarkers.forEach(m => this.map.removeLayer(m));
        this.mapMarkers = [];

        // Render live interactive markers on Leaflet map
        state.filteredUsers.forEach(user => {
            if (user.latitude && user.longitude) {
                const userIcon = L.divIcon({
                    className: 'custom-map-marker',
                    html: `
                        <div class="marker-container" style="position:relative; width:38px; height:38px; background:#ffffff; border-radius:50%; box-shadow:0 8px 20px rgba(15,23,42,0.15); border:2.5px solid var(--primary-color); display:flex; justify-content:center; align-items:center; cursor:pointer;">
                            <img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />
                            <span style="position:absolute; bottom:-1px; right:-1px; width:9px; height:9px; background-color:#12b76a; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 0 1px rgba(18, 183, 106, 0.15); z-index:2;"></span>
                            <div style="position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:5px solid var(--primary-color);"></div>
                        </div>
                    `,
                    iconSize: [38, 38],
                    iconAnchor: [19, 38]
                });

                const marker = L.marker([user.latitude, user.longitude], { icon: userIcon }).addTo(this.map);

                // Show user details when their map marker is clicked
                marker.on('click', () => {
                    centralStore.selectActiveUser(user.id);
                });

                this.mapMarkers.push(marker);
            }
        });

        // Smoothly pan map to center on selected user's marker location
        if (state.selectedUser) {
            const targetUser = state.filteredUsers.find(u => u.id === state.selectedUser.id);
            if (targetUser && targetUser.latitude && targetUser.longitude) {
                this.map.flyTo([targetUser.latitude, targetUser.longitude], 15, { animate: true, duration: 1.2 });
            }
        }

        // Detail data components window overlay execution
        if (state.selectedUser) {
            const cacheKey = `u-modal-${state.selectedUser.id}`;
            if (!this.cacheRegistry.has(cacheKey)) {
                const u = state.selectedUser;
                const myInterests = state.currentAccount.interests || [];
                const shared = u.interests.filter(i => myInterests.includes(i));
                let matchText = "";
                if (shared.length > 0) {
                    matchText = `${u.score}% Moslik - Ikkalangiz ham "${shared[0]}" sohasiga qiziqasiz.`;
                } else if (u.interests.length > 0) {
                    matchText = `${u.score}% Moslik - Suhbatdosh "${u.interests[0]}" sohasiga qiziqadi.`;
                } else {
                    matchText = `${u.score}% Moslik - Ikkalangiz ham yangi networking aloqalariga qiziqasiz.`;
                }

                this.cacheRegistry.set(cacheKey, `
                    <img src="${u.avatar}" alt="${u.name}" class="modal-avatar-large">
                    <h3 class="modal-user-name" style="font-size:22px; font-weight:700;">${u.name}</h3>
                    <p style="color:var(--primary-color); font-weight:600; font-size:14px; margin-top:2px;">${u.profession}</p>
                    <p style="margin:18px 0; font-size:14.5px; color:var(--text-muted); line-height:1.6;">${u.bio}</p>
                    <div class="modal-interests-tags">
                        ${u.interests.map(t => `<span class="interest-tag"># ${t}</span>`).join('')}
                    </div>
                    <div style="background: rgba(0,90,135,0.04); padding:14px; border-radius:12px; font-size:13.5px; font-weight:600; color:var(--primary-color); text-align:left; border-left:4px solid var(--primary-color);">
                        <i class="fa-solid fa-wand-magic-sparkles" style="color:#f59e0b; margin-right:4px;"></i> 
                        ${matchText}
                    </div>
                `);
            }
            this.dom.userModalBody.innerHTML = this.cacheRegistry.get(cacheKey);
            this.dom.userModal.classList.add("active");
        } else {
            this.dom.userModal.classList.remove("active");
        }

        // Synchronize state current user profiles forms
        document.getElementById("headerUserAvatar").src = state.currentAccount.avatar;
        document.getElementById("drawerAvatarImg").src = state.currentAccount.avatar;
        document.getElementById("profName").value = state.currentAccount.name;
        document.getElementById("profTitle").value = state.currentAccount.title;
        document.getElementById("profBio").value = state.currentAccount.bio;
        document.getElementById("profInterests").value = state.currentAccount.interests.join(", ");

        // Recent search terms listing synchronizer injection
        this.dom.recentSearchBox.innerHTML = state.recentSearches.map(term => `
            <div class="recent-search-item" data-term="${term}">
                <span><i class="fa-solid fa-clock-rotate-left text-xs mr-2 text-gray-400"></i> ${term}</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-xs text-gray-300"></i>
            </div>
        `).join('');
    }
}

// Global Lifecycle Initialization entry point
document.addEventListener("DOMContentLoaded", () => {
    window.BirgalikdaAppInstance = new BirgalikdaSystemController();
});