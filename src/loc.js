import Rx from 'rxjs/Rx';

const STEP = 0.00005;
let lat_lon = [50.7184, -3.5339];

let keyPress = Rx.Observable.fromEvent(document, 'keydown')
    .map(evt => String.fromCharCode(evt.keyCode || evt.which))


let goNorth = keyPress.filter(key => key == 'W').map(() => [STEP, 0]);
let goSouth = keyPress.filter(key => key == 'S').map(() => [-STEP, 0]);
let goEast = keyPress.filter(key => key == 'D').map(() => [0, STEP]);
let goWest = keyPress.filter(key => key == 'A').map(() => [0, -STEP]);

let locationStream = Rx.Observable.merge(goNorth, goSouth, goEast, goWest).map((diff) => {
    lat_lon = [lat_lon[0] + diff[0], lat_lon[1] + diff[1]];
    return lat_lon;
});

function getLocationStream(map) {
    // Locator
    // var locator = L.Mapzen.locator({
    //     position: 'bottomright',
    //     drawCircle: true,
    //     follow: true,
    //     drawMarker: true,
    //     markerStyle: {
    //         opacity: 0.8
    //     }
    // });
    // locator.addTo(map).start();
    return locationStream
}
//location.subscribe(console.log);
export { getLocationStream };