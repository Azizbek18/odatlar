// auth-guard.js - Protects internal pages from unauthorized access
(function() {
    const localStorageKey = 'sb-doboqtivghcdcoowoxmh-auth-token';
    const localToken = localStorage.getItem(localStorageKey);

    // If no token exists in localStorage, redirect immediately before rendering HTML content
    if (!localToken) {
        window.location.href = 'kirish.html?msg=unauthorized';
    }
})();


