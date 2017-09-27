import { addFog } from './fog'
import { addEvents, allEvents } from './events'
import { setMap, lat_lon } from './loc';
import { monitor } from './inArea';
import { showHints } from './locationHints';
import { addFullScreen } from './fullscreen';
import { activateMenus } from './menus';
import { onLoadComplete } from './welcome';
import { createAchievements } from './achievements';

L.Mapzen.apiKey = 'mapzen-HeeC3NH';

// Base map
var map = L.Mapzen.map('map', {
    minZoom: 15,
    maxZoom: 19,
    tangramOptions: {
        scene: 'map-style.yaml'
    }
});
map.setView(lat_lon, 19);
setMap(map);
addFog(map);
addEvents(map);
showHints(map);
monitor();
addFullScreen(map);
activateMenus();
createAchievements(allEvents);

onLoadComplete();