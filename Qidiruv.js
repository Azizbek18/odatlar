/**
 * Birgalikda - Professional Search Engine & Interactive Content
 * Supabase Integration - 2026
 */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ============================================================
    // Supabase Ulash
    // ============================================================
    const SUPABASE_URL = 'https://doboqtivghcdcoowoxmh.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
    const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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

    // ============================================================
    // DOM Elements Cache
    // ============================================================
    const globalSearchInput = document.getElementById("global-search");
    const searchKeywordDisplay = document.getElementById("search-keyword-display");
    const searchSubmit = document.querySelector(".search-submit");
    const tabLinks = document.querySelectorAll(".results-tabs .tab-link");
    const resultsCountLabel = document.getElementById("results-count");
    const sortBtn = document.getElementById("sort-btn");
    const sortMenu = document.getElementById("sort-menu");
    const sortOptions = document.querySelectorAll(".sort-option");
    const viewBtns = document.querySelectorAll(".view-btn");
    const resultsContent = document.querySelector(".results-content");
    const noResults = document.getElementById("no-results");
    const noResultsQuery = document.getElementById("no-results-query");
    const clearSearchBtn = document.getElementById("clear-search");
    const skeletonWrapper = document.getElementById("skeleton-wrapper");
    const sectionsWrapper = document.getElementById("sections-wrapper");
    const toastContainer = document.getElementById("toast-container");

    // Filter DOM
    const filterForm = document.getElementById("filter-form");
    const filterDepartment = document.getElementById("filter-department");
    const timeButtons = document.querySelectorAll(".time-btn-group .time-btn");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const activeFiltersContainer = document.getElementById("active-filters");
    const sliderThumb = document.getElementById("slider-thumb");
    const sliderTrack = document.getElementById("slider-track");
    const ratingValue = document.getElementById("rating-value");

    // State
    let allData = {
        announcements: [],
        profiles: [],
        sentAnnIds: []
    };
    let currentSearchQuery = "";
    let activeTab = "all";
    let currentSort = "relevance";
    let currentView = "grid";

    // Filter State
    let filters = {
        department: "all",
        time: "bugun",
        minRating: 3.0,
        maxDistance: 500,
        experience: []
    };

    // ============================================================
    // Toast Notifications
    // ============================================================
    function showToast(message, type = "info", duration = 3000) {
        if (!toastContainer) return;
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const icons = {
            success: "fa-circle-check",
            error: "fa-circle-xmark",
            info: "fa-circle-info"
        };

        toast.innerHTML = `<i class="fa-solid ${icons[type] || 'fa-circle-info'}"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-out");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ============================================================
    // Loading State
    // ============================================================
    function showLoading() {
        if (sectionsWrapper) sectionsWrapper.style.display = "none";
        if (noResults) noResults.style.display = "none";
        if (skeletonWrapper) skeletonWrapper.style.display = "block";
    }

    function hideLoading() {
        if (skeletonWrapper) skeletonWrapper.style.display = "none";
        if (sectionsWrapper) sectionsWrapper.style.display = "flex";
    }

    // ============================================================
    // Load Data
    // ============================================================
    async function loadData() {
        if (!supabaseClient) {
            console.error("Supabase client is not available");
            return;
        }
        showLoading();
        try {
            // Load active announcements with profiles
            const { data: annData, error: annError } = await supabaseClient
                .from('lunch_announcements')
                .select('*, profiles(*)')
                .eq('status', 'active');
            if (annError) throw annError;

            // Filter out current user's own announcements
            const currentUserId = getUserId();
            const filteredAnnouncements = (annData || []).filter(ann => ann.user_id !== currentUserId);

            allData.announcements = filteredAnnouncements;

            // Extract unique profiles from those announcements
            const uniqueProfiles = [];
            const profileIds = new Set();
            for (const ann of filteredAnnouncements) {
                const prof = ann.profiles;
                if (prof && !profileIds.has(prof.id)) {
                    profileIds.add(prof.id);
                    uniqueProfiles.push({
                        ...prof,
                        active_announcement: ann
                    });
                }
            }
            allData.profiles = uniqueProfiles;

            // Query already sent requests to disable buttons
            let sentAnnIds = [];
            if (currentUserId) {
                const { data: reqs } = await supabaseClient
                    .from('lunch_requests')
                    .select('announcement_id')
                    .eq('sender_id', currentUserId)
                    .eq('status', 'pending');
                if (reqs) {
                    sentAnnIds = reqs.map(r => r.announcement_id).filter(Boolean);
                }
            }
            allData.sentAnnIds = sentAnnIds;

            // Render based on search query in URL
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            if (globalSearchInput) globalSearchInput.value = query;
            if (searchKeywordDisplay) searchKeywordDisplay.textContent = query ? query : "Barchasi";
            currentSearchQuery = query;

            executeSearch();

        } catch (err) {
            console.error("Error loading data from Supabase:", err);
            hideLoading();
            showToast("Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
        }
    }

    // ============================================================
    // Execute Search
    // ============================================================
    function executeSearch() {
        showLoading();
        const normalizedQuery = currentSearchQuery.toLowerCase().trim();

        // ---- Determine date boundaries for the time filter ----
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);

        let timeStartDate = null;
        let timeEndDate = null;
        if (filters.time === 'bugun') {
            timeStartDate = todayStr;
            timeEndDate = todayStr;
        } else if (filters.time === 'ertaga') {
            timeStartDate = tomorrowStr;
            timeEndDate = tomorrowStr;
        } else if (filters.time === 'hafta') {
            timeStartDate = todayStr;
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() + 7);
            timeEndDate = weekEnd.toISOString().slice(0, 10);
        } else if (filters.time === 'oy') {
            timeStartDate = todayStr;
            const monthEnd = new Date(now);
            monthEnd.setDate(monthEnd.getDate() + 30);
            timeEndDate = monthEnd.toISOString().slice(0, 10);
        }

        // ---- Helper: check time filter on an announcement ----
        function passesTimeFilter(ann) {
            if (!timeStartDate || !timeEndDate) return true;
            const annDate = ann.date || todayStr;
            return annDate >= timeStartDate && annDate <= timeEndDate;
        }

        // ---- Helper: map role to experience level ----
        function getExperienceLevel(role) {
            if (!role) return 'junior';
            const r = role.toLowerCase();
            if (r.includes('senior') || r.includes('head') || r.includes('lead') || r.includes('director') || r.includes('cto') || r.includes('ceo')) return 'senior';
            if (r.includes('middle') || r.includes('mid') || r.includes('manager')) return 'mid';
            return 'junior';
        }

        // ---- Helper: check department filter ----
        function passesDeptFilter(prof) {
            if (filters.department === 'all') return true;
            const role = (prof.role || '').toLowerCase();
            const interests = (prof.interests || []).map(i => i.toLowerCase());
            const dept = filters.department;
            if (dept === 'it') return role.includes('developer') || role.includes('engineer') || role.includes('devops') || role.includes('programmer') || role.includes('data') || role.includes('it') || interests.some(i => ['python', 'javascript', 'react', 'node', 'java', 'flutter', 'ai', 'ml', 'backend', 'frontend', 'fullstack', 'devops', 'cloud'].includes(i.toLowerCase()));
            if (dept === 'marketing') return role.includes('marketing') || role.includes('seo') || role.includes('smm') || role.includes('content') || interests.some(i => ['marketing', 'seo', 'smm', 'content', 'b2b'].includes(i.toLowerCase()));
            if (dept === 'hr') return role.includes('hr') || role.includes('recruit') || role.includes('human') || interests.some(i => ['hr', 'recruiting', 'coaching'].includes(i.toLowerCase()));
            if (dept === 'design') return role.includes('design') || role.includes('ui') || role.includes('ux') || interests.some(i => ['design', 'ui', 'ux', 'figma', 'graphic'].includes(i.toLowerCase()));
            if (dept === 'finance') return role.includes('financ') || role.includes('moliya') || role.includes('accountant') || role.includes('audit') || interests.some(i => ['finance', 'moliya', 'accounting', 'fintech'].includes(i.toLowerCase()));
            return true;
        }

        // ---- Helper: check experience filter ----
        function passesExpFilter(prof) {
            if (filters.experience.length === 0) return true;
            const level = getExperienceLevel(prof.role);
            return filters.experience.includes(level);
        }

        // ---- Helper: check rating filter ----
        function passesRatingFilter(prof) {
            return (prof.points || 0) >= filters.minRating;
        }

        // 1. Filter Profiles
        let matchedProfiles = allData.profiles.filter(prof => {
            // Text search
            if (normalizedQuery) {
                const matchesText = (prof.full_name || '').toLowerCase().includes(normalizedQuery) ||
                    (prof.role || '').toLowerCase().includes(normalizedQuery) ||
                    (prof.interests || []).some(interest => interest.toLowerCase().includes(normalizedQuery));
                if (!matchesText) return false;
            }
            // Department
            if (!passesDeptFilter(prof)) return false;
            // Experience
            if (!passesExpFilter(prof)) return false;
            // Rating
            if (!passesRatingFilter(prof)) return false;
            // Time (from the announcement)
            if (prof.active_announcement && !passesTimeFilter(prof.active_announcement)) return false;
            return true;
        });

        // 2. Filter Joylar (places/announcements)
        let matchedAnnouncements = allData.announcements.filter(ann => {
            // Text search
            if (normalizedQuery) {
                const matchesText = (ann.title || '').toLowerCase().includes(normalizedQuery) ||
                    (ann.location_name || '').toLowerCase().includes(normalizedQuery) ||
                    (ann.description || '').toLowerCase().includes(normalizedQuery);
                if (!matchesText) return false;
            }
            // Time
            if (!passesTimeFilter(ann)) return false;
            // Department (via profile)
            if (ann.profiles && !passesDeptFilter(ann.profiles)) return false;
            // Rating (via profile)
            if (ann.profiles && !passesRatingFilter(ann.profiles)) return false;
            return true;
        });

        // Apply Sorting
        matchedProfiles = performSort(matchedProfiles, "profile");
        matchedAnnouncements = performSort(matchedAnnouncements, "announcement");

        // 3. Extract unique interests (qiziqishlar) from matched profiles
        const matchedInterests = [];
        const interestCounts = {};
        for (const prof of matchedProfiles) {
            for (const interest of (prof.interests || [])) {
                interestCounts[interest] = (interestCounts[interest] || 0) + 1;
            }
        }
        for (const [interest, count] of Object.entries(interestCounts)) {
            if (!normalizedQuery || interest.toLowerCase().includes(normalizedQuery)) {
                matchedInterests.push({ name: interest, count });
            }
        }

        // Render sections
        renderProfiles(matchedProfiles);
        renderAnnouncements(matchedAnnouncements);
        renderInterests(matchedInterests);

        // Update counts
        const totalResults = matchedProfiles.length + matchedAnnouncements.length + matchedInterests.length;
        if (resultsCountLabel) resultsCountLabel.textContent = totalResults;

        // Update tab counts
        const tabAll = document.querySelector('[data-tab="all"] .tab-count');
        const tabPeople = document.querySelector('[data-tab="people"] .tab-count');
        const tabPlaces = document.querySelector('[data-tab="places"] .tab-count');
        const tabInterests = document.querySelector('[data-tab="interests"] .tab-count');

        if (tabAll) tabAll.textContent = totalResults;
        if (tabPeople) tabPeople.textContent = matchedProfiles.length;
        if (tabPlaces) tabPlaces.textContent = matchedAnnouncements.length;
        if (tabInterests) tabInterests.textContent = matchedInterests.length;

        // Show/hide sections based on Active Tab
        const peopleSection = document.querySelector('[data-section="people"]');
        const placesSection = document.querySelector('[data-section="places"]');
        const interestsSection = document.querySelector('[data-section="interests"]');

        if (activeTab === "all") {
            if (peopleSection) peopleSection.style.display = matchedProfiles.length > 0 ? "block" : "none";
            if (placesSection) placesSection.style.display = matchedAnnouncements.length > 0 ? "block" : "none";
            if (interestsSection) interestsSection.style.display = matchedInterests.length > 0 ? "block" : "none";
        } else {
            if (peopleSection) peopleSection.style.display = activeTab === "people" && matchedProfiles.length > 0 ? "block" : "none";
            if (placesSection) placesSection.style.display = activeTab === "places" && matchedAnnouncements.length > 0 ? "block" : "none";
            if (interestsSection) interestsSection.style.display = activeTab === "interests" && matchedInterests.length > 0 ? "block" : "none";
        }

        hideLoading();

        if (totalResults === 0) {
            showNoResults(currentSearchQuery);
        } else {
            if (noResults) noResults.style.display = "none";
            if (sectionsWrapper) sectionsWrapper.style.display = "flex";
        }
    }

    // ============================================================
    // Sort logic
    // ============================================================
    function performSort(items, type) {
        return [...items].sort((a, b) => {
            if (currentSort === "rating") {
                const ratingA = type === "profile" ? (a.points || 0) : (a.profiles?.points || 0);
                const ratingB = type === "profile" ? (b.points || 0) : (b.profiles?.points || 0);
                return ratingB - ratingA;
            }
            if (currentSort === "newest") {
                const dateA = new Date(type === "profile" ? a.active_announcement?.created_at : a.created_at);
                const dateB = new Date(type === "profile" ? b.active_announcement?.created_at : b.created_at);
                return dateB - dateA;
            }
            // Relevance or default
            return 0;
        });
    }

    // ============================================================
    // Render Profiles
    // ============================================================
    function renderProfiles(profiles) {
        const grid = document.getElementById("people-grid");
        if (!grid) return;
        if (profiles.length === 0) {
            grid.innerHTML = "";
            return;
        }

        grid.innerHTML = profiles.map(prof => {
            const ann = prof.active_announcement || {};
            const isSent = allData.sentAnnIds.includes(ann.id);
            const myInterests = JSON.parse(localStorage.getItem(`Birgalikda_fields_${getUserId()}`) || '[]');
            const sharedCount = (prof.interests || []).filter(i => myInterests.includes(i)).length;
            const matchScore = Math.min(65 + (sharedCount * 10), 99);

            return `
            <div class="person-card" data-dept="it" data-rating="${prof.points || 0}" data-announcement-id="${ann.id}" data-receiver-id="${prof.id}">
                <div class="card-body">
                    <div class="avatar-box">
                        <img src="${prof.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}" alt="${prof.full_name}" loading="lazy">
                        <span class="online-dot" title="Onlayn"></span>
                    </div>
                    <div class="person-info">
                        <div class="person-top">
                            <h4>${prof.full_name || 'Noma\'lum'}</h4>
                            <span class="match-percentage">${matchScore}% mos</span>
                        </div>
                        <p class="person-role">${prof.role || 'Talaba'}</p>
                        <div class="person-meta">
                            <span class="meta-item"><i class="fa-solid fa-location-dot"></i> ${ann.location_name || 'Tushlik uchrashuvi'}</span>
                            <span class="meta-item"><i class="fa-solid fa-clock"></i> ${ann.start_time ? ann.start_time.substring(0, 5) : '12:00'} da</span>
                        </div>
                        <div class="tags-row">
                            ${(prof.interests || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    ${isSent ? 
                        `<button class="action-btn primary" disabled style="opacity: 0.7; background:#64748b; color:#fff; cursor:default;"><i class="fa-solid fa-check"></i> Yuborildi</button>` :
                        `<button class="action-btn primary btn-submit-proposal"><i class="fa-solid fa-calendar-plus"></i> Taklif</button>`
                    }
                    <button class="action-btn secondary btn-view-profile" onclick="window.open('xarita.html?focus_announcement=${ann.id}', '_self')">
                        <i class="fa-solid fa-user"></i>
                    </button>
                </div>
            </div>`;
        }).join('');
    }

    // ============================================================
    // Render Announcements
    // ============================================================
    function renderAnnouncements(anns) {
        const grid = document.getElementById("places-grid");
        if (!grid) return;
        if (anns.length === 0) {
            grid.innerHTML = "";
            return;
        }

        grid.innerHTML = anns.map(ann => {
            const prof = ann.profiles || {};
            return `
            <div class="place-card" onclick="window.open('xarita.html?focus_announcement=${ann.id}', '_self')" style="cursor:pointer;">
                <div class="place-image-wrapper">
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" alt="${ann.location_name}" loading="lazy">
                    <span class="rating-badge"><i class="fa-solid fa-star"></i> 4.8</span>
                    <span class="distance-badge"><i class="fa-solid fa-clock"></i> ${ann.start_time ? ann.start_time.substring(0, 5) : '12:00'}</span>
                </div>
                <div class="place-details">
                    <div class="place-top">
                        <h4>${ann.location_name || 'Tushlik uchrashuvi'}</h4>
                        <span class="active-meetings-badge">Uchrashuv</span>
                    </div>
                    <p class="place-loc"><i class="fa-solid fa-building"></i> ${ann.title || 'Tushlik'}</p>
                    <div class="place-amenities">
                        <span class="amenity"><i class="fa-solid fa-user"></i> ${prof.full_name || 'Noma\'lum'}</span>
                        <span class="amenity"><i class="fa-solid fa-suitcase"></i> ${prof.role || 'Dasturchi'}</span>
                    </div>
                    <div class="place-footer">
                        <div class="avatar-group">
                            <img src="${prof.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}" alt="User" loading="lazy">
                        </div>
                        <button class="batafsil-btn">Batafsil</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // ============================================================
    // Render Interests
    // ============================================================
    function renderInterests(interests) {
        const flex = document.querySelector(".interests-flex");
        if (!flex) return;
        if (interests.length === 0) {
            flex.innerHTML = "";
            return;
        }

        flex.innerHTML = interests.map(interest => `
        <div class="interest-pill" data-count="${interest.count}">
            <div class="interest-icon"><i class="fa-solid fa-hashtag"></i></div>
            <div class="interest-info">
                <strong>${interest.name}</strong>
                <span class="pill-count">${interest.count} ta uchrashuv</span>
            </div>
        </div>`).join('');

        // Wire click action on interest pills to re-search
        flex.querySelectorAll(".interest-pill").forEach(pill => {
            pill.addEventListener("click", () => {
                const name = pill.querySelector("strong").textContent;
                if (globalSearchInput) {
                    globalSearchInput.value = name;
                    currentSearchQuery = name;
                    if (searchKeywordDisplay) searchKeywordDisplay.textContent = name;
                    executeSearch();
                }
            });
        });
    }

    // ============================================================
    // No Results / Search Clear
    // ============================================================
    function showNoResults(query) {
        if (sectionsWrapper) sectionsWrapper.style.display = "none";
        if (noResults) noResults.style.display = "flex";
        if (noResultsQuery) noResultsQuery.textContent = query;
        if (resultsCountLabel) resultsCountLabel.textContent = "0";
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (globalSearchInput) {
                globalSearchInput.value = "";
                currentSearchQuery = "";
            }
            if (searchKeywordDisplay) searchKeywordDisplay.textContent = "Barchasi";
            executeSearch();
            if (globalSearchInput) globalSearchInput.focus();
        });
    }

    // ============================================================
    // Search Inputs Event Listeners
    // ============================================================
    if (globalSearchInput && searchKeywordDisplay) {
        globalSearchInput.addEventListener("input", function () {
            const queryValue = this.value.trim();
            searchKeywordDisplay.textContent = queryValue ? queryValue : "Barchasi";
            currentSearchQuery = queryValue;

            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                executeSearch();
            }, 300);
        });

        globalSearchInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                currentSearchQuery = this.value.trim();
                executeSearch();
            }
        });
    }

    if (searchSubmit) {
        searchSubmit.addEventListener("click", () => {
            currentSearchQuery = globalSearchInput.value.trim();
            executeSearch();
        });
    }

    // ============================================================
    // Filter Form Submit
    // ============================================================
    if (filterForm) {
        filterForm.addEventListener("submit", function(e) {
            e.preventDefault();
            applyFilters();
        });
    }

    function applyFilters() {
        // Department
        if (filterDepartment) {
            filters.department = filterDepartment.value;
        }

        // Time (already updated via button clicks)

        // Rating
        if (ratingValue) {
            filters.minRating = parseFloat(ratingValue.textContent) || 3.0;
        }

        // Distance
        const distRadio = document.querySelector('input[name="distance"]:checked');
        if (distRadio) {
            filters.maxDistance = parseInt(distRadio.value, 10);
        }

        // Experience
        const expCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        filters.experience = [];
        expCheckboxes.forEach(cb => {
            if (cb.checked) filters.experience.push(cb.value);
        });

        // Build active filter tags
        renderActiveFilters();

        executeSearch();
        showToast("Filtrlar qo'llandi", "success", 2000);
    }

    // ============================================================
    // Active Filter Tags
    // ============================================================
    function renderActiveFilters() {
        if (!activeFiltersContainer) return;
        activeFiltersContainer.innerHTML = '';
        let hasAny = false;

        if (filters.department !== 'all') {
            hasAny = true;
            const deptNames = { it: 'IT', marketing: 'Marketing', hr: 'HR', design: 'Dizayn', finance: 'Moliya' };
            addFilterTag('Bo\'lim', deptNames[filters.department] || filters.department, 'dept');
        }
        if (filters.time !== 'bugun') {
            hasAny = true;
            const timeNames = { ertaga: 'Ertaga', hafta: 'Bu hafta', oy: 'Bu oy' };
            addFilterTag('Vaqt', timeNames[filters.time] || filters.time, 'time');
        }
        if (filters.minRating > 3.0) {
            hasAny = true;
            addFilterTag('Reyting', filters.minRating + '+', 'rating');
        }
        if (filters.maxDistance !== 500) {
            hasAny = true;
            const distLabel = filters.maxDistance >= 1000 ? (filters.maxDistance / 1000) + 'km' : filters.maxDistance + 'm';
            addFilterTag('Masofa', '< ' + distLabel, 'distance');
        }
        if (filters.experience.length > 0) {
            hasAny = true;
            const expNames = { junior: 'Junior', mid: 'Mid', senior: 'Senior' };
            const label = filters.experience.map(e => expNames[e] || e).join(', ');
            addFilterTag('Tajriba', label, 'exp');
        }

        if (clearFiltersBtn) clearFiltersBtn.style.display = hasAny ? 'flex' : 'none';
    }

    function addFilterTag(label, value, id) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.setAttribute('data-filter-id', id);
        tag.innerHTML = `${label}: ${value} <i class="fa-solid fa-xmark"></i>`;
        tag.addEventListener('click', () => {
            removeFilter(id);
        });
        activeFiltersContainer.appendChild(tag);
    }

    function removeFilter(id) {
        if (id === 'dept') {
            filters.department = 'all';
            if (filterDepartment) filterDepartment.value = 'all';
        } else if (id === 'time') {
            filters.time = 'bugun';
            timeButtons.forEach(b => b.classList.remove('active'));
            const firstBtn = document.querySelector('.time-btn[data-time="bugun"]');
            if (firstBtn) firstBtn.classList.add('active');
        } else if (id === 'rating') {
            filters.minRating = 3.0;
            if (ratingValue) ratingValue.textContent = '3.0';
            if (sliderThumb) sliderThumb.style.left = '0%';
            if (sliderTrack) sliderTrack.style.width = '0%';
        } else if (id === 'distance') {
            filters.maxDistance = 500;
            const firstRadio = document.querySelector('input[name="distance"][value="500"]');
            if (firstRadio) firstRadio.checked = true;
        } else if (id === 'exp') {
            filters.experience = [];
            document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
        renderActiveFilters();
        executeSearch();
        showToast("Filtr olib tashlandi", "info", 1500);
    }

    // ============================================================
    // Clear All Filters
    // ============================================================
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            filters.department = 'all';
            filters.time = 'bugun';
            filters.minRating = 3.0;
            filters.maxDistance = 500;
            filters.experience = [];

            if (filterDepartment) filterDepartment.value = 'all';
            timeButtons.forEach(b => b.classList.remove('active'));
            const firstTimeBtn = document.querySelector('.time-btn[data-time="bugun"]');
            if (firstTimeBtn) firstTimeBtn.classList.add('active');
            if (ratingValue) ratingValue.textContent = '3.0';
            if (sliderThumb) sliderThumb.style.left = '0%';
            if (sliderTrack) sliderTrack.style.width = '0%';
            const firstRadio = document.querySelector('input[name="distance"][value="500"]');
            if (firstRadio) firstRadio.checked = true;
            document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);

            renderActiveFilters();
            executeSearch();
            showToast("Barcha filtrlar tozalandi", "info", 1500);
        });
    }

    // ============================================================
    // Time Buttons
    // ============================================================
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            timeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filters.time = this.getAttribute('data-time');
        });
    });

    // ============================================================
    // Rating Slider
    // ============================================================
    let isDragging = false;

    if (sliderThumb && sliderTrack) {
        sliderThumb.addEventListener('mousedown', startDrag);
        sliderThumb.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: true });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function startDrag() {
        isDragging = true;
        if (sliderThumb) sliderThumb.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!isDragging) return;
        const container = sliderThumb.parentElement;
        const rect = container.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let percent = ((clientX - rect.left) / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        sliderThumb.style.left = `${percent}%`;
        if (sliderTrack) sliderTrack.style.width = `${percent}%`;
        const rating = (3 + (percent / 100) * 2).toFixed(1);
        if (ratingValue) ratingValue.textContent = rating;
        filters.minRating = parseFloat(rating);
    }

    function stopDrag() {
        isDragging = false;
        if (sliderThumb) sliderThumb.style.cursor = 'grab';
    }

    // ============================================================
    // Tabs Navigation
    // ============================================================
    tabLinks.forEach(tab => {
        tab.addEventListener("click", function () {
            tabLinks.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            activeTab = this.getAttribute("data-tab");
            executeSearch();
        });
    });

    // ============================================================
    // Sort Dropdown
    // ============================================================
    if (sortBtn && sortMenu) {
        sortBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sortMenu.classList.toggle("open");
            sortBtn.classList.toggle("active");
        });

        document.addEventListener("click", () => {
            sortMenu.classList.remove("open");
            sortBtn.classList.remove("active");
        });

        sortOptions.forEach(option => {
            option.addEventListener("click", function() {
                sortOptions.forEach(o => o.classList.remove("active"));
                this.classList.add("active");
                currentSort = this.getAttribute("data-sort");
                sortBtn.querySelector("span").textContent = this.textContent;

                executeSearch();
                showToast(`Natijalar ${this.textContent.toLowerCase()} saralandi`, "info", 1500);
            });
        });
    }

    // ============================================================
    // View Toggle (Grid / List)
    // ============================================================
    viewBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            viewBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentView = this.getAttribute("data-view");

            if (currentView === "list") {
                if (resultsContent) resultsContent.classList.add("list-view");
            } else {
                if (resultsContent) resultsContent.classList.remove("list-view");
            }
        });
    });

    // ============================================================
    // Send Proposal Action
    // ============================================================
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-submit-proposal");
        if (btn) {
            e.stopPropagation();
            const card = btn.closest(".person-card");
            if (!card) return;
            const annId = card.getAttribute("data-announcement-id");
            const receiverId = card.getAttribute("data-receiver-id");
            const senderId = getUserId();

            if (supabaseClient && senderId && annId && receiverId) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
                try {
                    const { error } = await supabaseClient
                        .from('lunch_requests')
                        .insert({
                            announcement_id: annId,
                            sender_id: senderId,
                            receiver_id: receiverId,
                            status: 'pending'
                        });
                    if (error) throw error;
                    
                    showToast("Taklif muvaffaqiyatli jo'natildi!", "success", 3000);
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Yuborildi`;
                    btn.style.opacity = "0.7";
                    btn.style.background = "#64748b";
                    btn.style.color = "#fff";
                    btn.style.cursor = "default";

                    if (!allData.sentAnnIds.includes(annId)) {
                        allData.sentAnnIds.push(annId);
                    }
                } catch (err) {
                    console.error("Insert request error:", err);
                    showToast("Xatolik yuz berdi: " + err.message, "error");
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Taklif`;
                }
            }
        }
    });

    // ============================================================
    // Load Navbar User Data
    // ============================================================
    async function loadNavbar() {
        if (!supabaseClient) return;
        const userId = getUserId();
        if (!userId) return;

        try {
            // Load avatar
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('avatar_url, full_name')
                .eq('id', userId)
                .single();

            if (profile) {
                const navAvatar = document.getElementById('nav-avatar-img');
                if (navAvatar && profile.avatar_url) {
                    navAvatar.src = profile.avatar_url;
                }
            }

            // Load notification count
            const { data: notifs, error: notifErr } = await supabaseClient
                .from('lunch_requests')
                .select('id', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('status', 'pending');

            if (!notifErr && notifs && notifs.length > 0) {
                const badge = document.getElementById('nav-notif-count');
                if (badge) {
                    badge.textContent = notifs.length;
                    badge.style.display = 'flex';
                }
            }
        } catch (e) {
            console.error("Navbar load error:", e);
        }
    }

    // Keyboard navigation focus search
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            if (globalSearchInput) globalSearchInput.focus();
        }
    });

    // Load
    loadNavbar();
    loadData();
});