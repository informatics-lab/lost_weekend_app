const screenfull = require('screenfull');
let isFull = false;

function addFullScreen(map) {
    if (screenfull.enabled) {
        // TODO: move out in to file?
        var ourCustomControl = L.Control.extend({

            options: {
                position: 'topleft'
                    //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
            },

            onAdd: function(map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

                container.style.backgroundColor = 'white';
                container.style.backgroundImage = 'url("fullscreen.svg")';
                container.style.width = '24px';
                container.style.height = '24px';

                container.onclick = function() {

                    screenfull.toggle();
                }
                return container;
            }

        });
        map.addControl(new ourCustomControl());
    }

}
export { addFullScreen };