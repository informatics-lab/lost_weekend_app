import { setView } from './view';
import { state } from './gameState';

function onLoadComplete() {
    let buttons = document.querySelectorAll('#welcome .buttons button');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.addEventListener('click', handleStartClick);
    }
    let buttonWrapper = document.querySelector('#welcome .buttons');
    if (buttonWrapper) {
        buttonWrapper.style.display = 'block';
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