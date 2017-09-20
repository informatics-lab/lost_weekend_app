import { redrawEvents } from './events';
import { removeFog, showFog } from './fog';

const MODE_ALL = 'all';
const MODE_NOW = 'now';
const MODE_REVEAL = 'reveal';

let mode = MODE_ALL;


// TODO: Map should be in game state, not all over the place.

function setMode(newMode) {
    if (newMode == mode) {
        return;
    }
    mode = newMode;

    if (newMode == MODE_REVEAL) {
        removeFog();
    } else {
        showFog();
    }
    redrawEvents();
}


//TODO: Remove this
window.mode = setMode;

let state = {
    getMode: () => mode,
    setMode: setMode
}

export { state, MODE_ALL, MODE_NOW, MODE_REVEAL }