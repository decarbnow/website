import { map } from 'leaflet';
import $ from 'jquery';
import baseLayers from './layers.js';


/*decarbnowMap.on('baselayerchange', function (e) {
    //console.log(baseLayers);
    let id = event.currentTarget.layerId;

    Object.keys(baseLayers).forEach(baseLayer => {
    
        if(id == baseLayers[baseLayer]._leaflet_id){
            selBaselayer = baseLayer;
            console.log(baseLayers[baseLayer]);
        }
    });
});*/

let decarbnowMap = {
    map: null,
    init: function() {
        let layer = baseLayers.Light;
        
        if(Object.keys(baseLayers).indexOf(window.location.pathname.split("/")[5]) > -1){
            layer = baseLayers[window.location.pathname.split("/")[5]];
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
            L.control.layers(baseLayers, overlays_other, {collapsed:false}).addTo(m);
        });
        decarbnowMap.map = m;


    }
}



export default decarbnowMap

