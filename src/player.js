const query = require('query-string').parse(location.search);

let playerAttributes = {
    range: 14,
    hints: {
        minDelay: 20,
        maxDelay: 60,
        max: 1
    }
};

// TODO: Keep or remove?
if (query.range) { playerAttributes.range = parseFloat(query.range); }
if (query.hintMinDelay) { playerAttributes.hints.minDelay = parseInt(query.hintMinDelay); }
if (query.hintMaxDelay) { playerAttributes.hints.maxDelay = parseInt(query.hintMaxDelay); }
if (query.hintMax) { playerAttributes.hints.max = parseInt(query.hintMax); }

const INC_RANGE = "inc-range";
const INC_HINT = "inc-hint";

function powerUpRange() {
    playerAttributes.range += 10;
    console.log("Powered up range!!");
}

function powerUpHint() {
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

export { playerAttributes, createPowerUpCallback, INC_RANGE, INC_HINT }

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