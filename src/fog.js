import { getLocationStream } from './loc'
import { playerAttributes } from './player';


var points = [];

function updateFog(pos) {
    var THRESHOLD = 0.0001;
    var point = { lat: pos[0], lon: pos[1] }
    if (points.length > 0) {
        var last = points[points.length - 1]
        if (Math.abs(last.lon - point.lon) < THRESHOLD && Math.abs(last.lat - point.lat) < THRESHOLD) { // TODO: Move to location stream
            return;
        }
    }
    points.push({
        point: new L.LatLng(point.lat, point.lon),
        range: playerAttributes.range
    });
}

let fog = {
    onDrawLayer: function(info) {
        var ctx = info.canvas.getContext('2d');
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);

        // Draw path/sight
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

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, range / meterPerPixel, 0, Math.PI * 2);
                ctx.fill()
                ctx.closePath();

            }

        }

        // subtract full screen rectangle from path to create reveal in the fog. 
        ctx.globalCompositeOperation = "xor"
        ctx.beginPath();
        ctx.rect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = "rgba(0,0,0, 1)";
        ctx.fill();
    }
};


function addFog(map) {

    // TODO: on get location fail?

    var fogLayer = L.canvasLayer()
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

export { addFog, points as visited, hideTiles, showTiles }