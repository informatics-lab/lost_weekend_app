const gradient = require('tinygradient');
const pickRandom = require('pick-random');

let colours = gradient('#ffff00', '#ff00ec').rgb(15);

function randomColour() {
    return pickRandom(colours)[0];
}

function toRGBStr(colour) {
    return Math.round(colour._r) + "," + Math.round(colour._g) + "," + Math.round(colour._b);
}
export { randomColour, toRGBStr };