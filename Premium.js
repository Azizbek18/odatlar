/**
 * Premium Pricing Strategy & Interface Animation Engine
 * Loyiha: Birgalikda Premium
 */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // DOM elementlarini tanlash
    const billingToggle = document.getElementById("billing-toggle");
    const proPriceLabel = document.getElementById("pro-price");
    const orgPriceLabel = document.getElementById("org-price");
    const accordionTriggers = document.querySelectorAll(".accordion-trigger");

    // 1. Dylik / Yillik Narx Matrixini Almashtirish Mantiqi
    // Skrinshottagi oylik bazaviy narxlar: Pro = 29,000, Org = 19,000
    const pricingMatrix = {
        monthly: { pro: "29,000", org: "19,000" },
        yearly: { pro: "21,750", org: "14,250" } // 25% Chegirma hisoblangan holati
    };

    if (billingToggle && proPriceLabel && orgPriceLabel) {
        billingToggle.addEventListener("change", function() {
            // Raqamlar o'zgarayotganda yumshoq miltillash effekti (Fade Effect)
            proPriceLabel.style.opacity = "0.3";
            orgPriceLabel.style.opacity = "0.3";

            setTimeout(() => {
                if (this.checked) {
                    // Yillik tarifga o'tish
                    proPriceLabel.textContent = pricingMatrix.yearly.pro;
                    orgPriceLabel.textContent = pricingMatrix.yearly.org;
                } else {
                    // Oylik tarifga o'tish
                    proPriceLabel.textContent = pricingMatrix.monthly.pro;
                    orgPriceLabel.textContent = pricingMatrix.monthly.org;
                }
                
                proPriceLabel.style.opacity = "1";
                orgPriceLabel.style.opacity = "1";
            }, 150);
        });
    }

    // 2. Chiroyli va Silliq Accordion (FAQ) ochilish mexanizmi
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener("click", function() {
            const item = this.parentElement;
            const content = item.querySelector(".accordion-content");

            if (item.classList.contains("open")) {
                // Agar ochiq bo'lsa yopish
                content.style.maxHeight = null;
                item.classList.remove("open");
            } else {
                // Boshqa barcha ochiq savollarni avtomatik yopish (Kaskad karkas)
                document.querySelectorAll(".accordion-item").forEach(i => {
                    i.classList.remove("open");
                    const c = i.querySelector(".accordion-content");
                    if (c) c.style.maxHeight = null;
                });

                // Joriy elementni ochish (ScrollHeight yordamida dinamik balandlik)
                item.classList.add("open");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 3. Custom Toast Notification System
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const colors = { success: '#10b981', error: '#ef4444', info: '#0284c7' };
        toast.style.cssText = `
            background: ${colors[type] || colors.info};
            color: #fff;
            padding: 14px 20px;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 350px;
        `;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // 4. Tariff Cards Button Click Bindings
    const btnSubscribe = document.querySelector(".tariff-btn.btn-primary");
    if (btnSubscribe) {
        btnSubscribe.addEventListener("click", () => {
            showToast("Premium obunasi tez kunda faollashtiriladi! Hozirda sinov rejimida ishlamoqda.", "info");
        });
    }

    const btnContact = document.querySelector(".tariff-btn.btn-secondary");
    if (btnContact) {
        btnContact.addEventListener("click", () => {
            showToast("Biz bilan bog'lanish uchun support@birgalikda.uz elektron pochtasiga yozing.", "success");
        });
    }
});