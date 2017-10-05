import { getLocationStream } from './loc';
import { DIAGONAL_SIZE } from './inArea';
import { getActiveHiddenEvents } from './events';
import { randomColour, toRGBStr } from './colours';
import { state } from './gameState';


const pickRandom = require('pick-random');
let hintsOn = true;

let hints = [];
let hintLayer = null;
let gameMap = null;
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
            ctx.lineWidth = 4;

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
            //ctx.stroke();
            let grd = ctx.createRadialGradient(dot.x, dot.y, radius, dot.x, dot.y, 0);
            if (hint.isClose) {
                grd.addColorStop(0, 'rgba(0,85,152,0.60)');
                grd.addColorStop(0.125, 'rgba(68,173,227,0.45)');
                grd.addColorStop(0.50, 'rgba(111,0,217,0)');
            } else {

                grd.addColorStop(0, 'rgba(230,85,152,0.60)');
                grd.addColorStop(0.125, 'rgba(251,192,57,0.45)');
                grd.addColorStop(0.50, 'rgba(111,198,217,0)');
            }
            ctx.fillStyle = grd;
            ctx.fill();
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

function newHint(event, close) {
    close = close || false;
    let nPulse = (close) ? 5 : 50;
    hints.push({
        isClose: close,
        loc: event.geo,
        event: event,
        radius: 0,
        tLast: (new Date()).getTime(),
        dieAfterNPulses: nPulse,
        pulseCount: 0,
        speed: 0.8
    });
}

function addRandomHint() {
    if (hints.length >= state.getPlayerAttributes().hints.max) { // Never show more than users max hints
        return;
    }
    let toFind = getActiveHiddenEvents();
    if (toFind.length == 0) {
        return;
    }
    let event = pickRandom(toFind)[0];
    newHint(event);
}

let maxWait = 20; // Time in seconds between showing a new hint
let minWait = 5;

function hintLoop() {
    let delay = 0.1;
    if (hintsOn) {
        addRandomHint();
        let playerAttributes = state.getPlayerAttributes();
        let delay = (Math.random() * (playerAttributes.hints.maxWait - playerAttributes.hints.minWait + 1) + playerAttributes.hints.minWait);

    }
    setTimeout(hintLoop, 1000 * delay);
}

function showHints(map) {
    // This is a start up function adding the hint layer use turnOnHints() and turnOffHints() to toggle hinting.
    gameMap = map;
    // hintLayer = L.canvasLayer()
    //     .delegate(hintLayer)
    //     .addTo(map);
    // setInterval(() => hintLayer.needRedraw(), 50);


    hintLayer = L.canvasLayer()
        .delegate(locationEcho)
        .addTo(map);
    setInterval(() => hintLayer.needRedraw(), 50);
    hintLoop();
}

function turnOffHints() {
    hints = [];
    hintsOn = false;
    gameMap.removeLayer(hintLayer);
}


function turnOnHints() {
    if (!hintsOn) {
        hintLayer.addTo(gameMap);
        hintsOn = true;
    }
}

function doCloseHint(event) {
    if (hints.filter(hint => hint.event == event).length !== 0) {
        return;
    }
    newHint(event, true);
}

export { showHints, turnOffHints, turnOnHints, doCloseHint };