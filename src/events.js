const events = require('./eventDetailsAuto');
const pickRandom = require('pick-random');
var dateFormat = require('dateformat');
import { randomColour } from './colours';

const geodist = require('geodist'); // TODO: Use built in leflet?
import { createPowerUpCallback, INC_HINT, INC_RANGE } from './player';
import { randomInside } from './inArea';

const NOTHING = 'nothing';
import { state, MODE_ALL, MODE_NOW, MODE_REVEAL } from './gameState';
import { doCloseHint } from './locationHints';
import { awardAchievement } from './achievements';

const HINT_AT_RANGE = 100;
const GAME_EVENT = 'gameevent';
const EVENT_EVENT = 'event';
let allEvents = events.eventList;
let hiddenEvents = [];
let map;
let markerLayer = L.layerGroup();

let tickIcon = L.icon({
    iconUrl: 'assets/tick.svg',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});

let questionIcon = L.icon({
    iconUrl: 'assets/question.svg',
    iconSize: [24, 24], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -12] // point from which the popup should open relative to the iconAnchor
});


function getActiveHiddenEvents() {
    return hiddenEvents.filter(eventCurrentlyActive);
}

function isEventType(event) {
    return event.type === EVENT_EVENT;
}

function isNotActivatedGameEvent(event) {
    return (event.type !== GAME_EVENT) || !state.isInteractedEvent(event);
}


function eventCurrentlyActive(event) {
    if (state.getMode() === MODE_ALL) {
        return true;
    } else if (state.getMode() == MODE_REVEAL) {
        return event.type === EVENT_EVENT;
    } else if (!event.times) { // Mode now but no 'times' show these (power ups).
        return true;
    } else if (state.getMode() == MODE_NOW) {
        let now = new Date();
        return (event.times.filter(t => new Date(t.start) < now && new Date(t.end) > now).length > 0);
    }
    return true;
}

function redrawEvents() {
    map.removeLayer(markerLayer);
    markerLayer = L.layerGroup();
    let toShowEvents = allEvents;
    if (state.getMode() !== MODE_REVEAL) {
        toShowEvents = toShowEvents
            .filter(eventCurrentlyActive)
            .filter(state.isFoundEvent)
            .filter(isNotActivatedGameEvent);
    } else {
        toShowEvents = toShowEvents.filter(isEventType);
    }
    toShowEvents.map(markerToMap);
    markerLayer.addTo(map);
    // Fudge to force redraw.
    if (state.getMode() !== MODE_REVEAL) {
        if (state.getMode() === MODE_ALL) {
            map.zoomIn(0.1)
        } else {
            map.zoomOut(0.11);
        }
    }
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

function makeEventMarker(evt, visited) {
    // TODO: What if not jpeg or multiple images/attachemtns?
    let imgurl = evt["img"];
    let imgtag = (imgurl) ? `<a target="_blank" href="${evt.url}"><img src="${imgurl}" alt="${evt.summary}" /></a>` : "";
    let description = evt.description;
    let maxlen = 300;
    if (description.length > maxlen) {
        description = description.substring(0, maxlen);
        description += `<a target="_blank" href="${evt.url}" title="Read more">...</a>`;
    }
    if (evt.times) {
        let timeStr = '<p>Times:</p><ul>'
        for (let i = 0; i < evt.times.length; i++) {
            let time = evt.times[i];
            timeStr += "<li>" + dateFormat(time.start, "dddd dS h:MMTT") + " - " + dateFormat(time.end, "h:MMTT") + "</li>";
        }

        timeStr += '</p>';
        description += timeStr;
    }

    let icon = (visited) ? tickIcon : questionIcon;

    return L.marker(gitterGeo(evt.geo), { icon: icon }).bindPopup(`
            <h3><a target="_blank" href="${evt.url}">${evt.summary}</a></h3>
            ${imgtag}
            <p>${description}<p>
    `)
}

function makePowerUpMarker(evt) {
    let callback = createPowerUpCallback(evt.details);
    let text = (evt.details === INC_RANGE) ? "Vision range increased." : "Hint frequency increased.";
    let marker = L.marker(evt.geo, { icon: questionIcon }).bindPopup(`<p>${text}</p>`);
    marker.once('click', callback);
    marker.once('click', () => {
        setTimeout(() => {
            markerLayer.removeLayer(marker);
        }, 3000);
    });
    return marker;
}


function makeEmptyMarker(evt) {
    let marker = L.marker(evt.geo, { icon: questionIcon }).bindPopup("<p>Sorry nothing here...</p>");
    marker.once('click', () => {
        setTimeout(() => {
            map.removeLayer(marker)
        }, 3000);
    });
    return marker;
}

function markerToMap(evt) {
    let visited = state.isInteractedEvent(evt);
    let markerCreate = {};
    markerCreate[EVENT_EVENT] = makeEventMarker;
    markerCreate[GAME_EVENT] = makeGameEventMarker;
    let marker = markerCreate[evt.type](evt, visited);

    if (marker) {
        marker.addTo(markerLayer);
        if (!visited) {
            let markAsClicked = () => {
                gtag('event', 'interacted-event', {
                    'event_id': evt.id,
                    'event_type': evt.type,
                    'event_label': (evt.summary || evt.details)
                });
                marker.setIcon(tickIcon);
                state.setInteractedEvent(evt);
                awardAchievement(evt);
            };
            marker.once('click', markAsClicked);
        }
    }
    return marker;
}

function randomGameEvent() {
    let details = [INC_HINT, INC_RANGE, NOTHING];
    return {
        'type': GAME_EVENT,
        'details': pickRandom(details)[0],
        'geo': randomInside()
    };
}

function addEvents(eventMap) {
    map = eventMap;
    hiddenEvents = allEvents.filter(event => !state.isFoundEvent(event));
    markerLayer.addTo(map);
    setInterval(updateRecentlyVisable, 333);
    setInterval(updateVisable, 5000); //TODO: Batch in to 'sets' of 50-300 points so don't inturup UI?
}


function updateRecentlyVisable() {
    updateVisable(50);
}

// TODO: Reduce complexity?
function updateVisable(limit) {
    let visited = state.getPoints();
    limit = limit || 0; // Limit to `limit` number of recent location events.
    limit = visited.length - 1 - limit;
    limit = (limit < 0) ? 0 : limit;
    for (var eventIdx = hiddenEvents.length - 1; eventIdx >= 0; eventIdx--) { // Loop from end since we will be removing items
        let event = hiddenEvents[eventIdx];
        for (var pointIdx = visited.length - 1; pointIdx >= limit; pointIdx--) { // Start at most recent data
            let point = visited[pointIdx];
            let dist = geodist(point.point, event.geo, { exact: true, unit: 'meters' });
            if (dist <= point.range * 1.1) {
                findEvent(event, eventIdx);
                break;
            } else if (dist <= HINT_AT_RANGE && eventCurrentlyActive(event)) {
                doCloseHint(event);
            }
        }
    }
}


function findEvent(event, eventIdx) {
    hiddenEvents.splice(eventIdx, 1);
    state.setFoundEvent(event);
    // register google analytics event
    gtag('event', 'found-event', {
        'event_id': event.id,
        'event_type': event.type,
        'event_label': (event.summary || event.details)
    });
    event.found = true;
    if (eventCurrentlyActive(event)) {
        event.marker = markerToMap(event);
    }
}


// TODO: hidden events == all events - found, rather than keep as extra state
export { addEvents, hiddenEvents, getActiveHiddenEvents, redrawEvents, GAME_EVENT, EVENT_EVENT, allEvents }