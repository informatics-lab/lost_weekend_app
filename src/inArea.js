import { getLocationStream } from './loc';
import { hideTiles, showTiles } from './fog';
let isShown = false;
let container;

const bbox = {
    lon: {
        min: -3.5414834194,
        max: -3.5217404366
    },
    lat: {
        min: 50.7160938261,
        max: 50.7262963402
    }
}

const bounds = L.bounds([bbox.lat.max, bbox.lon.max], [bbox.lat.min, bbox.lon.min]);

const DIAGONAL_SIZE = new L.LatLng(bbox.lat.min, bbox.lon.min).distanceTo(new L.LatLng(bbox.lat.max, bbox.lon.max));


function randomInside() {
    return {
        lat: Math.random() * (bbox.lat.max - bbox.lat.min) + bbox.lat.min,
        lon: Math.random() * (bbox.lon.max - bbox.lon.min) + bbox.lon.min
    }
}

function show() {
    if (!isShown) {
        container.style.display = 'block';
        hideTiles();
        isShown = true;
    }
}

function hide() {
    if (isShown) {
        container.style.display = 'none';
        showTiles();
        isShown = false;
    }
}

function showHideInAreaBanner(point) {
    // TODO: us leflet http: //leafletjs.com/reference-1.1.0.html#latlngbounds?
    if (bounds.contains(point)) {
        hide();
    } else {
        show();
    }
}

function monitor() {
    container = document.getElementById("notInAreaBanner");
    isShown = container.style.display === 'none';
    show()
    getLocationStream().subscribe(showHideInAreaBanner) // TODO: check every so often not constantly on move?
}

export { monitor, DIAGONAL_SIZE, randomInside, bounds }