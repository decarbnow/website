import { decode } from '@alexpavlov/geohash-js';
import base from "../base.js";
import MarkerClusterGroup from 'leaflet.markercluster';

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

let citation = {
    climatetrace: "Climate TRACE - Tracking Real-time Atmospheric Carbon Emissions (2022), Climate TRACE Emissions Inventory, https://climatetrace.org [November 2022]",
    wri: "Dataset coordinated by World Resource Institute and Google Earth Outreach. The project is the result of a large collaboration involving many partners and aims to build an open database of all power plants in the world.",
    eprtr: "The E-PRTR is a service managed by the European Commission and the European Environment Agency (EEA). The online register contains annual information on emissions of 91 substances released into the air, water and land by 30,000 industrial facilities throughout Europe. E-PRTR data covering reporting for 2007 to 201X by EU Member States, Iceland, Liechtenstein, Norway, Serbia, Switzerland and the United Kingdom.",
    bigcities: "Simplemaps commercial database of the world`s cities and towns built using authoritative sources such as the NGIA, US Geological Survey, US Census Bureau, and NASA. Neighborhoods within listed cities are not included. Determination of border conflicts and territorial disputes are adopted from US government agencies.",
    euets: "The EU ETS is a cornerstone of the EU`s policy to combat climate change and its key tool for reducing greenhouse gas emissions cost-effectively. It is the world`s first major carbon market and remains the biggest one.",
}

let popupoptions = {maxWidth : 350}

