import { addFog } from './fog'
import { addEvents } from './events'

L.Mapzen.apiKey = 'odes-NxcRKWE';

// Base map
var map = L.Mapzen.map('map', {
    tangramOptions: {
        scene: 'map-style/style.yaml'
    }
});
map.setView([50.7184, -3.5339], 19);


addFog(map);
addEvents(map);