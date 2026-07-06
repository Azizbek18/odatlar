document.addEventListener('DOMContentLoaded', () => {
    // URL orqali kelgan joy nomi va koordinatalarni olish
    const urlParams = new URLSearchParams(window.location.search);
    const locationName = urlParams.get('location');
    const latParam = urlParams.get('lat');
    const lonParam = urlParams.get('lon');

    // ===== Supabase sozlamalari =====
    const SUPABASE_URL = 'https://doboqtivghcdcoowoxmh.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_VzI36RYaoGx_8MfGne-MhA_KjXo82Lv';
    const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    let selectedLat = (latParam && !isNaN(parseFloat(latParam))) ? parseFloat(latParam) : 41.311081;
    let selectedLng = (lonParam && !isNaN(parseFloat(lonParam))) ? parseFloat(lonParam) : 69.279737;

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

    // ===== Toast funksiyasi =====
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

    // ===== Live preview elementlari =====
    const previewTime = document.getElementById('preview-time');
    const previewLocation = document.getElementById('preview-location');
    const previewMood = document.getElementById('preview-mood');
    const previewPeople = document.getElementById('preview-people');
    const timeStart = document.getElementById('time-start');
    const timeEnd = document.getElementById('time-end');
    const buildingInput = document.getElementById('building-input');

    if (locationName) {
        if (buildingInput) {
            buildingInput.value = locationName;
        }
        if (previewLocation) {
            previewLocation.textContent = locationName;
        }
    }

    async function loadUserProfile() {
        const userId = getUserId();
        const avatarBox = document.querySelector('.avatar-box');
        const userInfoHeader = document.querySelector('.user-info h4');
        
        const cachedName = localStorage.getItem('user_name');
        if (cachedName && userInfoHeader) {
            userInfoHeader.textContent = cachedName;
        }
        
        if (supabaseClient && userId) {
            try {
                const { data: profile, error } = await supabaseClient
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', userId)
                    .single();
                
                if (profile && !error) {
                    if (userInfoHeader) {
                        userInfoHeader.textContent = profile.full_name || cachedName || "Siz";
                    }
                    if (avatarBox && profile.avatar_url) {
                        avatarBox.innerHTML = `<img src="${profile.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" alt="Avatar">`;
                    }
                }
            } catch (err) {
                console.error("Profile load error:", err);
            }
        }
    }
    loadUserProfile();

    // ===== Mini-xaritani sozlash =====
    const miniMapContainer = document.getElementById('mini-map');
    let miniMap, miniMarker;

    if (miniMapContainer) {
        try {
            // Toshkent markazida xaritani ochish
            miniMap = L.map('mini-map', {
                zoomControl: false,
                fadeAnimation: true,
                zoomAnimation: true
            }).setView([selectedLat, selectedLng], 14);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(miniMap);

            const pinIcon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            });

            miniMarker = L.marker([selectedLat, selectedLng], { icon: pinIcon, draggable: true }).addTo(miniMap);
            
            setTimeout(() => {
                if (miniMap) {
                    miniMap.invalidateSize();
                }
            }, 250);
        } catch (mapErr) {
            console.error("Leaflet map initialization error:", mapErr);
        }

        // Geocoding (koordinatadan joy nomini aniqlash)
        async function reverseGeocode(lat, lng) {
            try {
                let success = false;
                if (window.ymaps && typeof ymaps.geocode === 'function') {
                    try {
                        const res = await ymaps.geocode([lat, lng]);
                        const firstGeoObject = res.geoObjects.get(0);
                        if (firstGeoObject) {
                            const name = firstGeoObject.getAddressLine();
                            const cleanName = firstGeoObject.getLocalities().join(', ') || firstGeoObject.getThoroughfare() || name.split(',')[0];
                            buildingInput.value = cleanName;
                            if (previewLocation) {
                                previewLocation.textContent = cleanName;
                            }
                            success = true;
                        }
                    } catch (yandexErr) {
                        console.warn("Yandex reverse geocode failed, falling back to Nominatim:", yandexErr);
                    }
                }

                if (!success) {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        const cleanName = data.address.amenity || data.address.cafe || data.address.restaurant || data.address.shop || data.address.road || data.display_name.split(',')[0];
                        buildingInput.value = cleanName;
                        if (previewLocation) {
                            previewLocation.textContent = cleanName;
                        }
                    }
                }
            } catch (err) {
                console.error("Reverse geocoding error:", err);
            }
        }

        // Marker surilganda
        if (miniMarker) {
            miniMarker.on('dragend', () => {
                const position = miniMarker.getLatLng();
                selectedLat = position.lat;
                selectedLng = position.lng;
                reverseGeocode(selectedLat, selectedLng);
            });
        }

        // Xaritani bosganda marker ko'chadi
        if (miniMap) {
            miniMap.on('click', (e) => {
                selectedLat = e.latlng.lat;
                selectedLng = e.latlng.lng;
                if (miniMarker) {
                    miniMarker.setLatLng(e.latlng);
                }
                reverseGeocode(selectedLat, selectedLng);
            });
        }

        // Joy qidirish funksiyasi
        const searchBtn = document.getElementById('map-search-btn');
        async function executeMapSearch() {
            const query = buildingInput.value.trim();
            if (!query) return;

            searchBtn.disabled = true;
            searchBtn.textContent = "Izlash...";

            try {
                let success = false;

                // 1. Yandex orqali qidirishni urinib ko'ramiz (agar kutubxona yuklangan bo'lsa)
                if (window.ymaps && typeof ymaps.geocode === 'function') {
                    try {
                        const res = await ymaps.geocode(query + ", Tashkent, Uzbekistan");
                        const firstGeoObject = res.geoObjects.get(0);
                        if (firstGeoObject) {
                            const coords = firstGeoObject.geometry.getCoordinates();
                            selectedLat = coords[0];
                            selectedLng = coords[1];

                            if (miniMap) {
                                miniMap.flyTo([selectedLat, selectedLng], 16, { animate: true, duration: 1.5 });
                            }
                            if (miniMarker) {
                                miniMarker.setLatLng([selectedLat, selectedLng]);
                            }

                            const cleanName = firstGeoObject.getLocalities().join(', ') || firstGeoObject.getThoroughfare() || firstGeoObject.getAddressLine().split(',')[0];
                            buildingInput.value = cleanName;
                            if (previewLocation) {
                                previewLocation.textContent = cleanName;
                            }
                            success = true;
                        }
                    } catch (yandexErr) {
                        console.warn("Yandex Maps search failed/unauthorized, falling back to Nominatim:", yandexErr);
                    }
                }

                // 2. Yandex xato bersa yoki topa olmasa, Nominatim yordamida Toshkent bo'yicha qidiramiz
                if (!success) {
                    // Toshkent shahri koordinatalari bilan chegaralangan qidiruv
                    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=69.15,41.20,69.40,41.40&bounded=1`);
                    let data = await response.json();

                    // Agar topilmasa, butun O'zbekiston bo'yicha qidiramiz
                    if (!data || data.length === 0) {
                        response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Uzbekistan")}`);
                        data = await response.json();
                    }

                    if (data && data.length > 0) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);
                        selectedLat = lat;
                        selectedLng = lon;

                        if (miniMap) {
                            miniMap.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });
                        }
                        if (miniMarker) {
                            miniMarker.setLatLng([lat, lon]);
                        }

                        const cleanName = data[0].display_name.split(',')[0];
                        buildingInput.value = cleanName;
                        if (previewLocation) {
                            previewLocation.textContent = cleanName;
                        }
                        success = true;
                    }
                }

                if (!success) {
                    showToast("Joy topilmadi! Boshqacha yozib ko'ring.", "warning");
                }
            } catch (err) {
                console.error("Search error:", err);
                showToast("Qidiruvda xatolik yuz berdi.", "error");
            } finally {
                // Har qanday holatda ham tugmani faol holatga qaytaramiz
                searchBtn.disabled = false;
                searchBtn.textContent = "Qidirish";
            }
        }

        searchBtn.addEventListener('click', executeMapSearch);
        if (buildingInput) {
            buildingInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    executeMapSearch();
                }
            });
        }
    }

    // ===== Vaqtni yangilash =====
    function updateTimePreview() {
        if (previewTime && timeStart && timeEnd) {
            previewTime.textContent = `${timeStart.value} - ${timeEnd.value}`;
        }
    }
    if (timeStart) timeStart.addEventListener('change', updateTimePreview);
    if (timeEnd) timeEnd.addEventListener('change', updateTimePreview);

    // ===== Bino/Manzilni yangilash =====
    if (buildingInput) {
        buildingInput.addEventListener('input', () => {
            if (previewLocation) {
                previewLocation.textContent = buildingInput.value.trim() || "IT Park - Blok A";
            }
        });
    }

    // ===== Badge tugmalarini almashtirish (Muhit) =====
    const badgeBtns = document.querySelectorAll('.badge-btn');
    badgeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            badgeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (previewMood) {
                previewMood.textContent = btn.textContent.trim().toUpperCase();
            }
        });
    });

    // ===== Kishilar soni tanlash =====
    const peopleCards = document.querySelectorAll('.people-card');
    peopleCards.forEach(card => {
        card.addEventListener('click', () => {
            peopleCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            if (previewPeople) {
                const label = card.querySelector('span:last-child');
                if (label) {
                    previewPeople.textContent = label.textContent.trim().toUpperCase();
                }
            }
        });
    });

    // ===== Edit Mode Support =====
    const editId = urlParams.get('edit_id');

    async function checkEditMode() {
        if (!editId || !supabaseClient) return;

        try {
            const heading = document.querySelector('.form-header h2');
            if (heading) heading.textContent = "Tushlik e'lonini tahrirlash";
            if (submitBtn) {
                submitBtn.innerHTML = `Yangilash <span class="material-icons-outlined">arrow_forward</span>`;
            }

            const { data: ann, error } = await supabaseClient
                .from('lunch_announcements')
                .select('*')
                .eq('id', editId)
                .single();

            if (error) throw error;

            if (ann) {
                if (ann.start_time && timeStart) {
                    timeStart.value = ann.start_time.substring(0, 5);
                }
                if (ann.end_time && timeEnd) {
                    timeEnd.value = ann.end_time.substring(0, 5);
                }
                updateTimePreview();

                if (ann.location_name && buildingInput) {
                    buildingInput.value = ann.location_name;
                    if (previewLocation) previewLocation.textContent = ann.location_name;
                }

                if (ann.latitude && ann.longitude) {
                    selectedLat = ann.latitude;
                    selectedLng = ann.longitude;
                    if (miniMap && miniMarker) {
                        miniMap.setView([selectedLat, selectedLng], 15);
                        miniMarker.setLatLng([selectedLat, selectedLng]);
                    }
                }

                let mood = 'Rasmiy';
                let people = '1-on-1';
                if (ann.description) {
                    const parts = ann.description.split(', ');
                    parts.forEach(part => {
                        if (part.includes('Muhit:')) mood = part.replace('Muhit:', '').trim();
                        if (part.includes('Uchrashuv shakli:')) people = part.replace('Uchrashuv shakli:', '').trim();
                    });
                }

                const moodBtns = document.querySelectorAll('.badge-btn');
                moodBtns.forEach(btn => {
                    if (btn.textContent.trim().toLowerCase() === mood.toLowerCase()) {
                        moodBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        if (previewMood) previewMood.textContent = btn.textContent.trim().toUpperCase();
                    }
                });

                const pCards = document.querySelectorAll('.people-card');
                pCards.forEach(card => {
                    const labelSpan = card.querySelector('span:last-child');
                    if (labelSpan && labelSpan.textContent.trim().toLowerCase() === people.toLowerCase()) {
                        pCards.forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                        if (previewPeople) previewPeople.textContent = labelSpan.textContent.trim().toUpperCase();
                    }
                });
            }
        } catch (err) {
            console.error("Error loading edit announcement:", err);
            showToast("Ma'lumotlarni yuklashda xatolik: " + err.message, "error");
        }
    }

    // Call edit mode checker
    setTimeout(checkEditMode, 200);

    // ===== E'lon qo'yish tugmasi =====
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

        const userId = getUserId();
        if (!userId) {
            showToast("Tizimga kirilmagan! Iltimos, qayta kiring.", "error");
            setTimeout(() => window.location.href = 'kirish.html', 1500);
            return;
        }

        // Vaqt validatsiyasi
        if (timeStart.value >= timeEnd.value) {
            showToast("Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak!", "error");
            return;
        }

        submitBtn.textContent = editId ? "Yangilanmoqda..." : "E'lon qo'yilmoqda...";
        submitBtn.style.opacity = "0.7";
        submitBtn.style.pointerEvents = "none";

        const selectedMoodBtn = document.querySelector('.badge-btn.active');
        const moodText = selectedMoodBtn ? selectedMoodBtn.textContent.trim() : 'Rasmiy';

        const selectedPeopleBtn = document.querySelector('.people-card.active');
        const peopleSpan = selectedPeopleBtn ? selectedPeopleBtn.querySelector('span:last-child') : null;
        const peopleText = peopleSpan ? peopleSpan.textContent.trim() : '1-on-1';

        const buildingName = buildingInput.value.trim() || 'IT Park - Blok A';

        const localDate = new Date();
        const yyyy = localDate.getFullYear();
        const mm = String(localDate.getMonth() + 1).padStart(2, '0');
        const dd = String(localDate.getDate()).padStart(2, '0');
        const todayDateStr = `${yyyy}-${mm}-${dd}`;

        try {
            let res;
            if (editId) {
                res = await supabaseClient
                    .from('lunch_announcements')
                    .update({
                        title: `Tushlik - ${buildingName}`,
                        description: `Muhit: ${moodText}, Uchrashuv shakli: ${peopleText}`,
                        location_name: buildingName,
                        latitude: selectedLat,
                        longitude: selectedLng,
                        start_time: `${timeStart.value}:00`,
                        end_time: `${timeEnd.value}:00`,
                        lunch_date: todayDateStr
                    })
                    .eq('id', editId);
            } else {
                res = await supabaseClient
                    .from('lunch_announcements')
                    .insert([
                        {
                            user_id: userId,
                            title: `Tushlik - ${buildingName}`,
                            description: `Muhit: ${moodText}, Uchrashuv shakli: ${peopleText}`,
                            location_name: buildingName,
                            latitude: selectedLat,
                            longitude: selectedLng,
                            start_time: `${timeStart.value}:00`,
                            end_time: `${timeEnd.value}:00`,
                            status: 'active',
                            lunch_date: todayDateStr
                        }
                    ]);
            }

            if (res.error) throw res.error;

            showToast(editId ? "E'lon muvaffaqiyatli tahrirlandi!" : "E'loningiz muvaffaqiyatli qo'yildi!", "success");
            setTimeout(() => {
                window.location.href = 'Asosiy.html';
            }, 1500);

        } catch (err) {
            console.error("Announcement submit error:", err);
            showToast("E'lonni saqlashda xatolik: " + err.message, "error");
            submitBtn.textContent = editId ? "Yangilash" : "E'lon qo'yish";
            submitBtn.style.opacity = "1";
            submitBtn.style.pointerEvents = "auto";
        }
        });
    }

    // ===== Yopish tugmasi =====
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = 'Asosiy.html';
        });
    }

    // Load Yandex Maps API dynamically so it doesn't block DOMContentLoaded
    try {
        const ymapsScript = document.createElement('script');
        ymapsScript.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ';
        ymapsScript.async = true;
        document.head.appendChild(ymapsScript);
    } catch (scriptErr) {
        console.error("Yandex Maps API load error:", scriptErr);
    }
});
