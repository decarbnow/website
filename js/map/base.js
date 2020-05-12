import { map } from 'leaflet';
import 'leaflet-sidebar';
//import 'leaflet-contextmenu';
import 'leaflet-control-geocoder';

import './geoip.js';
import './marker/control.js';
import twitter from './twitter.js';


import layers from './layers/sets.js'
import tweets from './tweets.js';
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
        //    return "https://decarbnow.space/api/render/1169366632000438272";
        //} //'.nextTweet'
    });
});*/

let base = {
    map: null,
    sidebars: {},
    layers: {},
    pushingState: false,
    afterNextMove: null,

    init: function() {
        // init leaflet map
        base.map = map('map', {
            zoomControl: false,
            tap: true,
            maxZoom: 19,
            // contextmenu: true,
            // contextmenuWidth: 140,
            // contextmenuItems: [{
            //     text: 'Tweet ...',
            //     callback: function(e) {
            //         base.sidebar.hide();
            //         base.map.flyTo(e.latlng);
            //         twitter.showTweetBox(e.latlng)
            //     }
            // }, {
            //     text: 'Copy View Link',
            //     callback: function(e) {
            //         base.map.flyTo(e.latlng);
            //         base.afterNextMove = function() {
            //             url.pushState();
            //
            //             var dummy = document.createElement('input'),
            //                 text = window.location.href;
            //
            //             document.body.appendChild(dummy);
            //             dummy.value = text;
            //             dummy.select();
            //             document.execCommand('copy');
            //             document.body.removeChild(dummy);
            //
            //             base.afterNextMove = null;
            //         }
            //     }
            // }]
        });

        //base.addLayers()
        base.addEventHandlers()

        base.map.setView(initialState.center, initialState.zoom);

        base.layers = layers

        base.setState(url.getState())
        base.pushingState = true;
    },

    showSidebar: function(id) {
        Object.keys(base.sidebars).forEach(k => {
            if (k != id)
                base.sidebars[k].hide();
        })
        let s = base.sidebars[id];
        s.show();
        return s;
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
        // default tile layer
        if (base.layers.tiles.getActiveLayers().length == 0)
            base.map.addLayer(base.layers.tiles.layers['light'])

        let p = state.center || L.GeoIP.getPosition();
        // let p = state.center || s.center;
        let z = state.zoom || 10;

        base.map.flyTo(p, z);
        base.afterNextMove = function() {
            s.layers.forEach((n) => {
                base.activateLayer(n);
            });
            // default polltion layer
            if (base.layers.pollutions.getActiveLayers().length == 0)
                base.map.addLayer(base.layers.pollutions.layers['empty'])

            base.addControls();
            tweets.init()

            base.afterNextMove = null;
        }
    },

    activateLayer: function(id, layerSets = Object.keys(base.layers)) {
        layerSets.forEach(k => {
            let ls = base.layers[k];
            if (id in ls.layers)
                base.map.addLayer(ls.layers[id])
        });
    },

    addControls: function() {
        // L.control.markers({ position: 'topleft' }).addTo(base.map);
        L.control.zoom({ position: 'topleft' }).addTo(base.map);

        L.Control.geocoder({
            position: 'topleft',
            // defaultMarkGeocode: false,
        }).addTo(base.map);

        L.control.layers(layers.pollutions.getNameObject(), layers.points.getNameObject(), {
            position: 'topright',
            collapsed: false
        }).addTo(base.map);

        L.control.layers(layers.tiles.getNameObject(), null, {
            position: 'topright',
            collapsed: false
        }).addTo(base.map);



        // init leaflet sidebars
        base.sidebars = {
            'show-tweet': L.control.sidebar('sidebar', {
                closeButton: true,
                position: 'left'
            }),
            'new-tweet': L.control.sidebar('new-tweet-sidebar', {
                closeButton: true,
                position: 'left'
            })
        }

        base.sidebars['new-tweet'].on('hide', function () {
            twitter.marker.remove()
        });

        Object.values(base.sidebars).forEach(s => {
            base.map.addControl(s);
        });
    },

    addEventHandlers: function() {
        base.map.on("moveend", function () {
            if (base.pushingState) {
                if (base.afterNextMove)
                    base.afterNextMove();
                url.pushState()
            }
        });

        base.map.on("contextmenu", function (e) {
            base.map.flyTo(e.latlng);
            twitter.showTweetSidebar(e.latlng)
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushingState)
                url.pushState();
            return true;
        });
    }
}

export default base
