const toggleMenuButton = document.querySelector('.toggle-menu');
const mainNav = document.querySelector('.main-nav');

toggleMenuButton.addEventListener('click', () => {
    mainNav.classList.toggle('menu-open');
});