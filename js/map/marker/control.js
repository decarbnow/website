import 'leaflet';

import { iconsInfo } from "./icons.js";

L.Control.Markers = L.Control.extend({
    onAdd: function(map) {
        let markerControls = L.DomUtil.create('div');
        markerControls.style.width = '400px';
        markerControls.style.height = '24px';
        markerControls.style.backgroundColor = '#fff';
        markerControls.style.display = 'flex';
        markerControls.style.flexDirection = 'row';
        markerControls.style.justifyContent = 'space-evenly';
        markerControls.style.alignItems = 'center';
        markerControls.style.paddingBottom = "0px";

        Object.values(iconsInfo).forEach((marker) => {
            let markerContainer = L.DomUtil.create('div');
            markerContainer.innerHTML = '<div class="bubble ' + marker.cssname +'"><i class="' + marker.fonticon + '"></i></div> ' + marker.title;
            markerContainer.title = marker.question + " " + marker.desc;
            markerControls.append(markerContainer);
        });

        return markerControls;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.markers = function(opts) {
    return new L.Control.Markers(opts);
};
