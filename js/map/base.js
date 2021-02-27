import { map } from 'leaflet';
import 'leaflet-sidebar';
import 'leaflet-contextmenu';
import 'leaflet-control-geocoder';

import './controls/LayerSelectionControl';


import './geoip.js';
import './marker/control.js';
//import twitter from './twitter.js';
import { layerSets, layers } from './layers/sets.js'
import tweets from './tweets.js';
import url from './url.js';

let defaultState = {
    zoom: 3,
    center: {
        lat: 22, // 48.2082,
        lng: 0, // 16.3738,
    },
    layers: [
        'dark',
        'power-plants',
        'no2_2020',
        'tweets',
    ],
}

let defaultOptions = {
    zoomControl: false,
    tap: true,
    maxZoom: 19
}

let contextmenuOptions = {
    contextmenu: true,
    contextmenuWidth: 200,
    contextmenuItems: [{
    //     text: 'Tweet ...',
    //     callback: function(e) {
    //         base.sidebar.hide();
    //         base.map.flyTo(e.latlng);
    //         twitter.showTweetBox(e.latlng)
    //     }
    // }, {
        text: 'Copy area link',
        callback: function(e) {
            var dummy = document.createElement('input'),
                text = window.location.href;

            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        }
    }, {
        text: 'Center here and copy area link',
        callback: function(e) {
            base.map.flyTo(e.latlng);
            $(base.map).one('moveend', function () {
                var dummy = document.createElement('input'),
                    text = window.location.href;

                document.body.appendChild(dummy);
                dummy.value = text;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
            })
        }
    }, {
        text: 'Center here ...',
        callback: function(e) {
            base.map.flyTo(e.latlng);
        }
    }]
}

let base = {
    map: null,
    sidebars: {},
    layerSets: {},
    layers: {},
    pushState: false,

    init: function() {
        // init leaflet map
        base.map = map('map', {
            ...defaultOptions,
            ...contextmenuOptions
        });

        //base.addLayers()
        base.addEventHandlers();

        base.layerSets = layerSets;
        base.layers = layers;

        tweets.init();
        base.setInitialState();
    },

    getState: function() {
        return {
            center: base.map.getCenter(),
            zoom: base.map.getZoom(),
            layers: base.getVisibleLayers(),
            tweet: tweets.activeTweet,
        }
    },

    setInitialState: function() {
        base.map.setView(defaultState.center, defaultState.zoom);
        let state = url.getState();
        if (!state.center){
          //state.center = w(0, 0, zoom = 6)
          //state.center = L.GeoIP.getPosition();
          state.center = { lat: 37, lng: 24 }
        }
        //console.log(state.center)
        base.setState({...defaultState, ...state});

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
    },

    setState: function(state) {
        base.pushState = false;
        base.flyTo(state);
        $(base.map).one('moveend', function () {
            base.showLayers(state.layers);
            base.pushState = true;
            url.pushState()
        })
    },

    flyTo: function(state) {
        // Only show tile layer in fly-to animation
        let tileLayers = Object.keys(base.layerSets.baseTiles.layers)
        let layers = state.layers.filter(x => tileLayers.includes(x))

        // Keep tweets layer
        if (state.layers.includes('tweets'))
            layers.push('tweets')

        // let layers = base.layerSets.tiles.getVisibleLayers();
        // if (layers.length == 0) {
        //     // get that in state
        //     let tileLayers = Object.keys(base.layerSets.tiles.layers)
        //     layers = state.layers.filter(x => tileLayers.includes(x))
        // }

        base.showLayers(layers);
        base.map.flyTo(state.center, state.zoom);
    },

    getSidebarCorrectedCenter: function(center, zoom) {
        let sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
        return base.map.unproject(base.map.project(center, zoom).subtract([sidebarOffset / 2, 0]), zoom);
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

        // Show
        ids.forEach((id) => {
            if(!visibleLayers.includes(id))
                base.showLayer(id);
        });

        // Hide layers visible, but not in ids
        visibleLayers.forEach((id) => {
            if (!ids.includes(id))
                base.hideLayer(id)
        });

        // Default to light tiles
        if (base.layerSets.baseTiles.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.tiles.layers['light'])

        // Default to empty overlays layer
        if (base.layerSets.overlays.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.overlays.layers['empty'])
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
        let width = $(window).width()
        // L.control.markers({ position: 'topleft' }).addTo(base.map);
        L.control.zoom({ position: 'topleft' }).addTo(base.map);

        L.Control.geocoder({
            position: 'topleft'
            // defaultMarkGeocode: false,
        }).addTo(base.map);

        L.control.layers(layerSets.baseTiles.getNameObject(), layerSets.tweets.getNameObject(), {
            position: 'topright',
            collapsed: width < 512
        }).addTo(base.map);

        L.control.layers(layerSets.overlays.getNameObject(), layerSets.points.getNameObject(), {
            position: 'topright',
            collapsed: width < 1024
        }).addTo(base.map);

        L.control.layerSelectionControl(layerSets.countries.layers, {
            position: 'topright',
            collapsed: true,
            name: 'Countries'
        }).addTo(base.map);

        // L.control.layers(null, layerSets.countries.getNameObject(), {
        //     position: 'topright',
        //     collapsed: true
        // }).addTo(base.map);

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

        // base.map.on("contextmenu", function (e) {
        //     //base.map.flyTo(e.latlng);
        //     //twitter.openSidebar(e.latlng)
        // });

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
