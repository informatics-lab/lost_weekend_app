let playerAttributes = {
    range: 7
}

function powerUpRange() {
    playerAttributes.range += 10;
    console.log("Powered up!!");
}

function createPowerUpCallback(type) {
    // TODO: Check type 
    return powerUpRange
}

export { playerAttributes, createPowerUpCallback }

//TODO: remove these short cuts:
window.range = powerUpRange;