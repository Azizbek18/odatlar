// Streak tarixi uchun heatmap katakchalarini generatsiya qilish
function buildHeatmap() {
  const heatmap = document.getElementById('heatmap');
  if (!heatmap) return;

  const totalCells = 18 * 7; // 18 hafta x 7 kun
  const intensities = [0, 1, 2, 3, 4]; // 0 = bo'sh, 4 = eng to'q

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('span');
    // Tasodifiy, lekin ko'proq faollikka og'ish (demo ma'lumot)
    const rand = Math.random();
    let level = 0;
    if (rand > 0.85) level = 4;
    else if (rand > 0.65) level = 3;
    else if (rand > 0.45) level = 2;
    else if (rand > 0.25) level = 1;

    const colors = ['#f0ecff', '#d9caff', '#b79bff', '#8c5cf5', '#6133e8'];
    cell.style.background = colors[level];
    heatmap.appendChild(cell);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters for dynamic rendering
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const icon = params.get('icon');
  const time = params.get('time');

  if (title) {
    const titleEl = document.querySelector('.hero-title');
    if (titleEl) titleEl.textContent = title;
  }
  if (icon) {
    const iconEl = document.querySelector('.hero-icon');
    if (iconEl) iconEl.textContent = icon;
  }
  if (time) {
    const subEl = document.querySelector('.hero-sub');
    if (subEl) subEl.textContent = `Kunlik maqsad: ${time}`;
  }

  buildHeatmap();

  // ---------- Responsive Drawer Sidebar ----------
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarNavLinks = document.querySelectorAll('.sidebar .menu-item a');



  const openSidebar = () => {
    if (sidebar && menuToggle && sidebarOverlay) {
      sidebar.classList.add('active');
      menuToggle.classList.add('active');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeSidebar = () => {
    if (sidebar && menuToggle && sidebarOverlay) {
      sidebar.classList.remove('active');
      menuToggle.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  sidebarNavLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
});