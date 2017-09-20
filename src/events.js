const markerSvg = require('./question.svg');
const doneMarkerSvg = require('./done.svg');
const events = require('./eventDetailsAuto');
const pickRandom = require('pick-random');
import { randomColour } from './colours';
import { visited } from './fog';
const geodist = require('geodist'); // TODO: Use built in leflet?
import { createPowerUpCallback, INC_HINT, INC_RANGE } from './player';
import { randomInside } from './inArea';
const NOTHING = 'nothing';
import { state, MODE_ALL, MODE_NOW, MODE_REVEAL } from './gameState';



let allEvents = events.eventList;
let foundEvents = [];
let hiddenEvents = allEvents.slice();
let map;
let markerLayer = L.layerGroup();

function getActiveHideEvents() {
    return hiddenEvents.filter(eventCurrentlyActive);
}

function eventCurrentlyActive(event) {
    if (!event.times) {
        return true;
    } else if (state.getMode() == MODE_ALL) {
        return true;
    } else if (state.getMode() == MODE_NOW) {
        let now = new Date();
        return (event.times.filter(t => new Date(t.start) < now && new Date(t.end) > now).length > 0);
    }
    return true;
}

function redrawEvents() {
    console.log('redraw');
    map.removeLayer(markerLayer);
    markerLayer = L.layerGroup();
    let events = (state.getMode() == MODE_REVEAL) ? allEvents : foundEvents;
    let displayEvents = events.filter(eventCurrentlyActive);
    console.log(displayEvents);
    displayEvents.map(markerToMap);
    markerLayer.addTo(map);
}

function activatedIcon() {
    return L.divIcon({
        iconAnchor: [12, 12],
        labelAnchor: [12, 12],
        popupAnchor: [0, -12],
        html: doneMarkerSvg.replace(/fill="[^"]*"/, 'fill="' + randomColour() + '"'),
        className: "activated_marker"
    });
}

function unactivatedIcon() {
    return L.divIcon({
        iconAnchor: [12, 12],
        labelAnchor: [12, 12],
        popupAnchor: [0, -12],
        html: markerSvg.replace(/fill="[^"]*"/, 'fill="' + randomColour() + '"'),
        className: "not_activated_marker"
    });
}

function gitterGeo(geo) {
    // Randommly offset the location a litle to prevent identical locations overlaying.
    // TODO: Somthing more intelligant rather than random.
    let scale = 0.0003
    return {
        lat: geo.lat + scale * Math.random() - scale / 2,
        lon: geo.lon + scale * Math.random() - scale / 2
    }
}

function makeGameEventMarker(evt) {
    return (evt.details === NOTHING) ? makeEmptyMarker(evt) : makePowerUpMarker(evt)
}

function makeEventMarker(evt) {
    // TODO: What if not jpeg or multiple images/attachemtns?
    let imgurl = evt["img"];
    let imgtag = (imgurl) ? `<a target="_blank" href="${evt.url}"><img src="${imgurl}" alt="${evt.summary}" style="width:100%;" /></a>` : "";
    let description = evt.description;
    let maxlen = 300;
    if (description.length > maxlen) {
        description = description.substring(0, maxlen);
        description += `<a target="_blank" href="${evt.url}" title="Read more">...</a>`;
    }

    return L.marker(gitterGeo(evt.geo), { icon: unactivatedIcon() }).bindPopup(`
            ${imgtag}
            <h3><a target="_blank" href="${evt.url}">${evt.summary}</a></h3>
            <p>${description}<p>
    `)
}

function makePowerUpMarker(evt) {
    let callback = createPowerUpCallback(evt.details);
    let text = (evt.details === INC_RANGE) ? "Vision range increased." : "Hint frequency increased.";
    let marker = L.marker(evt.geo, { icon: unactivatedIcon() }).bindPopup(text);
    marker.once('click', callback);
    return marker;
}


function makeEmptyMarker(evt) {
    let marker = L.marker(evt.geo, { icon: unactivatedIcon() }).bindPopup("Sorry nothing here...");
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
        "gameevent": makeGameEventMarker
    }[evt.type](evt);

    if (marker) {
        marker.addTo(markerLayer);
        let markAsClicked = () => marker.setIcon(activatedIcon());
        marker.once('click', markAsClicked);
    }
    return marker;
}

function randomGameEvent() {
    let details = [INC_HINT, INC_RANGE, NOTHING];
    return {
        'type': 'gameevent',
        'details': pickRandom(details)[0],
        'geo': randomInside()
    };
}

function addEvents(eventMap) {
    map = eventMap;
    markerLayer.addTo(map);
    let count = hiddenEvents.length;
    for (let i = 0; i < count; i++) { // TODO: Half the events are game actions. Is this the correct ratio.
        hiddenEvents.push(randomGameEvent());
    }
    //TODO: add random powerups and 'nothing' events.
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
            if (geodist(point.point, event.geo, { exact: true, unit: 'meters', limit: point.range })) {
                hiddenEvents.splice(eventIdx, 1);
                foundEvents.push(event);
                event.found = true;
                if (eventCurrentlyActive(event)) {
                    event.marker = markerToMap(event);
                }
                break;
            }
        }
    }
}


// TODO: hidden events == all events - found, rather than keep as extra state
export { addEvents, hiddenEvents, getActiveHideEvents, redrawEvents }