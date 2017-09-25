import { state } from './gameState';

const query = require('query-string').parse(location.search);



// // TODO: Keep or remove?
// if (query.range) { state.getPlayerAttributes().range = parseFloat(query.range); }
// if (query.hintMinDelay) { state.getPlayerAttributes().hints.minDelay = parseInt(query.hintMinDelay); }
// if (query.hintMaxDelay) { state.getPlayerAttributes().hints.maxDelay = parseInt(query.hintMaxDelay); }
// if (query.hintMax) { state.getPlayerAttributes().hints.max = parseInt(query.hintMax); }

const INC_RANGE = "inc-range";
const INC_HINT = "inc-hint";

function powerUpRange() {
    let playerAttributes = state.getPlayerAttributes();
    playerAttributes.range += playerAttributes.range * 0.75;
    console.log("Powered up range!!");
}

function powerUpHint() {
    let playerAttributes = state.getPlayerAttributes();
    let minDelay = playerAttributes.hints.minDelay - 2;
    let maxDelay = playerAttributes.hints.maxDelay - 5;
    let max = playerAttributes.hints.max + 1;

    minDelay = (minDelay < 1) ? 1 : minDelay;
    maxDelay = (maxDelay < minDelay) ? minDelay : maxDelay;

    playerAttributes.hints.minDelay = minDelay;
    playerAttributes.hints.maxDelay = maxDelay;
    playerAttributes.hints.max = max;
    console.log("Powered up hints!!");
}

let callBacks = {};
callBacks[INC_HINT] = powerUpHint;
callBacks[INC_RANGE] = powerUpRange;

function createPowerUpCallback(type) {
    return callBacks[type];
}

export { createPowerUpCallback, INC_RANGE, INC_HINT };

//TODO: remove these short cuts:

window.range = powerUpRange;
window.hint = powerUpHint;
window.boosh = () => {
    powerUpRange();
    powerUpRange();
    powerUpRange();
    powerUpRange();
    powerUpRange();
    powerUpRange();
    powerUpRange();
    powerUpHint();
    powerUpHint();
    powerUpHint();
    powerUpHint();
};