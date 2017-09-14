let button;
let mainMenuItems;


function activateMenus() {
    button = document.getElementById("menu-toggle");
    mainMenuItems = document.getElementById("main-menu-items")
    button.addEventListener('click', toggleMainMenu);
}

function toggleMainMenu() {
    let shown = mainMenuItems.getAttribute('data-shown');
    if (shown) {
        mainMenuItems.style.display = 'none';
        let shown = mainMenuItems.setAttribute('data-shown', '');
    } else {
        mainMenuItems.style.display = 'block';
        let shown = mainMenuItems.setAttribute('data-shown', 'true');
    }
}

export { activateMenus };