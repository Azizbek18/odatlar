/**
 * Help Center Support Engine - Multi-threading Accordion & Dynamic Form Stream
 * Loyiha: Birgalikda Yordam Markazi
 */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // Kategoriya selektori
    const categoryButtons = document.querySelectorAll(".category-grid .cat-btn");
    let selectedCategory = "Xatolik";

    categoryButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            categoryButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            selectedCategory = this.getAttribute("data-category");
        });
    });

    // 1. Mukammal Star Rating boshqaruv matrisi
    const starContainer = document.getElementById("star-container");
    const stars = starContainer ? starContainer.querySelectorAll("i") : [];
    let savedRating = 0;

    stars.forEach(star => {
        star.addEventListener("mouseover", function() {
            const currentHover = parseInt(this.getAttribute("data-rating"), 10);
            fillStars(currentHover);
        });

        star.addEventListener("mouseleave", () => {
            fillStars(savedRating);
        });

        star.addEventListener("click", function() {
            savedRating = parseInt(this.getAttribute("data-rating"), 10);
            fillStars(savedRating);
        });
    });

    const fillStars = (ratingCount) => {
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute("data-rating"), 10);
            if (starValue <= ratingCount) {
                star.className = "fa-solid fa-star active";
            } else {
                star.className = "fa-regular fa-star";
            }
        });
    };

    // 2. Fayl yuklash va Validatsiya tizimi (Drag, Drop & Drop validation)
    const uploadZone = document.getElementById("upload-zone");
    const fileInput = document.getElementById("file-input");
    const uploadText = document.getElementById("upload-text");

    if (uploadZone && fileInput) {
        uploadZone.addEventListener("click", () => fileInput.click());

        // Dragover effekti
        uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadZone.style.backgroundColor = "#F1F5F9";
            uploadZone.style.borderColor = "#0284C7";
        });

        uploadZone.addEventListener("dragleave", () => {
            uploadZone.style.backgroundColor = "#F8FAFC";
            uploadZone.style.borderColor = "#E2E8F0";
        });

        uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadZone.style.backgroundColor = "#F8FAFC";
            if (e.dataTransfer.files.length > 0) {
                processUploadedFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                processUploadedFile(e.target.files[0]);
            }
        });
    }

    const processUploadedFile = (file) => {
        // Faqat rasmlarni tekshirish (Security validation)
        if (!file.type.startsWith("image/")) {
            uploadText.textContent = "Xato! Faqat rasm formatidagi screenshot yuklang.";
            uploadZone.style.borderColor = "#EF4444";
            return;
        }
        // Hajm nazorati (Maksimal 3MB)
        if (file.size > 3 * 1024 * 1024) {
            uploadText.textContent = "Fayl hajmi juda katta! (Max: 3MB)";
            uploadZone.style.borderColor = "#EF4444";
            return;
        }
        uploadText.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#16A34A"></i> Yuklandi: <strong>${file.name}</strong>`;
        uploadZone.style.borderColor = "#16A34A";
    };

    // 3. Formani jo'natish va "Mening so'rovlarim" oqimiga integratsiya qilish
    const form = document.getElementById("support-form");
    const ticketsList = document.getElementById("tickets-list");
    const toast = document.getElementById("toast-message");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const textInput = document.getElementById("message-text");
            if (!textInput || !textInput.value.trim()) return;

            const dateOptions = { day: 'numeric', month: 'Long' };
            const todayFormatted = new Date().toLocaleDateString('uz-UZ', dateOptions);

            // Dinamik tikket qurish paneli
            const ticketItem = document.createElement("div");
            ticketItem.className = "ticket-item";
            ticketItem.style.opacity = "0";
            ticketItem.style.transform = "translateY(-10px)";
            ticketItem.innerHTML = `
                <div class="ticket-left">
                    <div class="icon-circle bg-orange-light text-orange"><i class="fa-solid fa-spinner fa-spin"></i></div>
                    <div>
                        <h4>${textInput.value.substring(0, 25)}...</h4>
                        <p>${todayFormatted}, 2026</p>
                    </div>
                </div>
                <span class="status-badge badge-warning">Yangi</span>
            `;

            if (ticketsList) {
                ticketsList.insertBefore(ticketItem, ticketsList.firstChild);
                // Silliq paydo bo'lish animatsiyasi
                setTimeout(() => {
                    ticketItem.style.transition = "all 0.4s ease";
                    ticketItem.style.opacity = "1";
                    ticketItem.style.transform = "translateY(0)";
                }, 50);
            }

            // Formani standart holatga keltirish
            form.reset();
            savedRating = 0;
            fillStars(0);
            if (uploadText) uploadText.textContent = "Faylni shu yerga tashlang yoki yuklang";
            if (uploadZone) uploadZone.style.borderColor = "#E2E8F0";

            // Chiroyli javob oynasi
            if (toast) {
                toast.textContent = "Murojaatingiz yuborildi. Tiket tizimga qo'shildi.";
                toast.className = "toast success";
                toast.style.display = "block";
                setTimeout(() => {
                    toast.className = "toast hidden";
                    toast.style.display = "none";
                }, 3000);
            }
        });
    }

    // 4. Accordion Matrix - Savol-javoblarning mustaqil boshqaruvi
    const accordionTriggers = document.querySelectorAll(".accordion-trigger");
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener("click", function() {
            const parent = this.parentElement;
            const content = parent.querySelector(".accordion-content");

            if (parent.classList.contains("open")) {
                if (content) content.style.maxHeight = null;
                parent.classList.remove("open");
            } else {
                // Barcha ochiq savollarni yopish mantiqi (Sinxron kaskad)
                document.querySelectorAll(".accordion-item").forEach(item => {
                    item.classList.remove("open");
                    const c = item.querySelector(".accordion-content");
                    if (c) c.style.maxHeight = null;
                });

                parent.classList.add("open");
                if (content) content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});