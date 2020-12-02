//import GeoJSON from geojson;
var GeoJSON = require('geojson');

function getColor(stype) {
         switch (stype) {
           case 'Oil':
             return  'black';
           case 'Coal':
             return 'red';
           case 'Gas':
             return 'blue';
         }
}

let layersList = {
    'e-prtr': {
        url: "/e-prtr/points-big.geojson",
        name: "PRTR biggest <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#0000FF'
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: Math.sqrt(feature.properties.TotalQuantityCO2/100000000), stroke: false, fillOpacity: 0.5});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.FacilityName + '</td></tr>' +
                                '<tr><td>CO2-Equivalents:</td><td>' + +((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100-year GWP (AR4)</td></tr>'+
                                '<tr><td>Parent Company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td>Reporting Year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td>Website:</td><td><a href =' + feature.properties.WebsiteCommunication +' target = popup>'  + feature.properties.WebsiteCommunication + '</a></td></tr>'+
                                '</table>');

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
    },
    'e-prtr2': {
        url: "/e-prtr/points-small.geojson",
        name: "PRTR smallest <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#0000FF'
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: Math.sqrt(feature.properties.TotalQuantityCO2/100000000), stroke: false, fillOpacity: 0.5});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.FacilityName + '</td></tr>' +
                                '<tr><td>CO2 Equivalents:</td><td>' + +((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)).toLocaleString() + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100-year GWP (AR4)</td></tr>'+
                                '<tr><td>Parent Company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td>Reporting Year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td>Website:</td><td><a href =' + feature.properties.WebsiteCommunication +' target = popup>'  + feature.properties.WebsiteCommunication + '</a></td></tr>'+
                                '</table>');

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
    },
    'power-plants': {
        url: "/power-plants/points.geojson",
        name: "Foss. fuel power stations <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#FF0000'
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: feature.properties.capacity_mw/1000/0.5, stroke: false, fillOpacity: 0.8, fillColor: getColor(feature.properties.primary_fuel)});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.name + '</td></tr>' +
                                '<tr><td>Fuel:</td><td>' + feature.properties.primary_fuel + '</td></tr>'+
                                '<tr><td>Capacity:</td><td>' + parseFloat(feature.properties.capacity_mw).toLocaleString() + ' MW</td></tr>'+
                                '<tr><td>Owner:</td><td>' + feature.properties.owner + '</td></tr>'+
                                '<tr><td>Source:</td><td><a href =' + feature.properties.url +' target = popup>'  + feature.properties.source + '</a></td></tr>'+
                                '</table>');

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
    },
    'big-cities': {
        url: "/cities/points.geojson",
        name: "Big cities <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#00FF00'
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: Math.sqrt(feature.properties.population/70000), stroke: false, fillOpacity: 0.5});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.city + '</td></tr>' +
                                '<tr><td>Population:</td><td>' + parseFloat(feature.properties.population).toLocaleString() + '</td></tr>'+
                                '<tr><td>Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '</table>');

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
    }
};

export default {
    style: {},
    list: layersList
}
