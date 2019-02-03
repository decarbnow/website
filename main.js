import { map, tileLayer, marker, Icon } from 'leaflet';

// create map
let keanoMap = map('map').setView([47.81, 13.02], 12);

tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(keanoMap);

let LeafIcon = Icon.extend({
    options: {
        shadowUrl: 'img/leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

let greenIcon = new LeafIcon({iconUrl: 'img/leaf-green.png'}),
    redIcon = new LeafIcon({iconUrl: 'img/leaf-red.png'}),
    orangeIcon = new LeafIcon({iconUrl: 'img/leaf-orange.png'});

marker([47.86, 13.015], {icon: greenIcon}).bindPopup("I am a green leaf.").addTo(keanoMap);
marker([47.81, 13.02], {icon: redIcon}).bindPopup("I am a red leaf.").addTo(keanoMap);
marker([47.86, 13.025], {icon: orangeIcon}).bindPopup("I am an orange leaf.").addTo(keanoMap);