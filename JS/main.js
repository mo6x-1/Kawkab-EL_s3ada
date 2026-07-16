document.addEventListener('DOMContentLoaded', function () {

  /* ============ Theme initialization (toggle in index) ============ */
  const THEME_KEY = 'siteTheme';
  function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  // apply saved theme on load
  applyTheme(getSavedTheme());

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // set initial icon
    themeToggle.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    themeToggle.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  /* ============ 1) فتح وقفل قائمة الموبايل ============ */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* ============ 2) قفل القائمة تلقائيًا لما يدوس على أي لينك (في وضع الموبايل) ============ */
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mainNav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ 3) كتابة السنة الحالية في الفوتر أوتوماتيك ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function initMenuTabs() {
    const menuTabs = document.getElementById('menuTabs');
    const cards = Array.from(document.querySelectorAll('.waffle-card'));
    if (!menuTabs || !cards.length) return;

    const groupSize = 4;
    const groupCount = Math.ceil(cards.length / groupSize);

    function showGroup(groupIndex) {
      cards.forEach((card, cardIndex) => {
        const group = Math.floor(cardIndex / groupSize);
        card.classList.toggle('hidden', group !== groupIndex);
      });
      menuTabs.querySelectorAll('.menu-tab').forEach((button, buttonIndex) => {
        button.classList.toggle('active', buttonIndex === groupIndex);
      });
    }

    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'menu-tab' + (groupIndex === 0 ? ' active' : '');
      tab.textContent = groupIndex + 1;
      tab.addEventListener('click', () => showGroup(groupIndex));
      menuTabs.appendChild(tab);
    }

    showGroup(0);
  }

  initMenuTabs();

});