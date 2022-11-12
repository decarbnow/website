import { map } from 'leaflet';
import 'leaflet-sidebar';
import 'leaflet-contextmenu';
import 'leaflet-control-geocoder';
import './controls/LayerSelectionControl';
import './geoip.js';
import './marker/control.js';
import { layerSets, layers } from './layers/sets.js';
import tweets from './tweets.js';
import url from './url.js';
import twitter from './twitter.js';
import 'leaflet-control-window';
//import 'leaflet.select-layers';

let defaultState = {
    zoom: 3,
    center: {
        lat: 22,
        lng: 0,
    },
    layers: [
        'dark',
        'power-plants',
        'manufacturing',
        'fossil-fuel-operations',
        'no2_2021',
        'tweets',
    ],
}

let defaultOptions = {
    zoomControl: false,
    tap: true,
    maxZoom: 19,
    touchZoom: 'center'
}

let crosshairIcon = L.icon({
    iconUrl: '../../static/crosshair.png',
    iconSize:     [80, 80], // size of the icon
    iconAnchor:   [40, 40], // point of the icon which will correspond to marker's location
});

L.Circle.include({
  contains: function (latLng) {
    return this.getLatLng().distanceTo(latLng) < this.getRadius();
  }
});

let tweetBoxActive = false;

let radius_zoom = [1,1,1,1,2.5,4,5.5,7.5,9.8,12.5,15.4,19,23,27.2,32,37.2,40,40,40,40,40];

let slowFlyTo = false;