let layersList = {
    'manufacturing': {
        url: "sectors/manufacturing/points.geojson",
        hidden: false,
        name: "Manufacturing <span class='hovertext' data-hover='" + citation.climatetrace + "'><i class='fa fa-info-circle'></i></span></i>",
        attr: {
            style: {
                color: '#ad76ff'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(3/Math.pow(feature.properties.rank_world, 1/4)))
                let fill_opacity = Math.min(0.85, Math.max(0.3, feature.properties.emissions_quantity/200000))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: true, weight: fill_opacity*3, fillOpacity: 0, color: '#ad76ff'});
                return circle;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead>' +
                                '<tr><td style="width:107px">Name:</td><td>' + feature.properties.asset_name + '</td></tr></thead>' +
                                '<tbody>' +
                                '<tr><td style="width:107px">Type:</td><td>' + feature.properties.asset_type + '</td></tr>'+
                                '<tr><td style="width:107px">CO2-Equiv.:</td><td>' + ((feature.properties.emissions_quantity/100000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:107px">Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td style="width:107px">Country rank:</td><td>' + feature.properties.rank_country + ' (manufacturing)</td></tr>'+
                                '<tr><td style="width:107px">World rank:</td><td>' + feature.properties.rank_world + '</td></tr>'+
                                '<tr><td style="width:107px">Year:</td><td>' + feature.properties.year + '</td></tr>'+
                                '<tr><td style="width:107px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    },
    'energy': {
        url: "sectors/energy/points.geojson",
        hidden: false,
        name: "Energy <span class='hovertext' data-hover='" + citation.climatetrace + "'><i class='fa fa-info-circle'></i></span>",
        attr: {
            style: {
                color: '#FF0000'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(3/Math.pow(feature.properties.rank_world, 1/4)))
                let fill_opacity = Math.min(0.85, Math.max(0.3, feature.properties.emissions_quantity/20000000))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: true, weight: fill_opacity*3, fillOpacity: 0, color: getColor(feature.properties.asset_type)});
                return circle;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead>' +
                                '<tr><td style="width:107px">Name:</td><td>' + feature.properties.asset_name + '</td></tr></thead>' +
                                '<tbody>' +
                                '<tr><td style="width:107px">Type:</td><td>' + feature.properties.asset_type + '</td></tr>'+
                                '<tr><td style="width:107px">CO2-Equiv.:</td><td>' + ((feature.properties.emissions_quantity/1000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
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
        name: "Fossil fuel OP <span class='hovertext' data-hover='" + citation.climatetrace + "'><i class='fa fa-info-circle'></i></span>",
        attr: {
            style: {
                color: '#FCB500'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(3/Math.pow(feature.properties.rank_world, 1/4)))
                let fill_opacity = Math.min(0.85, Math.max(0.3, feature.properties.emissions_quantity/20000000))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: true, weight: fill_opacity*3, fillOpacity: 0, color: '#FCB500'});
                return circle;
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead>' +
                                '<tr><td style="width:107px">Name:</td><td>' + feature.properties.asset_name + '</td></tr></thead>' +
                                '<tbody>' +
                                '<tr><td style="width:107px">Type:</td><td>' + feature.properties.asset_type + '</td></tr>'+
                                '<tr><td style="width:107px">CO2-Equiv.:</td><td>' + ((feature.properties.emissions_quantity/1000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:107px">Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td style="width:107px">Country rank:</td><td>' + feature.properties.rank_country + ' (Fossil Fuel OP)</td></tr>'+
                                '<tr><td style="width:107px">World rank:</td><td>' + feature.properties.rank_world + '</td></tr>'+
                                '<tr><td style="width:107px">Year:</td><td>' + feature.properties.year + '</td></tr>'+
                                '<tr><td style="width:107px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    },
    'power-plants': {
        url: "/power-plants/points.geojson",
        name: "WRI power plants <span class='hovertext' data-hover='" + citation.wri + "'><i class='fa fa-info-circle'></i></span></i>",
        attr: {
            style: {
                //color: '#FF0000'
            },
            pointToLayer: function(feature, latlng) {
                //let circle = new L.CircleMarker(latlng, {radius: 2, stroke: false, weight: 0.3, fillOpacity: Math.min(0.85, Math.max(0.3, feature.properties.capacity_mw/2000)), fillColor: getColor(feature.properties.primary_fuel)});
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(3/Math.pow(feature.properties.rank, 1/4)))//20000/base.radius_zoom()[base.map.getZoom()]
                let fill_opacity = Math.min(0.4, Math.max(0.3, feature.properties.capacity_mw/5000))
                let circle = new L.CircleMarker(latlng, {radius: radius_size, stroke: true, color: getColor(feature.properties.primary_fuel), weight: fill_opacity*4, fillOpacity: 0, fillColor: getColor(feature.properties.primary_fuel)});
                //circle._orgRadius = circle.getRadius();
          			//circle.setRadius(calcRadius(circle._orgRadius,base.map.getZoom()))
                return circle;

            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td>Name:</td><td>' + feature.properties.name + '</td></tr></thead>' +
                                '<tr><td>Fuel:</td><td>' + feature.properties.primary_fuel + '</td></tr>'+
                                '<tr><td>Fuel rank:</td><td>' + feature.properties.rank + '</td></tr>'+
                                '<tr><td>Capacity:</td><td>' + parseFloat(feature.properties.capacity_mw).toLocaleString() + ' MW</td></tr>'+
                                '<tr><td>Owner:</td><td>' + feature.properties.owner + '</td></tr>'+
                                '<tr><td>Source:</td><td><a href =' + feature.properties.url +' target = popup>'  + feature.properties.source + '</a></td></tr>'+
                                '<tr><td>Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
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
    'e-prtr': {
        url: "/e-prtr/points.geojson",
        name: "E-PRTR <span class='hovertext' data-hover='" + citation.eprtr + "'><i class='fa fa-info-circle'></i></span></i>",
        hidden: true,
        attr: {
            style: {
                color: '#6600ff'
            },
            pointToLayer: function(feature, latlng) {
                if(feature.properties.TotalQuantityCO2/1000000000 > 0.1){
                  let radius_size = base.radius_zoom()[base.map.getZoom()]
                  let fill_opacity = Math.min(0.85, Math.max(0.3, feature.properties.TotalQuantityCO2/1000000000))
                  return new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.1, fillOpacity: fill_opacity, fillColor: '#6600ff'});
                } else {
                  return;
                }

            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td style="width:108px">Name:</td><td>' + feature.properties.FacilityName + '</td></tr></thead>' +
                                '<tbody><tr><td style="width:110px">CO2-Equiv.:</td><td>' + ((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:108px">Parent company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td style="width:108px">Reporting year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td style="width:108px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    },
    'eu-ets': {
        url: "/eu-ets/points.geojson",
        name: "EU-ETS <span class='hovertext' data-hover='" + citation.euets + "'><i class='fa fa-info-circle'></i></span></i>",
        attr: {
            style: {
                color: '#6600ff'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(3/Math.pow(feature.properties.rank, 1/4)))
                let fill_opacity = Math.min(0.85, Math.max(0.4, feature.properties.verified/10000000))
                return new L.CircleMarker(latlng, {radius: radius_size, stroke: true, weight: fill_opacity*4, fillOpacity: 0, fillColor: '#6600ff'});
                // if(feature.properties.rank < 100){
                //   return new L.marker(latlng, {
                //     opacity: 0.85,
                //     icon: L.divIcon({
                //         className: 'my-custom-icon',
                //         iconSize: radius_size*2.5,
                //         html: feature.properties.rank
                //     }),
                //
                //   });
                // } else {
                //   return new L.CircleMarker(latlng, {radius: radius_size, stroke: false, weight: 0.1, fillOpacity: fill_opacity, fillColor: '#6600ff'});
                // }


            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td style="width:108px">Name:</td><td>' + feature.properties.name + '</td></tr></thead>' +
                                '<tbody><tr><td style="width:108px">CO2-Equiv.:</td><td>' + ((feature.properties.verified/1000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100y GWP</a></td></tr>'+
                                '<tr><td style="width:108px">Country:</td><td>' + feature.properties.registry + '</td></tr>'+
                                '<tr><td style="width:108px">Activity:</td><td>' + feature.properties.activity + '</td></tr>'+
                                '<tr><td style="width:108px">EU rank:</td><td>' + feature.properties.rank + '</td></tr>'+
                                //'<tr><td style="width:108px">Parent company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td style="width:108px">Verification:</td><td>' + feature.properties.year + '</td></tr>'+
                                '<tr><td style="width:108px">Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>', popupoptions);
            }
        }
    },
    'big-cities': {
        url: "/cities/points.geojson",
        name: "Big cities <span class='hovertext' data-hover='" + citation.bigcities + "'><i class='fa fa-info-circle'></i></span></i>",
        attr: {
            style: {
                color: '#39ff14'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(Math.pow(feature.properties.population, 1/4)/20))
                let fill_opacity = Math.min(0.8, Math.max(0.25, feature.properties.population/3000000))
                return new L.CircleMarker(latlng, {radius: radius_size, stroke: true, weight: fill_opacity*2, fillOpacity: 0});
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
    }, 'polygons':{
        name: "Polygons",
        hidden: false,
        extern: true
    }
};

export default {
    style: {},
    list: layersList
}
