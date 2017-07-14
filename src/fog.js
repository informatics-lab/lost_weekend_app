import { getLocationStream } from './loc'
import { playerAttributes } from './player';


var points = [
    { point: new L.LatLng(50.7184, -3.5339), range: playerAttributes.range }
]

function updateFog(pos) {
    var THRESHOLD = 0.0001;
    var point = { lat: pos[0], lon: pos[1] }
    if (points.length > 0) {
        var last = points[points.length - 1]
        if (Math.abs(last.lon - point.lon) < THRESHOLD && Math.abs(last.lat - point.lat) < THRESHOLD) {
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

        if (points.length >= 1) {
            // TODO: calc only on zoom change?
            // Get the y,x dimensions of the map
            var y = info.layer._map.getSize().y,
                x = info.layer._map.getSize().x;
            // calculate the distance the one side of the map to the other using the haversine formula
            var maxMeters = info.layer._map.containerPointToLatLng([0, y]).distanceTo(info.layer._map.containerPointToLatLng([x, y]));
            // calculate how many meters each pixel represents
            var meterPerPixel = maxMeters / x;

            // var first = info.layer._map.latLngToContainerPoint(points[0].point);
            // var last = info.layer._map.latLngToContainerPoint(points[points.length - 1].point);

            ctx.globalCompositeOperation = "source-over";
            //ctx.beginPath();
            ctx.fillStyle = "rgba(0,0,222, 1)";
            //ctx.strokeStyle = "rgba(0,222,222, 1)";
            ///ctx.lineWidth = 23;

            // ctx.beginPath();
            // ctx.arc(first.x, first.y, markerSize / 2, 0, Math.PI * 2);
            // ctx.fill()
            // ctx.closePath();

            // ctx.beginPath();
            // ctx.moveTo(first.x, first.y);
            for (var i = 0; i < points.length; i++) {
                let p = points[i].point;
                let range = points[i].range;
                let dot = info.layer._map.latLngToContainerPoint(p);

                // ctx.lineTo(dot.x, dot.y);
                // ctx.stroke();
                // ctx.closePath();

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, (range / meterPerPixel) / 2, 0, Math.PI * 2);
                ctx.fill()
                ctx.closePath();

                // ctx.beginPath();
                // ctx.moveTo(dot.x, dot.y);
            }
            // ctx.closePath();
        }


        ctx.globalCompositeOperation = "xor"
        ctx.beginPath();
        ctx.rect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = "rgba(32,32,32, 1)";
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

    let locationStream = getLocationStream(map);
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

export { addFog, points as visited }