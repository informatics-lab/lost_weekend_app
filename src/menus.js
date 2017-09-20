import { state } from './gameState';

let button;
let mainMenuItems;
let container;

function activateMenus() {
    container = document.getElementById('menuBar');
    button = document.querySelector("#menuBar .hamburger");
    mainMenuItems = document.querySelector("#menuBar .links");
    button.addEventListener('click', toggleMainMenu);
    hide();


    let filterButtons = document.querySelectorAll('.filter-link');
    for (var i = 0; i < filterButtons.length; i++) {
        var button = filterButtons[i];
        button.addEventListener('click', (e) => {
            let mode = e.currentTarget.getAttribute('data-eventtypes');
            state.setMode(mode);
        })
    }
}

function hide() {
    mainMenuItems.style.display = 'none';
    container.classList.remove("expanded");
    container.classList.add("collapsed");
    let shown = mainMenuItems.setAttribute('data-shown', '');
}

function show() {
    mainMenuItems.style.display = 'block';
    container.classList.add("expanded");
    container.classList.remove("collapsed");
    let shown = mainMenuItems.setAttribute('data-shown', 'true');
}

function toggleMainMenu() {
    let shown = mainMenuItems.getAttribute('data-shown');
    if (shown) {
        hide();
    } else {
        show();
    }
}

export { activateMenus };