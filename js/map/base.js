import { map } from 'leaflet';
import 'leaflet-sidebar';
//import 'leaflet-contextmenu';
import 'leaflet-control-geocoder';

import './geoip.js';
import './marker/control.js';
import twitter from './twitter.js';
import { layerSets, layers } from './layers/sets.js'
import tweets from './tweets.js';
import tweetsLegacy from './tweets.legacy.js';
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
        'no2_2020_03',
        'tweets'
    ],
}

let base = {
    map: null,
    sidebars: {},
    layerSets: {},
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
        base.addEventHandlers();

        base.map.setView(initialState.center, initialState.zoom);

        base.layerSets = layerSets;
        base.layers = layers;

        base.setState(url.getState());
        base.pushingState = true;
    },

    getState: function() {
        return {
            center: base.map.getCenter(),
            zoom: base.map.getZoom(),
            layers: base.getVisibleLayerIds(),
            tweet: tweets.activeTweet,
        }
    },

    setState: function(state) {
        let s = {...initialState, ...state};

        s.layers.forEach((n) => {
            base.showLayerId(n, ['tiles']);
        });
        // default tile layer
        if (base.layerSets.tiles.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.tiles.layers['light'])

        let p = state.center || L.GeoIP.getPosition();
        // let p = state.center || s.center;
        let z = state.zoom || 10;

        base.map.flyTo(p, z);
        base.afterNextMove = function() {
            base.finalInit(s)
            base.afterNextMove = null;
        }
    },

    showSidebar: function(mod, content = null) {
        [tweets, twitter].forEach((m) => {
            if (m != mod) {
                m.sidebar.hide();
            }
        });

        mod.sidebar.show();
        if (content)
            mod.sidebar.setContent(content);
        return module.sidebar;
    },

    finalInit: function(state) {
        state.layers.forEach((n) => {
            base.showLayerId(n);
        });
        // default polltion layer
        if (base.layerSets.pollutions.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.pollutions.layers['empty'])

        base.addControls();
        tweetsLegacy.init();
        tweets.init();
        twitter.init();

        if (state.tweet)
            tweets.openSidebar(statetweet, false)
    },

    showLayerId: function(id, layerSets = Object.keys(base.layerSets)) {
        // if (id in base.layers && !base.map.hasLayer(base.layers[id]))
        //     base.map.addLayer(base.layers[id]);

        layerSets.forEach(k => {
            console.log(k)
            let layers = base.layerSets[k].layers;
            if (id in layers && !base.map.hasLayer(layers[id]))
                base.map.addLayer(layers[id])
        });
    },

    hideLayerId: function(id, layerSets = Object.keys(base.layerSets)) {
        // if (id in base.layers && !base.map.hasLayer(base.layers[id]))
        //     base.map.removeLayer(base.layers[id]);

        layerSets.forEach(k => {
            let layers = base.layerSets[k].layers;
            if (id in layers && base.map.hasLayer(layers[id]))
                base.map.removeLayer(layers[id])
        });
    },

    getVisibleLayerIds: function() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));
    },

    addControls: function() {
        // L.control.markers({ position: 'topleft' }).addTo(base.map);
        L.control.zoom({ position: 'topleft' }).addTo(base.map);

        L.Control.geocoder({
            position: 'topleft',
            // defaultMarkGeocode: false,
        }).addTo(base.map);

        L.control.layers(layerSets.pollutions.getNameObject(), layerSets.points.getNameObject(), {
            position: 'topright',
            collapsed: false
        }).addTo(base.map);

        L.control.layers(layerSets.tiles.getNameObject(), null, {
            position: 'topright',
            collapsed: false
        }).addTo(base.map);

        // Object.values(base.sidebars).forEach(s => {
        //     base.map.addControl(s);
        // });
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
            twitter.openSidebar(e.latlng)
        });

        base.map.on("click", function (e) {
            tweets.closeSidebar();
            twitter.closeSidebar();
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushingState)
                url.pushState();
            return true;
        });
    }
}

export default base
