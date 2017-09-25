import { getLocationStream } from './loc'
import { state } from './gameState';

var map = null;
let fogLayer = null;

function updateFog(pos) {
    let round = (val) => Math.round(val * 10000) / 10000;
    let THRESHOLD = 0.0001;
    let point = { lat: round(pos[0]), lon: round(pos[1]) }
    let points = state.getPoints();
    if (points.length > 0) {
        let last = points[points.length - 1]
        if (Math.abs(last.lon - point.lon) < THRESHOLD && Math.abs(last.lat - point.lat) < THRESHOLD) { // TODO: Move to location stream
            return;
        }
    }
    let pointDetails = {
        point: new L.LatLng(point.lat, point.lon),
        range: state.getPlayerAttributes().range
    };
    state.recordPoint(pointDetails);
}

let fog = {
    onDrawLayer: function(info) {
        var ctx = info.canvas.getContext('2d');
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);

        // Draw path/sight
        let points = state.getPoints();
        if (points.length >= 1) {
            var y = info.layer._map.getSize().y,
                x = info.layer._map.getSize().x;

            var maxMeters = info.layer._map.containerPointToLatLng([0, y]).distanceTo(info.layer._map.containerPointToLatLng([x, y]));
            var meterPerPixel = maxMeters / x;

            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "rgba(255,255,255, 1)";

            for (var i = 0; i < points.length; i++) {
                let p = points[i].point;
                let range = points[i].range;
                let dot = info.layer._map.latLngToContainerPoint(p);
                let size = range / meterPerPixel;
                ctx.fillStyle = "rgba(255,255,255, 1)";
                ctx.beginPath();
                ctx.rect(dot.x - size, dot.y - size, 2 * size, 2 * size);
                ctx.fill();
                ctx.closePath();
            }

        }

        // subtract full screen rectangle from path to create reveal in the fog. 
        ctx.globalCompositeOperation = "xor";
        ctx.beginPath();
        ctx.rect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = "rgba(32,28,64, 1)";
        ctx.fill();
    }
};


function addFog(mainMap) {
    map = mainMap;
    // TODO: on get location fail?

    fogLayer = L.canvasLayer()
        .delegate(fog) // -- if we do not inherit from L.CanvasLayer we can setup a delegate to receive events from L.CanvasLayer
        .addTo(map);



    map.on('movestart', hideTiles);
    map.on('moveend', showTiles);
    map.on('zoomstart', hideTiles);
    map.on('zoomend', showTiles);

    let locationStream = getLocationStream();
    locationStream.subscribe(updateFog);
    locationStream.subscribe(() => fogLayer.needRedraw());

}

let tileContainer;

function hideTiles() {
    tileContainer = tileContainer || document.getElementsByClassName('leaflet-tile-pane')[0];
    if (tileContainer) {
        tileContainer.style.display = "none";
    }
}

function showTiles() {
    if (tileContainer) {
        tileContainer.style.display = "";
    }
}

function removeFog() {
    map.removeLayer(fogLayer);
}

function showFog() {
    fogLayer.addTo(map);
}

export { addFog, hideTiles, showTiles, removeFog, showFog }