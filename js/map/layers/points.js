import { decode } from '@alexpavlov/geohash-js';
import base from "../base.js";
//import * as omnivore from "@mapbox/leaflet-omnivore";
//import GeoJSON from geojson;
var GeoJSON = require('geojson');


function getColor(stype) {
         switch (stype) {
           case 'Oil':
             return  '#ffcf09';
           case 'Coal':
             return '#ff000d';
           case 'Gas':
             return '#fe01b1';
         }
}

// var minValue = 0.5;
// function calcRadius(val, zoom) {
//     return 1.00083 * Math.pow(val/minValue,0.5716) * (zoom / 2);
// }

var radius_zoom = [0.04,0.16,0.4,1,1.7,2.5,4,5.5,7.5,9.8,12.5,15.4,19,23,27.2,32,37.2,37.2,37.2,37.2];

function calcRadius(val, zoom) {
    return (Math.pow(val,0.6)*(zoom)/4);
}

let layersList = {
    'e-prtr': {
        url: "/e-prtr/points.geojson",
        name: "E-PRTR <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#6600ff'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = radius_zoom[base.map.getZoom()]
                //console.log(radius_size)
                return new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.1, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.TotalQuantityCO2/1000000000)), fillColor: '#6600ff'});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td style="width:108px">Name:</td><td>' + feature.properties.FacilityName + '</td></tr></thead>' +
                                '<tbody><tr><td style="width:108px">CO2-Equivalents:</td><td>' + +((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100-year GWP (AR4)</a></td></tr>'+
                                '<tr><td style="width:108px">Parent Company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td style="width:108px">Reporting Year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td style="width:108px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                //'<tr><td>Website:</td><td><a href =' + feature.properties.WebsiteCommunication +' target = popup>'  + feature.properties.WebsiteCommunication + '</a></td></tr>'+
                                '</tbody></table>');

                // let isClicked = false
                //   layer.on('mouseover', function (e) {
                //               if(!isClicked & base.map.getZoom() > 9)
                //                   this.openPopup();
                //   });
                //   layer.on('mouseout', function (e) {
                //               if(!isClicked)
                //                   this.closePopup();
                //   });
                //   layer.on('click', function (e) {
                //               isClicked = true;
                //               this.openPopup();
                //   });
            }
        }
    },
    'power-plants': {
        url: "/power-plants/points.geojson",
        hidden: false,
        name: "Foss. fuel power stations <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#FF0000'
            },
            pointToLayer: function(feature, latlng) {
                //let circle = new L.CircleMarker(latlng, {radius: 2, stroke: false, weight: 0.3, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.capacity_mw/2000)), fillColor: getColor(feature.properties.primary_fuel)});
                let circle = new L.CircleMarker(latlng, {radius: radius_zoom[base.map.getZoom()], stroke: false, weight: 0.3, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.capacity_mw/2000)), fillColor: getColor(feature.properties.primary_fuel)});
                //circle._orgRadius = circle.getRadius();
          			//circle.setRadius(calcRadius(circle._orgRadius,base.map.getZoom()))
                return circle;

                // let result = base.map.getBounds().contains(latlng) ? 'inside': 'outside';
                //
                // if(result == 'inside'){
                //     return circle;
                // } else {
                //     return 0;
                // }


            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td style="width:65px">Name:</td><td>' + feature.properties.name + '</td></tr></thead>' +
                                '<tbody><tr><td style="width:65px">Fuel:</td><td>' + feature.properties.primary_fuel + '</td></tr>'+
                                '<tr><td style="width:65px">Capacity:</td><td>' + parseFloat(feature.properties.capacity_mw).toLocaleString() + ' MW</td></tr>'+
                                '<tr><td style="width:65px">Owner:</td><td>' + feature.properties.owner + '</td></tr>'+
                                '<tr><td style="width:65px">Source:</td><td><a href =' + feature.properties.url +' target = popup>'  + feature.properties.source + '</a></td></tr>'+
                                '<tr><td style="width:65px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');

                // let isClicked = false
                //
                // layer.on('mouseover', function (e) {
                //             if(!isClicked & base.map.getZoom() > 9)
                //                 this.openPopup();
                // });
                // layer.on('mouseout', function (e) {
                //             if(!isClicked)
                //                 this.closePopup();
                // });
                // layer.on('click', function (e) {
                //             isClicked = true;
                //             this.openPopup();
                // });
            }
        }
    },
    'big-cities': {
        url: "/cities/points.geojson",
        name: "Big cities <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#39ff14'
            },
            pointToLayer: function(feature, latlng) {
                return new L.circle(latlng, {radius: 5000, stroke: false, weight: 0.3, fillOpacity: Math.min(0.8, Math.max(0.25, feature.properties.population/3000000))});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td>Name:</td><td>' + feature.properties.city + '</td></tr></thead>' +
                                '<tbody><tr><td>Population:</td><td>' + parseFloat(feature.properties.population).toLocaleString() + '</td></tr>'+
                                '<tr><td>Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td>Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');

                // let isClicked = false
                //
                // layer.on('mouseover', function (e) {
                //             if(!isClicked)
                //                 this.openPopup();
                // });
                // layer.on('mouseout', function (e) {
                //             if(!isClicked)
                //                 this.closePopup();
                // });
                // layer.on('click', function (e) {
                //             isClicked = true;
                //             this.openPopup();
                // });
            }
        }
    }, 'fridaysforfuture': {
        url: "https://allforeco.github.io/fridaysforfuture/fff-global-map.json",
        hidden: true,
        extern: true,
        name: "fridaysforfuture Events <i class='fa fa-info-circle'></i>",
        transform: function (data) {
            data = GeoJSON.parse(data.data, {Point: ['Lat', 'Lon'], include: ['Country']});
            return data;
        },
        attr: {
            style: {
                color: '#00FF00'
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: 10, stroke: false, fillOpacity: 0.5});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.Country + '</td></tr></table>');

                let isClicked = false

                layer.on('mouseover', function (e) {
                            if(!isClicked)
                                this.openPopup();
                });
                layer.on('mouseout', function (e) {
                            if(!isClicked)
                                this.closePopup();
                });
                layer.on('click', function (e) {
                            isClicked = true;
                            this.openPopup();
                });
            }
        }
    }, 'foam': {
      url: 'https://map-api-direct.foam.space/poi/filtered?swLng=16&swLat=46&neLng=17&neLat=49&status=application&status=listing&sort=most_value&limit=70&offset=0',
      name: "FOAM POIs <i class='fa fa-info-circle'></i>",
      hidden: true,
      extern: true,
      transform: function (data) {
          data = GeoJSON.parse(data.map(e => {
              let coords = decode(e.geohash);
              e.latitude = coords.latitude;
              e.longitude = coords.longitude;
              return e;
          }), {
              Point: ['latitude', 'longitude'],
              include: ['geohash', 'name', 'owner']
          });
          console.log(data)
          return data;
      },
      attr: {
          style: {
              color: '#00FF00'
          },
          pointToLayer: function(feature, latlng) {
              return new L.circle(latlng, {radius: 8, stroke: false, fillOpacity: 0.5});
          },
          onEachFeature: function (feature, layer) {
              layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.name + '</td></tr></table>');

              let isClicked = false

              layer.on('mouseover', function (e) {
                          if(!isClicked)
                              this.openPopup();
              });
              layer.on('mouseout', function (e) {
                          if(!isClicked)
                              this.closePopup();
              });
              layer.on('click', function (e) {
                          isClicked = true;
                          this.openPopup();
              });
          }
      }
    }
};

export default {
    style: {},
    list: layersList
}
