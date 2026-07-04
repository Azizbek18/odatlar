document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.onb-close');
  const startBtn = document.getElementById('startBtn');
  const dots = document.querySelectorAll('.dot');

  // Yopish tugmasi — bosh sahifaga qaytaradi
  closeBtn && closeBtn.addEventListener('click', () => {
    window.location.href = './index.html';
  });

  // Boshlash tugmasi — keyingi onboarding qadamiga yoki dashboardga o'tkazadi
  startBtn && startBtn.addEventListener('click', () => {
    window.location.href = './index.html';
  });
});