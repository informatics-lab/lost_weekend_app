import { getLocationStream } from './loc';
import { hideTiles, showTiles } from './fog';
let isShown;
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
    if (isShown !== true) {
        container.style.display = 'block';
        container.className += "not_in_area";
        not_in_area
        hideTiles();
        isShown = true;
    }
}

function hide() {
    if (isShown !== false) {
        container.style.display = 'none';
        container.className = container.className.replace(/not_in_area/g, "");
        not_in_area
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
    container = document.getElementById("mapInfoBanner");
    getLocationStream().subscribe(showHideInAreaBanner); // TODO: check every so often not constantly on move?
}

export { monitor, DIAGONAL_SIZE, randomInside, bounds }