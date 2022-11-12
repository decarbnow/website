import { decode } from '@alexpavlov/geohash-js';
import base from "../base.js";

let GeoJSON = require('geojson');

function getColor(stype) {
    switch (stype) {
     case 'Oil':
       return  '#ffcf09';
     case 'Coal':
       return '#ff000d';
     case 'Gas':
       return '#6600ff';
     case 'Gas/Oil':
       return '#ffcf09';
     case 'Biomass':
       return '#fe01b1';
    }
}

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
                if(feature.properties.TotalQuantityCO2/1000000000 > 0.1){
                  let radius_size = base.radius_zoom()[base.map.getZoom()]
                  return new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.1, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.TotalQuantityCO2/1000000000)), fillColor: '#6600ff'});
                } else {
                  return;
                }

            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td style="width:108px">Name:</td><td>' + feature.properties.FacilityName + '</td></tr></thead>' +
                                '<tbody><tr><td style="width:108px">CO2-Equivalents:</td><td>' + ((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:108px">Parent company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td style="width:108px">Reporting year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td style="width:108px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    },
    'manufacturing': {
        url: "sectors/manufacturing/points.geojson",
        hidden: false,
        name: "Manufacturing <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#ad76ff'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(4/Math.pow(feature.properties.rank_world, 1/4)))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.3, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.emissions_quantity/200000)), fillColor: '#ad76ff'});
                return circle;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead>' +
                                '<tr><td style="width:107px">Name:</td><td>' + feature.properties.asset_name + '</td></tr></thead>' +
                                '<tbody>' +
                                '<tr><td style="width:107px">Type:</td><td>' + feature.properties.asset_type + '</td></tr>'+
                                '<tr><td style="width:107px">CO2-Equivalents:</td><td>' + ((feature.properties.emissions_quantity/100000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:107px">Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td style="width:107px">Country rank:</td><td>' + feature.properties.rank_country + ' (manufacturing)</td></tr>'+
                                '<tr><td style="width:107px">World rank:</td><td>' + feature.properties.rank_world + '</td></tr>'+
                                '<tr><td style="width:107px">Year:</td><td>' + feature.properties.year + '</td></tr>'+
                                '<tr><td style="width:107px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    },
    'power-plants': {
        url: "sectors/energy/points.geojson",
        hidden: false,
        name: "Energy <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#FF0000'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(4/Math.pow(feature.properties.rank_world, 1/4)))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.3, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.emissions_quantity/20000000)), fillColor: getColor(feature.properties.asset_type)});
                return circle;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead>' +
                                '<tr><td style="width:107px">Name:</td><td>' + feature.properties.asset_name + '</td></tr></thead>' +
                                '<tbody>' +
                                '<tr><td style="width:107px">Type:</td><td>' + feature.properties.asset_type + '</td></tr>'+
                                '<tr><td style="width:107px">CO2-Equivalents:</td><td>' + ((feature.properties.emissions_quantity/1000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:107px">Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td style="width:107px">Country rank:</td><td>' + feature.properties.rank_country + ' (energy)</td></tr>'+
                                '<tr><td style="width:107px">World rank:</td><td>' + feature.properties.rank_world + '</td></tr>'+
                                '<tr><td style="width:107px">Year:</td><td>' + feature.properties.year + '</td></tr>'+
                                '<tr><td style="width:107px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    },
    'fossil-fuel-operations': {
        url: "sectors/fossil_fuel_operations/points.geojson",
        hidden: false,
        name: "Fossil fuel OP <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#FCB500'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(4/Math.pow(feature.properties.rank_world, 1/4)))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.3, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.emissions_quantity/20000000)), fillColor: '#FCB500'});
                return circle;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead>' +
                                '<tr><td style="width:107px">Name:</td><td>' + feature.properties.asset_name + '</td></tr></thead>' +
                                '<tbody>' +
                                '<tr><td style="width:107px">Type:</td><td>' + feature.properties.asset_type + '</td></tr>'+
                                '<tr><td style="width:107px">CO2-Equivalents:</td><td>' + ((feature.properties.emissions_quantity/1000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:107px">Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td style="width:107px">Country rank:</td><td>' + feature.properties.rank_country + ' (Fossil Fuel OP)</td></tr>'+
                                '<tr><td style="width:107px">World rank:</td><td>' + feature.properties.rank_world + '</td></tr>'+
                                '<tr><td style="width:107px">Year:</td><td>' + feature.properties.year + '</td></tr>'+
                                '<tr><td style="width:107px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
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
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(Math.pow(feature.properties.population, 1/4)/20))
                return new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.3, fillOpacity: Math.min(0.8, Math.max(0.25, feature.properties.population/3000000))});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td>Name:</td><td>' + feature.properties.city + '</td></tr></thead>' +
                                '<tbody><tr><td>Population:</td><td>' + parseFloat(feature.properties.population).toLocaleString() + '</td></tr>'+
                                '<tr><td>Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td>Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
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
