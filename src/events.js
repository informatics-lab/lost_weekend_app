const markerSvg = require('./question.svg');
const doneMarkerSvg = require('./done.svg');
const events = require('./eventDetails');
const gradient = require('tinygradient');
const pickRandom = require('pick-random');
import { visited } from './fog';
const geodist = require('geodist');
import { createPowerUpCallback } from './player';


let hiddenEvents = events.eventList;
let visableEvents = [];
let iconColours = gradient('#ffff00', '#ff00ec').rgb(15);
let map;

function activatedIcon() {
    return L.divIcon({
        iconAnchor: [12, 12],
        labelAnchor: [12, 12],
        popupAnchor: [0, -12],
        html: doneMarkerSvg.replace(/fill="[^"]*"/, 'fill="' + pickRandom(iconColours) + '"'),
        className: "activated_marker"
    });
}

function unactivatedIcon() {
    return L.divIcon({
        iconAnchor: [12, 12],
        labelAnchor: [12, 12],
        popupAnchor: [0, -12],
        html: markerSvg.replace(/fill="[^"]*"/, 'fill="' + pickRandom(iconColours) + '"'),
        className: "not_activated_marker"
    });
}


function makeEventMarker(evt) {
    return L.marker(evt.location, { icon: unactivatedIcon() }).bindPopup(`
            <a target="_blank" href="${evt.link}">${evt.name}</a>
    `)
}

function makePoweUpMarker(evt) {
    let callback = createPowerUpCallback(evt.details);
    let marker = L.marker(evt.location, { icon: unactivatedIcon() }).bindPopup("Vision range powered up!");
    marker.once('click', callback);
    return marker;
}


function makeEmptyMarker(evt) {
    let marker = L.marker(evt.location, { icon: unactivatedIcon() }).bindPopup(evt.details);
    marker.once('click', () => {
        setTimeout(() => {
            map.removeLayer(marker)
        }, 3000);
    });
    return marker;
}

function markerToMap(evt) {
    let marker = {
        "event": makeEventMarker,
        "powerup": makePoweUpMarker,
        "empty": makeEmptyMarker
    }[evt.type](evt);

    if (marker) {
        marker.addTo(map);
        let markAsClicked = () => marker.setIcon(activatedIcon());
        marker.once('click', markAsClicked);
    }
    return marker;
}

function addEvents(eventMap) {
    map = eventMap;
    setInterval(updateRecentlyVisable, 333);
    setInterval(updateVisable, 5000); //TODO: Batch in to 'sets' of 50-300 points so don't inturup UI?
}


function updateRecentlyVisable() {
    updateVisable(50);
}
// TODO: Reduce complexity?
function updateVisable(limit) {
    limit = limit || 0; // Limit to `limit` number of recent location events.
    limit = visited.length - 1 - limit;
    limit = (limit < 0) ? 0 : limit;
    for (var eventIdx = hiddenEvents.length - 1; eventIdx >= 0; eventIdx--) { // Loop from end since we will be removing items
        let event = hiddenEvents[eventIdx];
        for (var pointIdx = visited.length - 1; pointIdx >= limit; pointIdx--) { // Start at most recent data
            let point = visited[pointIdx];
            if (geodist(point.point, event.location, { exact: true, unit: 'meters', limit: point.range })) {
                hiddenEvents.splice(eventIdx, 1);
                event.marker = markerToMap(event);
                visableEvents.push(event);
                break;
            }
        }
    }
}

export { addEvents }