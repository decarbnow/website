import { map } from 'leaflet';
import 'leaflet-control-geocoder';
import './controls/LayerSelectionControl';
import './geoip.js';
import './marker/control.js';
import { layerSets, layers } from './layers/sets.js';
import tweets from './tweets.js';
import url from './url.js';
import twitter from './twitter.js';
import 'leaflet-control-window';

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
    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
});

L.Circle.include({
    contains: function (latLng) {
        return this.getLatLng().distanceTo(latLng) < this.getRadius();
    }
});

let tweetBoxActive = false;

let radius_zoom = [1,1,1,1,2.5,4,5.5,7.5,9.8,12.5,15.4,19,23,27.2,32,37.2,40,40,40,40,40];

let base = {
    map: null,
    slowFlyTo: false,
    layerSets: {},
    crosshair: L.marker('crosshair', {icon: crosshairIcon, interactive:false}),
    layers: {},
    pushState: false,

    init: function() {
        // init leaflet map
        base.map = map('map', {
            ...defaultOptions,
        });

        tweets.init();
        tweets.loadMarkers();
        twitter.init();

        base.addEventHandlers();

        //Disable interaction
        base.map._handlers.forEach(function(handler) {
            handler.disable();
        });

        base.layerSets = layerSets;
        base.layers = layers;


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
        $(base.map).one('moveend', function () {
            base.showCrosshair();
            let tweet = state.tweet;

            if (!state.tweet) {
                let path = url.getPath()

                if (path in tweets.data.pathToTweetId)
                    tweet = tweets.data.pathToTweetId[path];
            }

            if (tweet)
                tweets.show(tweet);

            base.addControls();

            //Enable interaction
            base.map._handlers.forEach(function(handler) {
                handler.enable();

            });

        })


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

        if(base.slowFlyTo){
            base.map.flyTo(state.center, state.zoom, {noMoveStart: true});
        } else {
            base.map.flyTo(state.center, state.zoom, {noMoveStart: true, duration: 1});
            base.slowFlyTo = true
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
        //base.hideCrosshair()
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
        // if(base.crosshair !== 'undefined')
        //     base.hideCrosshair()

        //base.crosshair = L.marker('crosshairmarker', {icon: crosshairIcon, interactive:false}),
        //base.crosshair._icon.classList.add("crosshair");

        base.crosshair.setLatLng(base.map.getCenter());
        base.crosshair.addTo(base.map)

        base.crosshair._icon.classList.add("crosshair.visible");
    },

    unhideCrosshair: function() {
        base.crosshair.setIcon({icon: crosshairIcon, interactive:false})
    },

    hideCrosshair: function() {
        base.crosshair.remove();
        //base.crosshair._icon.classList.add("crosshair.invisible");
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

    addControls: function() {
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

    addEventHandlers: function() {
        base.map.on("moveend", function () {
            if (base.pushState) {
                url.pushState()
            }
        });

        base.map.on("move", function () {
            if(base.crosshair !== null)
                base.crosshair.setLatLng(base.map.getCenter());
        });

        base.map.on("contextmenu", function(e) {
            base.tweetBoxActive = true;
            tweets.closeSidebar();
            //base.hideCrosshair();
            base.map.flyTo(e.latlng);
            twitter.showTweetBox(e);
        });

        base.map.on("zoomend", function () {
            base.updateCircleSize()
        });

        base.map.on("click", function (e) {
            base.tweetBoxActive = false;
            tweets.closeSidebar();
            base.slowFlyTo = false;
            //base.showCrosshair();
            twitter.marker.remove();
            tweets.controlwindow.hide();
            twitter.controlwindow.hide();
            //base.unhideCrosshair()
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushState)
                url.pushState();
            return true;
        });
    }


}

export default base
