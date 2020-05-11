import { map } from 'leaflet';
import 'leaflet-sidebar';
import 'leaflet-control-geocoder';

import './geoip.js';
import twitter from './twitter.js';
import { encode } from '@alexpavlov/geohash-js';

import layers from './layers/sets.js'
import markers from './marker.js';
import url from './url.js';

let initialState = {
    zoom: 3,
    center: {
        lat: 22, // 48.2082,
        lng: 0, // 16.3738,
    },
    layers: [
        'light',
        'power-plants',
        'no2_2020_03'
    ],
}
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
    pushingState: false,
    afterFirstMove: null,

    init: function() {
        // init leaflet map
        base.map = map('map', {
            zoomControl: false,
            tap: true,
            maxZoom: 19,
        });

        // init leaflet sidebar
        base.sidebar = L.control.sidebar('sidebar', {
            closeButton: true,
            position: 'left'
        });
        base.map.addControl(base.sidebar);

        //base.addLayers()
        base.addEventHandlers()

        base.map.setView(initialState.center, initialState.zoom);

        base.layers = layers

        base.setState(url.getState())
        base.pushingState = true;
    },

    getState: function() {
        let layers = [];
        Object.keys(base.layers).forEach((k) => {
            layers.push(...base.layers[k].getActiveLayers())
        });

        return {
            center: base.map.getCenter(),
            zoom: base.map.getZoom(),
            layers: layers,
        }
    },

    setState: function(state) {
        let s = {...initialState, ...state};

        s.layers.forEach((n) => {
            base.activateLayer(n, ['tiles']);
        });

        //let p = state.center || L.GeoIP.getPosition();
        let p = state.center || s.center;
        let z = state.zoom || 10;

        base.map.flyTo(p, z);


        base.afterFirstMove = function() {
            s.layers.forEach((n) => {
                base.activateLayer(n);
            });

            if (base.layers.pollutions.getActiveLayers().length == 0)
                base.map.addLayer(base.layers.pollutions.layers['empty'])

            base.addLayers();

            base.afterFirstMove = null;
        }
    },

    activateLayer: function(id, layerSets = Object.keys(base.layers)) {
        layerSets.forEach(k => {
            let ls = base.layers[k];
            if (id in ls.layers)
                base.map.addLayer(ls.layers[id])
        });
    },

    addLayers: function() {
        // add controls
        L.control.markers({ position: 'topleft' }).addTo(base.map);
        L.control.zoom({ position: 'topleft' }).addTo(base.map);
				L.Control.geocoder({position: "topleft"}).addTo(base.map);

        var geocoder = L.Control.geocoder({
          defaultMarkGeocode: false
        })

        base.map.addLayer(markers.clusters);
        markers.init()

        L.control.layers(layers.tiles.getNameObject(), null, {
            collapsed: false
        }).addTo(base.map);

        L.control.layers(layers.pollutions.getNameObject(), layers.points.getNameObject(), {
            collapsed: false
        }).addTo(base.map);
    },

    addEventHandlers: function() {
        base.map.on("moveend", function () {

            if (base.pushingState) {
                if (base.afterFirstMove)
                    base.afterFirstMove();
                url.pushState()
            }

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

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushingState)
                url.pushState();
            return true;
        });
    }
}

export default base
