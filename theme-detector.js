(function() {
    try {
        const settings = JSON.parse(localStorage.getItem('Birgalikda_settings')) || {};
        const theme = settings.theme || 'light';
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark-theme');
        }
    } catch (e) {
        console.error("Theme detector error:", e);
    }
})();
