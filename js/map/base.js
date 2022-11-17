import { map, icon, Marker } from 'leaflet';
import 'leaflet-control-geocoder';
import './controls/LayerSelectionControl';
import './geoip.js';
import './marker/control.js';
import { layerSets, layers } from './layers/sets.js';
import tweets from './tweets.js';
import url from './url.js';
import twitter from './twitter.js';
import 'leaflet-control-window';
import 'leaflet-draw';
import 'jquery';
import 'leaflet-easybutton';

let GeoJSON = require('geojson');

const iconRetinaUrl = '../../../static/leaflet/dist/images/marker-icon-2x.png';
const iconUrl = '../../../static/leaflet/dist/images/marker-icon.png';
const shadowUrl = '../../../static/leaflet/dist/images/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

Marker.prototype.options.icon = iconDefault;

let defaultState = {
    zoom: 3,
    center: {
        lat: 22,
        lng: 0,
    },
    layers: [
        'dark',
        'energy',
        'manufacturing',
        'fossil-fuel-operations',
        'no2_2021',
        'tweets'
    ],
}

let defaultOptions = {
    zoomControl: false,
    tap: true,
    maxZoom: 19,
    touchZoom: 'center',
    //drawControl: true
}



L.Circle.include({
    contains: function (latLng) {
        return this.getLatLng().distanceTo(latLng) < this.getRadius();
    }
});

let tweetBoxActive = false;

let radius_zoom = [1,1,1,1,2.5,4,5.5,7.5,9.8,12.5,15.4,19,23,27.2,32,37.2,40,40,40,40,40];

