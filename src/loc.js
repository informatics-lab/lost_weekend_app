import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';




import { bounds } from './inArea';

const query = require('query-string').parse(location.search);


const STEP = 0.00005;
let lat_lon = [50.7184, -3.5339];
let map; // Must call init before can be accessed.
let stream; // Must call init before can be accessed.
let translate_by = [0, 0];
// let lat_lon = [ 50.719, -3.539];



function wdsaStream() {
    let keyPress = Observable.fromEvent(document, 'keydown')
        .map(evt => String.fromCharCode(evt.keyCode || evt.which))


    let goNorth = keyPress.filter(key => key == 'W').map(() => [STEP, 0]);
    let goSouth = keyPress.filter(key => key == 'S').map(() => [-STEP, 0]);
    let goEast = keyPress.filter(key => key == 'D').map(() => [0, STEP]);
    let goWest = keyPress.filter(key => key == 'A').map(() => [0, -STEP]);

    let locationStream = goNorth.merge(goSouth, goEast, goWest).map((diff) => {
        lat_lon = [lat_lon[0] + diff[0], lat_lon[1] + diff[1]];
        return lat_lon;
    });
    return locationStream;
}

function locStream() {
    let geoStream = Observable.fromEvent(map, 'locationfound');
    var locator = L.Mapzen.locator({
        position: 'bottomright',
        drawCircle: (!query.translate) ? true : false,
        setView: (!query.translate) ? 'untilPan' : false,
        drawMarker: (!query.translate) ? true : false,
        keepCurrentZoomLevel: true,
        locateOptions: {
            watch: true,
            enableHighAccuracy: true
        },
        markerStyle: {
            color: '#FF00FF',
            opacity: 0.8
        }
    });
    locator.addTo(map).start();
    geoStream = geoStream.map(geo => [geo.latlng.lat, geo.latlng.lng]);
    geoStream.map(geo => [geo.latlng.lat, geo.latlng.lng])
    if (query.translate) {
        geoStream.first().subscribe(updateTranslate);
        geoStream = geoStream.map(translate);
    }
    return geoStream;
}

function updateTranslate(centerOn) {
    let falseCenter = bounds.getCenter();
    translate_by = [centerOn[0] - falseCenter.x, centerOn[1] - falseCenter.y];
    if (map) {
        map.setView(new L.LatLng(falseCenter.x, falseCenter.y));
    }
}

function translate(latLon) {
    return [latLon[0] - translate_by[0], latLon[1] - translate_by[1]];
}

function getLocationStream(map) {
    return stream;
}

function setMap(gameMap) {
    map = gameMap;
    stream = (query.wsda) ? wdsaStream() : locStream(map);
}

export { setMap, getLocationStream, lat_lon };