import { redrawEvents } from './events';
import { removeFog, showFog } from './fog';
import { turnOnHints, turnOffHints } from './locationHints';

const MODE_ALL = 'all';
const MODE_NOW = 'now';
const MODE_REVEAL = 'reveal';
const GAME_STATE_STORAGE_KEY = "lwGameState";
let query = require('query-string').parse(location.search);


let storedGameState = {
    points: [],
    mode: MODE_ALL,
    recovered: false,
    foundEvents: [],
    interactedEvents: [],
    playerAttributes: {
        range: 14,
        hints: {
            minDelay: 20,
            maxDelay: 60,
            max: 1
        }
    },
    completedAchievements: []
}

try {

    var recoveredState = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (recoveredState && !query.norestore) {
        recoveredState = JSON.parse(recoveredState);
        // TODO: catch errors?
        recoveredState.recovered = true;
        if (recoveredState.points instanceof Array &&
            recoveredState.foundEvents instanceof Array &&
            recoveredState.interactedEvents instanceof Array &&
            recoveredState.completedAchievements instanceof Array &&
            recoveredState.playerAttributes.hints &&
            recoveredState.playerAttributes.range &&
            typeof(recoveredState.mode) == "string") { // TODO: verify playerAtters?
            storedGameState = recoveredState;
        }
    }
} catch (e) {
    console.error('Error loading state', e);
}

// TODO: Map should be in game state, not all over the place.

function setMode(newMode) {
    gtag('event', 'mode-change', {
        'mode': newMode
    });

    if (newMode == storedGameState.mode) {
        return;
    }
    storedGameState.mode = newMode;

    if (newMode == MODE_REVEAL) {
        removeFog();
        turnOffHints();
    } else {
        showFog();
        turnOnHints();
    }
    redrawEvents();
}

function recordPoint(point) {
    storedGameState.points.push(point);
    return point;
}

function getPoints() {
    return storedGameState.points;
}

const SAVE_DELAY = 5000;

function saveGameState() {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(storedGameState));
}

// Auto save
setInterval(saveGameState, SAVE_DELAY);
window.addEventListener("beforeunload", function(e) {
    saveGameState();
    return null;
});

let state = {
    getMode: () => storedGameState.mode,
    setMode: setMode,
    getPoints: getPoints,
    setZoom: (zoom) => storedGameState.zoom = zoom,
    getZoom: () => storedGameState.zoom,
    recordPoint: recordPoint,
    isRecovered: () => storedGameState.recovered,
    setFoundEvent: (event) => storedGameState.foundEvents.push(event.id),
    isFoundEvent: (event) => storedGameState.foundEvents.indexOf(event.id) >= 0,
    setInteractedEvent: (event) => storedGameState.interactedEvents.push(event.id),
    isInteractedEvent: (event) => storedGameState.interactedEvents.indexOf(event.id) >= 0,
    getPlayerAttributes: () => storedGameState.playerAttributes,
    setGotAchievement: (achievement) => storedGameState.completedAchievements.push(achievement.id),
    isAchievementGot: (achievement) => storedGameState.completedAchievements.indexOf(achievement.id) >= 0,
};




export { state, MODE_ALL, MODE_NOW, MODE_REVEAL };