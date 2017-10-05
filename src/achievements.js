import { GAME_EVENT, EVENT_EVENT } from './events';
import { state } from './gameState';

let achievements = {
    'events': []
};

function createAchievements(events) {
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.type == EVENT_EVENT) {
            createEventAchievement(event)
        } else if (event.type == GAME_EVENT) {
            createGameAchievement(event);
        } else {
            console.warn("This event will not be rewarded with an achievement", event);
        }
    }
    renderAchievements();
}

function createAchievement(summary, desc, mystery, img, points, url) {
    let achievement = {
        id: summary,
        url: url,
        summary: summary,
        mystery: mystery,
        desc: desc,
        points: points,
        img: img,
        got: false
    };
    if (state.isAchievementGot(achievement)) {
        achievement.got = true;
    }
    return achievement;
}

function createEventAchievement(event) {
    achievements.events.push(createAchievement(event.summary, "Find the event " + event.summary,
        false, event.img, 1000, event.url));
}
"inc-range", "inc-hint", "nothing"

function createGameAchievement(event) {
    if (event.details === 'nothing' && !achievements.nothing) {
        achievements.nothing = createAchievement("Disappointed", "Find something that turns out to be nothing.",
            true, 'assets/star.svg', 5000);
    } else if (event.details === "inc-range" && !achievements.incRange) {
        achievements.incRange = createAchievement("Binoculars", "Increase your vision range.",
            true, 'assets/star.svg', 5000);
    } else if (event.details === "inc-hint" && !achievements.incHint) {
        achievements.incHint = createAchievement("Radar upgrade", "Increase your number of active long range hints.",
            true, 'assets/star.svg', 5000);
    }
}

function awardAchievement(event) {
    let awarded = null;
    if (event.details === 'nothing') {
        awarded = achievements.nothing;
    } else if (event.details === "inc-range") {
        awarded = achievements.incRange;
    } else if (event.details === "inc-hint") {
        awarded = achievements.incHint;
    } else {
        let achievement = achievements.events.filter(a => a.summary === event.summary);
        if (achievement.length === 1) {
            awarded = achievement[0];
        }
    }
    if (awarded) {
        awarded.got = true;
        state.setGotAchievement(awarded);
        let ele = document.getElementById(awarded.id);
        ele.className = ele.className + " got";
    }
}

function renderAchievements() {
    let container = document.getElementById("event_achievements");
    for (let i = 0; i < achievements.events.length; i++) {
        let achievement = achievements.events[i];
        container.appendChild(createDOMElement(achievement));
    }
    container = document.getElementById("other_achievements");
    for (var key in achievements) {
        if (achievements.hasOwnProperty(key) && key !== 'events') {
            var achievement = achievements[key];
            container.appendChild(createDOMElement(achievement));
        }
    }
}

function createDOMElement(achievement) {
    let div = document.createElement('div');
    let classes = "achievement";
    classes += (achievement.got) ? " got" : "";
    div.className = classes;
    div.id = achievement.id;
    div.innerHTML = `
        <img class="done" src="assets/tick.svg"/>
        <div class="wrapper">
                <div class="found img" style="background-image:url('${achievement.img}');"></div>
                <h3 class="found ">${achievement.summary}</h3>
            <div class="notfound img" style="background-image:url('assets/question-alt.svg');"></div>
            <h3 class="notfound ">&nbsp;</h3>
            <hr />
        </wrapper>
    `;
    return div;
}

export { awardAchievement, createAchievements };