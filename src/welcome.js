import { setView } from './view';
import { state } from './gameState';

function onLoadComplete() {
    let buttons = document.querySelectorAll('#welcome .buttons button');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.addEventListener('click', handleStartClick);
    }

    let loadingText = document.getElementById("loading");
    if (loadingText) {
        loadingText.style.display = "none";
    }
    let welcomeText = document.getElementById("startMessage");
    if (welcomeText) {
        welcomeText.style.visibility = 'visible';
    }
    let buttonWrapper = document.querySelector('#welcome .buttons');
    if (buttonWrapper) {
        buttonWrapper.style.visibility = 'visible';
    }
    if (state.isRecovered() === true) {
        startAppInMode(state.getMode());
    }
}

function startAppInMode(mode) {
    setView('app');
    state.setMode(mode);

}

function handleStartClick(event) {
    event.preventDefault();
    startAppInMode(event.target.value);
}

export { onLoadComplete };