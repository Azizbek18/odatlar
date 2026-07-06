/**
 * Settings Privacy Handler & Local Data Sync Engine
 * Loyiha: Birgalikda Maxfiylik Sozlamalari
 */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // Konfiguratsiya kalitlari ro'yxati
    const STORAGE_PREFIX = "lm_setting_";
    const configSchema = {
        lunchStart: document.getElementById("lunch-start"),
        lunchEnd: document.getElementById("lunch-end"),
        notifyMatches: document.getElementById("notify-matches"),
        notifyReminders: document.getElementById("notify-reminders"),
        visibility: document.getElementById("profile-visibility"),
        linkedin: {
            status: document.getElementById("linkedin-status"),
            btn: document.getElementById("linkedin-btn")
        },
        buttons: {
            format: document.querySelectorAll(".format-btn"),
            tag: document.querySelectorAll(".style-tags .tag-btn")
        },
        toast: document.getElementById("toast-message")
    };

    // 1. Dinamik ma'lumotlarni o'qish/yozish kontrollyori
    const stateManager = {
        save(key, value) {
            localStorage.setItem(STORAGE_PREFIX + key, value);
        },
        load(key, fallback) {
            const data = localStorage.getItem(STORAGE_PREFIX + key);
            if (data === null) return fallback;
            if (data === "true") return true;
            if (data === "false") return false;
            return data;
        }
    };

    // 2. Vaqt inputlari validatsiyasi (Time Format Watcher)
    const validateTime = (timeStr) => {
        const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i;
        return regex.test(timeStr.trim());
    };

    const registerInputWatcher = (inputEl, stateKey) => {
        if (!inputEl) return;
        inputEl.value = stateManager.load(stateKey, inputEl.id === "lunch-start" ? "01:00 PM" : "02:00 PM");

        inputEl.addEventListener("change", function() {
            if (validateTime(this.value)) {
                stateManager.save(stateKey, this.value);
                this.style.borderColor = "#E2E8F0";
                triggerToast("Vaqt formati muvaffaqiyatli saqlandi", "success");
            } else {
                this.style.borderColor = "#EF4444";
                triggerToast("Xato format! Namuna: 01:30 PM", "danger");
            }
        });
    };

    registerInputWatcher(configSchema.lunchStart, "start_time");
    registerInputWatcher(configSchema.lunchEnd, "end_time");

    // 3. Format va uslub tugmalari holatini boshqarish (Button Matrix)
    const initializeButtonRadio = (nodeList, stateKey, defaultVal) => {
        const activeVal = stateManager.load(stateKey, defaultVal);
        
        nodeList.forEach(btn => {
            const val = btn.getAttribute("data-value");
            if (val === activeVal) btn.classList.add("active");

            btn.addEventListener("click", function() {
                nodeList.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                stateManager.save(stateKey, val);
                triggerToast("Tanlov yangilandi va xotiraga yozildi", "success");
            });
        });
    };

    initializeButtonRadio(configSchema.buttons.format, "format_type", "remote");
    initializeButtonRadio(configSchema.buttons.tag, "style_tag", "professional");

    // 4. Tumbler / Checkbox boshqaruvi
    const syncCheckbox = (checkboxEl, stateKey, defaultBool) => {
        if (!checkboxEl) return;
        checkboxEl.checked = stateManager.load(stateKey, defaultBool);

        checkboxEl.addEventListener("change", function() {
            stateManager.save(stateKey, this.checked);
            triggerToast(this.checked ? "Bildirishnoma faollashtirildi" : "Bildirishnoma o'chirildi", "info");
        });
    };

    syncCheckbox(configSchema.notifyMatches, "notif_matches", true);
    syncCheckbox(configSchema.notifyReminders, "notif_reminders", true);

    // 5. Select boshqaruvi
    if (configSchema.visibility) {
        configSchema.visibility.value = stateManager.load("profile_visibility", "public");
        configSchema.visibility.addEventListener("change", function() {
            stateManager.save("profile_visibility", this.value);
            triggerToast("Profil ko'rinishi yangilandi", "success");
        });
    }

    // 6. LinkedIn integratsiya drayveri
    let linkedInState = stateManager.load("linkedin_conn", true);
    const renderLinkedInUI = (connected) => {
        if (!configSchema.linkedin.status || !configSchema.linkedin.btn) return;
        if (connected) {
            configSchema.linkedin.status.textContent = "Bog'langan";
            configSchema.linkedin.status.style.color = "#16A34A";
            configSchema.linkedin.btn.textContent = "Uzish";
            configSchema.linkedin.btn.className = "unlink-btn disconnect";
        } else {
            configSchema.linkedin.status.textContent = "Ulanmagan";
            configSchema.linkedin.status.style.color = "#94A3B8";
            configSchema.linkedin.btn.textContent = "Ulash";
            configSchema.linkedin.btn.className = "unlink-btn connect";
        }
    };
    renderLinkedInUI(linkedInState);

    if (configSchema.linkedin.btn) {
        configSchema.linkedin.btn.addEventListener("click", () => {
            linkedInState = !linkedInState;
            stateManager.save("linkedin_conn", linkedInState);
            renderLinkedInUI(linkedInState);
            triggerToast(linkedInState ? "LinkedIn muvaffaqiyatli bog'landi" : "LinkedIn aloqasi uzildi", "info");
        });
    }

    // 7. Xavfli zona boshqaruvi
    const freezeBtn = document.getElementById("btn-freeze");
    const deleteBtn = document.getElementById("btn-delete");

    if (freezeBtn) {
        freezeBtn.addEventListener("click", () => triggerToast("Hisob vaqtincha muzlatildi.", "danger"));
    }
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            triggerToast("Barcha lokal ma'lumotlar tozalanmoqda...", "danger");
            localStorage.clear();
            setTimeout(() => window.location.reload(), 1500);
        });
    }

    // 8. Chiroyli global Toast bildirishnomasi
    function triggerToast(msg, type) {
        const toast = configSchema.toast;
        if (!toast) return;

        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.style.display = "block";

        // Oldingi taymerni tozalash (agar mavjud bo'lsa)
        if (window.toastTimer) clearTimeout(window.toastTimer);

        window.toastTimer = setTimeout(() => {
            toast.className = "toast hidden";
            toast.style.display = "none";
        }, 3000);
    }
});