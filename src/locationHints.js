import { getLocationStream } from './loc';
import { DIAGONAL_SIZE } from './inArea';
import { getActiveHideEvents } from './events';
import { playerAttributes } from './player'
import { randomColour, toRGBStr } from './colours';


const pickRandom = require('pick-random');


let hints = [];

let locationEcho = {

    drawHint: function(ctx, hint, map) {
        // ctx.fillStyle = "rgba(55,255,128, 1)";
        let dot = map.latLngToContainerPoint(hint.loc);
        let tNow = (new Date()).getTime();
        let dt = tNow - hint.tLast;
        let radius = hint.radius + hint.speed * dt;
        let alpha = 1 - hint.radius * this.meterPerPixel / DIAGONAL_SIZE
        if (alpha > 0) {
            ctx.strokeStyle = 'rgba(' + hint.colorStr + ',' + alpha + ')';
            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            // ctx.fill();
            ctx.closePath();
        } else {
            hint.pulseCount += 1;
            radius = 0;
        }
        hint.tLast = tNow;
        hint.radius = radius;
        if (radius * this.meterPerPixel > DIAGONAL_SIZE) {

        }
    },
    onDrawLayer: function(info) {
        let ctx = info.canvas.getContext('2d');

        // TODO: only calc on change of zoom / resize?
        let y = info.layer._map.getSize().y;
        let x = info.layer._map.getSize().x;
        let maxMeters = info.layer._map.containerPointToLatLng([0, y]).distanceTo(info.layer._map.containerPointToLatLng([x, y]));
        this.meterPerPixel = maxMeters / x;
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);

        hints = hints
            .filter(hint => hint.pulseCount < hint.dieAfterNPulses)
            .filter(hint => !hint.event.found);
        hints.forEach(hint => this.drawHint(ctx, hint, info.layer._map), this);
    }
};

function newHint(event) {
    hints.push({
        loc: event.geo,
        event: event,
        radius: 0,
        tLast: (new Date()).getTime(),
        dieAfterNPulses: 50,
        pulseCount: 0,
        speed: 0.5,
        colorStr: toRGBStr(randomColour())
    });
}

function addRandomHint() {
    if (hints.length >= playerAttributes.hints.max) { // Never show more than users max hints
        return;
    }
    let toFind = getActiveHideEvents();
    if (toFind.length == 0) {
        return;
    }
    let event = pickRandom(toFind)[0];
    newHint(event);
}

let maxWait = 20; // Time in seconds between showing a new hint
let minWait = 5;

function hintLoop() {
    addRandomHint();
    let delay = (Math.random() * (playerAttributes.hints.maxWait - playerAttributes.hints.minWait + 1) + playerAttributes.hints.minWait);
    setTimeout(hintLoop, 1000 * delay);
}

function showHints(map) {
    var echoLayer = L.canvasLayer()
        .delegate(locationEcho)
        .addTo(map);

    setInterval(() => echoLayer.needRedraw(), 50);
    hintLoop();
}

export { showHints };