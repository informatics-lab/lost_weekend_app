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
}

function handleStartClick(event) {
    event.preventDefault();
    setView('app');
    state.setMode(event.target.value);
}

export { onLoadComplete };