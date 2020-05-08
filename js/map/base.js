import { map } from 'leaflet';
import tiles from './tiles.js';
import 'leaflet-sidebar';

import twitter from './twitter.js';
import { encode } from '@alexpavlov/geohash-js';

import markers from './marker.js';
import url from './url.js';
import pollutionLayers from './pollutionLayers.js';
import pointLayers from './pointLayers.js';

/*var infScroll = null;
sidebar.on('shown', function () {
    infScroll = new InfiniteScroll(document.getElementById('sidebar'), {
        history: false,
        path: '.nextTweet'
        //function() {
        //    return "https://decarbnow.space/api/render/1169366632000438272";layers
        //} //'.nextTweet'
    });
});*/

let base = {
    map: null,
    sidebar: null,
    layers: {},
    init: function() {
        // init leaflet map
        base.map = map('map', {
            zoomControl: false,
            tap: true,
            maxZoom: 20
        }).setView([47, 16], 5);

        // init leaflet sidebar
        base.sidebar = L.control.sidebar('sidebar', {
            closeButton: true,
            position: 'left'
        });
        base.map.addControl(base.sidebar);

        // add controls
        L.control.markers({ position: 'topleft' }).addTo(base.map);
        L.control.zoom({ position: 'topleft' }).addTo(base.map);

        base.addLayers()
        base.addEventHandlers()
    },

    addLayers: function() {
        base.map.addLayer(markers.clusters);
        markers.init()

        base.layers['pollution'] = pollutionLayers.init()
        L.control.layers(base.layers['pollution'].overlays, null, {
            collapsed: false
        }).addTo(base.map);
        base.layers['pollution'].show('no2_2020_03')

        base.layers['point'] = pointLayers.init()
        L.control.layers(tiles, null, {
            collapsed: false
        }).addTo(base.map);

        L.control.layers(base.layers['point'].overlays,  null, {
            collapsed: false
        }).addTo(base.map);
    },

    addEventHandlers: function() {
        base.map.on("moveend", function () {
            url.stateToUrl();
        });

        base.map.on('contextmenu', function(e) {
            //console.debug(e);
            base.sidebar.hide();
            let hash = encode(e.latlng.lat, e.latlng.lng);

            if (typeof (history.pushState) != "undefined") {
                var obj = { Title: hash, Url: '/map/' + hash + '/' + 'pollution'};
                history.pushState(obj, obj.Title, obj.Url);
            } else {
                alert("Browser does not support HTML5.");
            }

            twitter.showTweetBox(e.latlng, hash)
        });

        base.map.on('baselayerchange', function (event) {
            url.stateToUrl()
            return true;
        });

        $('body').on('click', '.leaflet-control-layers-list input', function(event) {
            let t = event.target
            let l = base.map._layers[t.layerId]
            if (l && l.group) {
                //console.log(l)
                l.group.show(base.map._layers[t.layerId].id)
            }
            event.stopPropagation()
        })
    }
}

export default base
