import { addFog } from './fog'
import { addEvents } from './events'
import { lat_lon } from './loc';
import { monitor } from './inArea';
import { showHints } from './locationHints';
import { setMap } from './loc';
import { addFullScreen } from './fullscreen';
import { activateMenus } from './menus';
import { onLoadComplete } from './welcome';

L.Mapzen.apiKey = 'mapzen-HeeC3NH';

// Base map
var map = L.Mapzen.map('map', {
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

onLoadComplete();