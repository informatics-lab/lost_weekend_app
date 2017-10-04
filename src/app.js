import 'babel-polyfill';
import { addFog } from './fog'
import { addEvents, allEvents } from './events'
import { setMap, lat_lon } from './loc';
import { monitor } from './inArea';
import { showHints } from './locationHints';
import { addFullScreen } from './fullscreen';
import { activateMenus } from './menus';
import { onLoadComplete } from './welcome';
import { createAchievements } from './achievements';
import { state } from './gameState';

let zoom = state.getZoom();
let points = state.getPoints();
let startLoc = ((points.length >= 1) ? points[points.length - 1].point : [50.7184, -3.5339]);

L.Mapzen.apiKey = 'mapzen-HeeC3NH';
// Base map
var map = L.Mapzen.map('map', {
    minZoom: 15,
    maxZoom: 19,
    tangramOptions: {
        scene: 'map-style.yaml'
    }
});
map.setView(startLoc, zoom || 18);
map.on('zoomend', (evt) => state.setZoom(evt.target._zoom));
setMap(map);
addFog(map);
addEvents(map);
showHints(map);
monitor();
addFullScreen(map);
activateMenus();
createAchievements(allEvents);


// Analytics for menus etc
let attr = 'data-click-analytic';

function recordClickAnalytic(e) {
    let val = e.currentTarget.getAttribute(attr);
    gtag('event', 'click', {
        'value': val,
    });
}
let elements = document.querySelectorAll(`[${attr}]`);
for (var i = 0; i < elements.length; i++) {
    var ele = elements[i];
    ele.addEventListener('click', recordClickAnalytic);
}

setTimeout(onLoadComplete(), 3000);