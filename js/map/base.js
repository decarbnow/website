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


let dmap = {
    map: null,
    sidebar: null,
    layers: {},
    init: function() {
        dmap.map = map('map', {
            zoomControl: false, // manually added
            tap: true,
            maxZoom: 20
        }).setView([47, 16], 5);

        // INIT SIDEMAP
        dmap.sidebar = L.control.sidebar('sidebar', {
            closeButton: true,
            position: 'left'
        });

        dmap.map.on("moveend", function () {
            url.stateToUrl();
        });

        dmap.map.on('contextmenu', function(e) {
            //console.debug(e);
            dmap.sidebar.hide();
            let hash = encode(e.latlng.lat, e.latlng.lng);

            if (typeof (history.pushState) != "undefined") {
                var obj = { Title: hash, Url: '/map/' + hash + '/' + 'pollution'};
                history.pushState(obj, obj.Title, obj.Url);
            } else {
                alert("Browser does not support HTML5.");
            }

            twitter.showTweetBox(e.latlng, hash)
        });

        dmap.map.on('baselayerchange', function (event) {
            url.stateToUrl()
            return true;
        });

        L.control.markers({ position: 'topleft' }).addTo(dmap.map);
        L.control.zoom({ position: 'topleft' }).addTo(dmap.map);
        dmap.map.addLayer(markers.clusters);
        dmap.map.addControl(dmap.sidebar);

        dmap.load()

        url.stateFromUrl();
    },

    load: function() {
        markers.init()

        dmap.layers['pollution'] = pollutionLayers.init()
        L.control.layers(dmap.layers['pollution'].overlays, null, {
            collapsed: false
        }).addTo(dmap.map);
        dmap.layers['pollution'].show('no2_2020_03')

        dmap.layers['point'] = pointLayers.init()
        L.control.layers(tiles, dmap.layers['point'].overlays, {
            collapsed: false
        }).addTo(dmap.map);

        $('body').on('click', '.leaflet-control-layers-list input', function(event) {
            //console.log(event.target)
            //console.log(event.target.layerId)
            let l = dmap.map._layers[event.target.layerId]
            //console.log(l)
            l.group.show(dmap.map._layers[event.target.layerId].id)
            event.stopPropagation()
        })
    }
}

export default dmap
