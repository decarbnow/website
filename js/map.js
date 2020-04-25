import { map } from 'leaflet';

import tiles from './tiles.js';

import 'leaflet-sidebar';
import showTweetBox from './twitter.js';
import { encode } from '@alexpavlov/geohash-js';

import markers from './marker.js';
import layers from './layers.js';


let pollutionStyle = {
    fillColor: "#FF0000",
    //fillColor: "#a1a1e4",
    stroke: true,
    weight: 0.5,
    opacity: 0.7,
    //weight: 0.8,
    //opacity: 1,
    color: "#F1EFE8",
    interactive: false,
    //weight: 2,
    //opacity: 1,
    //color: 'white',
    //dashArray: '3',
    fillOpacity: 0.05
}


//let selBaselayer = null;
/*decarbnowMap.on('baselayerchange', function (e) {
    //console.log(tiles);
    let id = event.currentTarget.layerId;

    Object.keys(tiles).forEach(baseLayer => {
    
        if(id == tiles[baseLayer]._leaflet_id){
            selBaselayer = baseLayer;
            console.log(tiles[baseLayer]);
        }
    });
});*/

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


let dmap = {
    map: null,
    sidebar: null,
    init: function() {
        let layer = tiles.Light;
        
        if(Object.keys(tiles).indexOf(window.location.pathname.split("/")[5]) > -1){
            layer = tiles[window.location.pathname.split("/")[5]];
        }

        let m = map('map', {
            zoomControl: false, // manually added
            tap: true
        }).setView([47, 16], 5);
        
        layer.addTo(m)

        $.getJSON("/map/global_power_plant_database.geojson",function(coalplants) {
            let overlays_other = {
                "Big coal power stations <i class='fa fa-info-circle'></i>": L.geoJson(coalplants, {
                    style: function(feature) {
                        //return {color: '#d8d4d4'};
                        return {color: '#FF0000'};
                    },
                    pointToLayer: function(feature, latlng) {
                        return new L.CircleMarker(latlng, {radius: feature.properties.capacity_mw/1000/0.5, stroke: false, fillOpacity: 0.5});
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.name + '</td></tr>' + 
                                        '<tr><td>Fuel:</td><td>' + feature.properties.primary_fuel + '</td></tr>'+
                                        '<tr><td>Capacity:</td><td>' + feature.properties.capacity_mw + ' MW</td></tr>'+
                                        '<tr><td>Owner:</td><td>' + feature.properties.owner + '</td></tr>'+
                                        '<tr><td>Source:</td><td><a href =' + feature.properties.url +' target = popup>'  + feature.properties.source + '</a></td></tr>'+
                                        '</table>');
                    }
                }).addTo(m)
            }
            L.control.layers(tiles, overlays_other, {collapsed: false}).addTo(m);
            dmap.load()
        });

        // INIT SIDEMAP
        dmap.sidebar = L.control.sidebar('sidebar', {
            closeButton: true,
            position: 'left'
        });



        m.on('contextmenu', function(e) {
            //console.debug(e);
            dmap.sidebar.hide();

            let hash = encode(e.latlng.lat, e.latlng.lng);
            //let zoomLevel = decarbnowMap.getZoom();
            
            if (typeof (history.pushState) != "undefined") {
                var obj = { Title: hash, Url: '/map/' + hash + '/' + 'pollution'};
                history.pushState(obj, obj.Title, obj.Url);
            } else {
                alert("Browser does not support HTML5.");
            }

            // if(currentMarker){
            //     currentMarker.disablePermanentHighlight();
            //     currentMarker = null;
            // }

            showTweetBox(e.latlng, hash)
        });

        m.on('click', function () {
            dmap.sidebar.hide();
            /*
            if (typeof twittermarker !== 'undefined') { // check
                decarbnowMap.removeLayer(twittermarker); // remove
            }
            */
            if (typeof (history.pushState) != "undefined") {
                var obj = { Title: "map", Url: '/map/'};
                history.pushState(obj, obj.Title, obj.Url);
            } else {
                alert("Browser does not support HTML5.");
            }

            // if(currentMarker){
            //     currentMarker.disablePermanentHighlight();
            //     currentMarker = null;
            // } 
        });

        L.control.markers({ position: 'topleft' }).addTo(m);
        L.control.zoom({ position: 'topleft' }).addTo(m);
        m.addLayer(markers.clusters);
        m.addControl(dmap.sidebar);

        markers.init()

        dmap.map = m;
        window.decarbnowMap = m;
    }, 

    load: function() {
        layers.init()

        //overlays[layersInfo.list[layersInfo.active].name] = layerJson
        
        L.control.layers(layers.overlays, null, {collapsed:false}).addTo(dmap.map);

        //                                     if(Object.keys(tiles).indexOf(window.location.pathname.split("/")[5]) > -1){
        //                                         eval("createBackgroundMap" + window.location.pathname.split("/")[5] + "()").addTo(decarbnowMap);
        //                                     } else {
        //                                         createBackgroundMapLight().addTo(decarbnowMap)
        //                                     }
                                            




        layers.show('no2_2020_03', function() {
            //L.Control.geocoder({position: "topleft"}).addTo(decarbnowMap);      


            /*
            $("#feature_infos").stop();
            $("#feature_infos").fadeIn(1000);
            $("#feature_infos").fadeOut(6000);
            */
            $('.leaflet-control-layers-list input').on('click', function(event) {
                let id = layers.nameToID[$(this).parent().find('span').html().trim()]
                layers.show(id)
                event.stopPropagation()
            })


            //selBaselayer = "Light";
            //$.getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_rivers_lake_centerlines.geojson', function(data) {
            //  L.geoJson(data).addTo(decarbnowMap);
            //});
        })
    }
}

export default dmap