let base = {
    map: null,
    slowFlyTo: true,
    layerSets: {},
    layers: {},
    externalJSON: false,
    pushState: false,
    validJsonUrl: false,
    editableLayers: new L.FeatureGroup(),

    init: function() {
        // init leaflet map
        base.map = map('map', {
            ...defaultOptions,
        });

        tweets.init();
        tweets.loadMarkers();
        twitter.init();

        base.addEventHandlers();

        base.layerSets = layerSets;
        base.layers = layers;

        base.setInitialState();

        //base.map.addLayer(base.editableLayers);
        //base.editableLayers.addTo(base.map)

    },

    getState: function() {
        return {
            center: base.map.getCenter(),
            zoom: base.map.getZoom(),
            layers: base.getVisibleLayers(),
            tweet: tweets.activeTweet,
            polygons: tweets.data.polygons
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

        $(tweets).on("loaded", function() {
            if (!state.tweet) {
                let path = url.getPath()

                if (path in tweets.data.pathToTweetId)
                    tweet = tweets.data.pathToTweetId[path];
            }

            if (tweet)
                tweets.show(tweet);
        });

        base.addControls();
    },

    setState: function(state){
        base.pushState = false;
        base.flyTo(state);
        $(base.map).one('moveend', function () {
            base.showLayers(state.layers);
            base.pushState = true;

            if(state.polygons){
                tweets.data.polygons = state.polygons
                base.showPolygons(state)
                base.showLayer("polygons")
            }
            url.pushState();

            base.updateCircleSize();
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

    getWindowCorrectedCenter: function(center, zoom) {
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

    showPolygons: function(state) {
          base.layers["polygons"].clearLayers();
          let colorIterator = 0
          let color_arr = ["#FFF600", "#ff7800", "#FF0008", "#0088FF"]

          let data = decodeURIComponent(state.polygons);

          function isValidHttpUrl(string) {
              let url;
              try {
                url = new URL(string);
              } catch (_) {
                return false;
              }
              return url.protocol === "http:" || url.protocol === "https:";
          }
          let jsonStyle = {
              "color": "#FF0008",
              "weight": 5,
              "opacity": 0.8,
              "interactive": false,
              //"fillColor": "#ff7800",
              "stroke": false,
              "fillOpacity": 0.1,
          }

          if(isValidHttpUrl(data)){
              base.layers["polygons"].clearLayers();
              $.getJSON(data, function(json){
                    // add GeoJSON layer to the map once the file is loaded
                    L.geoJson(json ,{
                      onEachFeature: function ( feature, layer ){
                          base.layers["polygons"].addLayer( layer )
                      },
                      style: jsonStyle
                  })

                  //base.map.fitBounds(datalayer.getBounds());
              });
              base.externalJSON = true
          } else {
              L.geoJSON(JSON.parse(data), {
                  onEachFeature: function ( feature, layer ){
                      if(colorIterator > 3)
                          colorIterator = 0

                      layer.setStyle({
                          weight: 5,
                          color: color_arr[colorIterator],
                          opacity: 0.8,
                          interactive: false,
                          //fillColor: "#ff7800",
                          stroke: true,
                          fillOpacity: 0.1,
                          dashArray: ''
                      });

                      base.layers["polygons"].addLayer( layer )
                      colorIterator = colorIterator + 1
                  }
              });
          }


    },

    hidePolygons: function() {

          base.hideLayer("polygons")


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
                } else if(marker.feature.properties.rank != undefined) {
                    size = Math.max(radius_zoom[base.map.getZoom()], radius_zoom[base.map.getZoom()]*(4/Math.pow(marker.feature.properties.rank, 1/4)))
                    //size = 20000/radius_zoom[base.map.getZoom()]
                } else {
                    size = radius_zoom[base.map.getZoom()]
                }


                marker.setRadius(size)
            }
        });
    },

    addControls: function() {
        let drawOptions = {
            position: 'bottomleft',
            draw: {
                polyline: false,
                polygon: {
                    allowIntersection: false, // Restricts shapes to simple polygons
                    drawError: {
                        color: '#e1e100', // Color the shape will turn when intersects
                        message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                    },
                    shapeOptions: {
                        color: '#bada55'
                    }
                },
                circle: false, // Turns off this drawing tool
                rectangle: false,
                marker: false,
                circlemarker: false
                },
                edit: {
                    featureGroup: base.editableLayers, //REQUIRED!!
                    remove: false,
                    edit: false
                }
        };

        L.control.zoom({
            position: 'bottomleft'
        }).addTo(base.map);

        L.Control.geocoder({
            position: 'bottomleft'
        }).addTo(base.map);

        let shareUrlButton = L.easyButton({
            states: [{
                    stateName: 'toggle-tweets',        // name the state
                    icon:      'nf nf-fa-share',               // and define its properties
                    title:     'Share Link',      // like its title
                    onClick: function(btn, map) {       // and its callback
                        let link = 'https://map.decarbnow.space' + url.getPath()
                        navigator.clipboard.writeText(link)
                            .then(() => {
                                alert('Map link copied to clipboard. Tweet this link to add the tweet to the map.');
                            })
                                .catch(err => {
                                alert('Error in copying URL: ', err);
                            });
                        //url.pushState();
                        //btn.state('fa-cleared-trash');    // change state on click!
                    }
            }]
        });

        shareUrlButton.setPosition('bottomleft').addTo( base.map );

        let removePolygonsButton = L.easyButton({
            states: [{
                    stateName: 'fa-clear-trash',        // name the state
                    icon:      'fa-trash',               // and define its properties
                    title:     'Remove polygons',      // like its title
                    onClick: function(btn, map) {       // and its callback
                        if(tweets.data.polygons){
                            if (confirm('Are you sure you want to remove all your self-created polygons?')) {
                                base.layers["polygons"].clearLayers();
                                tweets.data.polygons = null
                                url.pushState();
                            } else {
                                // Do nothing!
                                return;
                            }
                        } else {
                            return;
                        }



                        //btn.state('fa-cleared-trash');    // change state on click!
                    }
            }]
        });

        removePolygonsButton.setPosition('bottomleft').addTo( base.map );

        let drawControl = new L.Control.Draw(drawOptions);
        base.map.addControl(drawControl);

        let width = $(window).width()

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
        base.map.on(L.Draw.Event.CREATED, function (e) {
            base.showLayer("polygons")
            var type = e.layerType,
                layer = e.layer;

            if (type === 'marker') {
                layer.bindPopup('A popup!');
            }

            //Remove loaded JSON first
            if(base.externalJSON){
                base.layers["polygons"].clearLayers();
                tweets.data.polygons = null
                url.pushState();
                base.externalJSON = false
            }

            base.layers["polygons"].addLayer(layer)

            // Extract GeoJson from featureGroup
            let data = layer.toGeoJSON();

            // Stringify the GeoJson
            if(tweets.data.polygons == null){
                data = encodeURIComponent(JSON.stringify(data));
            } else {
                let data_old = data
                data = {
                    "type" : "FeatureCollection",
                    "features": [JSON.parse(decodeURIComponent(tweets.data.polygons)), data]
                }
                data = encodeURIComponent(JSON.stringify(data))

            }
            if(data.length > 3800){
                alert("Polygon string too long. You cannot add more stuff.");
            } else {
                tweets.data.polygons = data
                tweets.addGeoJson()
            }

        });

        base.map.on("moveend", function () {
            if (base.pushState) {
                url.pushState()
            }
        });

        base.map.on("move", function () {

        });

        base.map.on("contextmenu", function(e) {
            base.tweetBoxActive = true;
            tweets.closeSidebar();
            base.map.flyTo(e.latlng);
            twitter.showTweetBox(e);
            let class_ch = document.querySelector('.crosshair')
            class_ch.classList.add('hidden')
        });

        base.map.on("zoomend", function () {
            base.updateCircleSize()
        });

        base.map.on("click", function (e) {
            base.tweetBoxActive = false;
            tweets.closeSidebar();
            //base.slowFlyTo = false;
            twitter.marker.remove();
            twitter.controlwindow.hide();
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushState)
                url.pushState();
            return true;
        });
    }


}

export default base
