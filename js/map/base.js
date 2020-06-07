import { map } from 'leaflet';
import 'leaflet-sidebar';
//import 'leaflet-contextmenu';
import 'leaflet-control-geocoder';

import './geoip.js';
import './marker/control.js';
//import twitter from './twitter.js';
import { layerSets, layers } from './layers/sets.js'
import tweets from './tweets.js';
import url from './url.js';

let defaultState = {
    zoom: 6,
    center: {
        lat: 22, // 48.2082,
        lng: 0, // 16.3738,
    },
    layers: [
        'light',
        // 'power-plants',
        // 'no2_2020_03',
        'tweets',
    ],
}

let base = {
    map: null,
    sidebars: {},
    layerSets: {},
    layers: {},
    pushState: false,
    sidebarOffset: null,

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
            //         }
            //     }
            // }]
        });

        //base.addLayers()
        base.addEventHandlers();

        base.map.setView(defaultState.center, defaultState.zoom);

        base.layerSets = layerSets;
        base.layers = layers;

        tweets.init();

        let state = url.getState();

        base.setState(state);

        $(base.map).one('moveend', function () {
            let tweet = state.tweet;
            if (!state.tweet) {
                let path = url.getPath()
                //console.log(path)
                if (path in tweets.data.pathToTweetId)
                    tweet = tweets.data.pathToTweetId[path];
            }
            if (tweet)
                tweets.show(tweet);
            base.addControls();
        })
        base.sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
        // twitter.init();
        base.pushingState = true;
    },

    getState: function() {
        return {
            center: base.map.getCenter(),
            zoom: base.map.getZoom(),
            layers: base.getVisibleLayers(),
            tweet: tweets.activeTweet,
        }
    },

    setState: function(state) {
        let s = {...defaultState, ...state};
        base.pushState = false;

        let p = state.center || L.GeoIP.getPosition();
        // let p = state.center || s.center;
        // let z = state.zoom || s.zoom;

        // Only show tile layer in fly-to animation
        let layers = base.layerSets.tiles.getVisibleLayers();
        if (layers.length == 0) {
            // get that in state
            let tileLayers = Object.keys(base.layerSets.tiles.layers)
            layers = s.layers.filter(x => tileLayers.includes(x))
        }
        base.showLayers(layers);

        base.map.flyTo(p, s.zoom);

        $(base.map).one('moveend', function () {
            base.showLayers(s.layers);
            base.pushState = true;
            url.pushState()
        })
    },

    getSidebarCorrectedCenter: function(center, zoom) {
        return base.map.unproject(base.map.project(center, zoom).subtract([base.sidebarOffset / 2, 0]), zoom);
    },

    showSidebar: function(module, content = null) {
        //let sbs = [tweets, twitter]
        let sbs = [tweets]
        sbs.forEach((m) => {
            if (m != module) {
                m.sidebar.hide();
            }
        });

        module.sidebar.show();
        if (content)
            module.sidebar.setContent(content);
        return module.sidebar;
    },


    showLayers: function(ids) {
        let visibleLayers = base.getVisibleLayers()

        ids.forEach((id) => {
            base.showLayer(id);
        });

        // Hide layers visible, but not in ids
        let hide = visibleLayers.filter(x => !ids.includes(x));
        hide.forEach((id) => {
            base.hideLayer(id)
        });

        if (base.layerSets.tiles.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.tiles.layers['light'])

        if (base.layerSets.pollutions.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.pollutions.layers['empty'])
    },

    showLayer: function(id) {
        if (!base.map.hasLayer(base.layers[id]))
            base.map.addLayer(base.layers[id])
    },

    hideLayer: function(id) {
        if (base.map.hasLayer(base.layers[id]))
            base.map.removeLayer(base.layers[id])
    },

    getVisibleLayers: function() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));
    },

    addControls: function() {
        // L.control.markers({ position: 'topleft' }).addTo(base.map);
        L.control.zoom({ position: 'topleft' }).addTo(base.map);

        L.Control.geocoder({
            position: 'topleft',
            // defaultMarkGeocode: false,
        }).addTo(base.map);

        L.control.layers(layerSets.tiles.getNameObject(), null, {
            position: 'topright',
            collapsed: false
        }).addTo(base.map);

        L.control.layers(layerSets.pollutions.getNameObject(), layerSets.points.getNameObject(), {
            position: 'topright',
            collapsed: true
        }).addTo(base.map);

        // Object.values(base.sidebars).forEach(s => {
        //     base.map.addControl(s);
        // });
    },

    addEventHandlers: function() {
        base.map.on("moveend", function () {
            if (base.pushState) {
                url.pushState()
            }
        });

        base.map.on("contextmenu", function (e) {
            base.map.flyTo(e.latlng);
            //twitter.openSidebar(e.latlng)
        });

        base.map.on("click", function (e) {
            tweets.closeSidebar();
            //twitter.closeSidebar();
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushState)
                url.pushState();
            return true;
        });
    }
}

export default base
