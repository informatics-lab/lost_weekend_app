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
    if ([point[0] > bbox.lon.min, point[0] < bbox.lon.max, point[1] > bbox.lat.min, point[1] < bbox.lat.max].every(i => i)) {
        hide();
    } else {
        show();
    }
}

function monitor() {
    container = document.getElementById("notInAreaBanner");
    show()
    getLocationStream().subscribe(showHideInAreaBanner)
}

export { monitor }