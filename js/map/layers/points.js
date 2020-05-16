let layersList = {
    'e-prtr': {
        file: "e-prtr.geojson",
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
                                '<tr><td>CO2 Equivalents:</td><td>' + +((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)) + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100-year GWP (AR4)</td></tr>'+
                                '<tr><td>Parent Company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td>Reporting Year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td>Website:</td><td><a href =' + feature.properties.WebsiteCommunication +' target = popup>'  + feature.properties.WebsiteCommunication + '</a></td></tr>'+
                                '</table>');
            }
        }
    },
    'e-prtr2': {
        file: "e-prtr2.geojson",
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
                                '<tr><td>CO2 Equivalents:</td><td>' + +((feature.properties.TotalQuantityCO2/1000000000).toFixed(2)) + ' Mio. T <a href = "https://climatechangeconnection.org/emissions/co2-equivalents/" target = popup>100-year GWP (AR4)</td></tr>'+
                                '<tr><td>Parent Company:</td><td>' + feature.properties.ParentCompanyName + '</td></tr>'+
                                '<tr><td>Reporting Year:</td><td>' + feature.properties.ReportingYear + '</td></tr>'+
                                '<tr><td>Website:</td><td><a href =' + feature.properties.WebsiteCommunication +' target = popup>'  + feature.properties.WebsiteCommunication + '</a></td></tr>'+
                                '</table>');
            }
        }
    },
    'power-plants': {
        file: "global_power_plant_database.geojson",
        name: "Big coal power stations <i class='fa fa-info-circle'></i>",
        attr: {
            style: {
                color: '#DEB500'
            },
            pointToLayer: function(feature, latlng) {
                return new L.CircleMarker(latlng, {radius: feature.properties.capacity_mw/1000/0.5, stroke: false, fillOpacity: 0.8});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.name + '</td></tr>' +
                                '<tr><td>Fuel:</td><td>' + feature.properties.primary_fuel + '</td></tr>'+
                                '<tr><td>Capacity:</td><td>' + feature.properties.capacity_mw + ' MW</td></tr>'+
                                '<tr><td>Owner:</td><td>' + feature.properties.owner + '</td></tr>'+
                                '<tr><td>Source:</td><td><a href =' + feature.properties.url +' target = popup>'  + feature.properties.source + '</a></td></tr>'+
                                '</table>');
            }
        }
    },
    'tweetsLegacy': {
        name: "Tweets Legacy",
    },
    'tweets': {
        name: "Tweets",
    }
};

export default {
    style: {},
    list: layersList
}