let contextmenuOptions = {
    contextmenu: false,
    contextmenuWidth: 200,
    contextmenuItems: [{
        text: 'Tweet here ...',
        callback: function(e) {
            tweets.sidebar.hide();
            base.map.flyTo(e.latlng);
            twitter.showTweetBox(e);
            base.tweetBoxActive = true
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
    crosshair: L.marker(null, {icon: crosshairIcon, interactive:false}),
    layers: {},
    pushState: false,

    init: function() {
        // init leaflet map
        base.map = map('map', {
            ...defaultOptions,
            ...contextmenuOptions
        });

        base.addEventHandlers();

        base.layerSets = layerSets;
        base.layers = layers;



        tweets.init();
        twitter.init();
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

    radius_zoom: function() {
        return radius_zoom
    },

    setInitialState: function() {
        base.map.setView(defaultState.center, defaultState.zoom);
        let state = url.getState();
        if (!state.center){
            state.center = { lat: 37, lng: 24 }
        }

        base.setState({...defaultState, ...state});

        let tweet = state.tweet;

        $(base.map).one('moveend', function () {

            if (!state.tweet) {
                let path = url.getPath()

                if (path in tweets.data.pathToTweetId)
                    tweet = tweets.data.pathToTweetId[path];
            }

            if (tweet)
                tweets.show(tweet);

            base.addControls();

        })
        base.showCrosshair();
    },

    setState: function(state){
        base.pushState = false;
        base.flyTo(state);
        $(base.map).one('moveend', function () {
            base.showLayers(state.layers);
            base.pushState = true;
            url.pushState();
        })
    },

    flyTo: function(state) {
        // Only show tile layer in fly-to animation
        let tileLayers = Object.keys(base.layerSets.baseTiles.layers)
        let layers = state.layers.filter(x => tileLayers.includes(x))

        // Keep tweets layer
        if (state.layers.includes('tweets'))
            layers.push('tweets')

        base.showLayers(layers);

        if(slowFlyTo){
            base.map.flyTo(state.center, state.zoom, {noMoveStart: true});
        } else {
            base.map.flyTo(state.center, state.zoom, {noMoveStart: true, duration: 1});
            slowFlyTo = true
        }
    },

    getSidebarCorrectedCenter: function(center, zoom) {
        let sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
        return base.map.unproject(base.map.project(center, zoom).add([sidebarOffset / 2, 0]), zoom); //substract when sidebar on the left
    },

    showSidebar: function(module, content = null) {
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

    showControlwindow: function(module, content = null, title = null) {
        let sbs = [tweets]
        sbs.forEach((m) => {
            if (m != module) {
                m.controlwindow.hide();
            }
        });

        if (content){
            module.controlwindow.content(content)
        }

        if (title){
            module.controlwindow.title(title)
        }

        module.controlwindow.show('topRight')

        return module.controlwindow;
    },


    showPopup: function(module, content = null) {
        let sbs = [tweets]
        sbs.forEach((m) => {
            if (m != module) {
                map.closePopup();
            }
        });

        if (content)
            L.popup(popupOptions).setContent(content)


        return module.popup;
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

    showCrosshair: function() {
        base.hideCrosshair()

        base.crosshair = L.marker(null, {icon: crosshairIcon, interactive:false}),
        base.crosshair.setLatLng(base.map.getCenter());
        base.crosshair.addTo(base.map)


        base.map.on('move', function(e) {
            base.crosshair.setLatLng(base.map.getCenter());
        });
        slowFlyTo = false;
    },

    hideCrosshair: function() {
        base.map.removeLayer(base.crosshair)
    },

    hideLayer: function(id) {
        if (base.map.hasLayer(base.layers[id]))
            base.map.removeLayer(base.layers[id])
    },

    getVisibleLayers: function() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));

    },

    updateCircleSize: function() {
        function calcRadius(val, zoom) {
            if(val != radius_zoom()[zoom])
                  return radius_zoom()[zoom]
            else
                  return
        }

        base.map.eachLayer(function (marker) {
            if (marker._radius != undefined){
                //console.debug(marker)
                let size = null
                if(marker.feature.properties.rank_world != undefined){
                    size = Math.max(radius_zoom[base.map.getZoom()], radius_zoom[base.map.getZoom()]*(4/Math.pow(marker.feature.properties.rank_world, 1/4)))
                } else if(marker.feature.properties.population != undefined) {
                    size = Math.max(radius_zoom[base.map.getZoom()], radius_zoom[base.map.getZoom()]*(Math.pow(marker.feature.properties.population, 1/4)/20))
                } else {
                    size = radius_zoom[base.map.getZoom()]
                }


                marker.setRadius(size)
            }
        });
    },

    addControlsTimeout: function() {
        let width = $(window).width()

        L.control.zoom({
            position: 'bottomleft'
        }).addTo(base.map);

        L.Control.geocoder({
            position: 'bottomleft'
        }).addTo(base.map);

        L.control.layers(layerSets.baseTiles.getNameObject(), layerSets.tweets.getNameObject(), {
            position: 'topleft',
            collapsed: width < 1800
        }).addTo(base.map);

        L.control.layers(layerSets.overlays.getNameObject(), layerSets.points.getNameObject(), {
            position: 'topleft',
            collapsed: width < 1800
        }).addTo(base.map);
    },

    addControls: function() {
        setTimeout(base.addControlsTimeout(), 10)
    },

    addEventHandlers: function() {
        base.map.on("moveend", function () {
            if (base.pushState) {
                url.pushState()
            }
        });

        base.map.on("contextmenu", function(e) {
            base.tweetBoxActive = true;
            base.updateCircleSize()
            tweets.closeSidebar();
            base.hideCrosshair();
            base.map.flyTo(e.latlng);
            twitter.showTweetBox(e);
        });

        base.map.on("zoomend", function () {
            base.updateCircleSize()
        });

        base.map.on("click", function (e) {
            base.tweetBoxActive = false;
            tweets.closeSidebar();
            base.showCrosshair();
            twitter.marker.remove();
            twitter.controlwindow.hide();
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushState)
                url.pushState();
            return true;
        });

        base.map.on('overlayadd', function (e) {
            base.updateCircleSize()
            return true;
        });

    }


}

export default base
