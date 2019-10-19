import { map, tileLayer, marker, Icon } from 'leaflet';
import markers from './data/marker.json';

// create map
let keanoMap = map('map').setView([48.2084, 16.373], 11);

//tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/}', {


/*
tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(keanoMap);

/*
*/
L.tileLayer(
    'https://api.mapbox.com/styles/v1/sweing/ck1xo0pmx1oqs1co74wlf0dkn/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3dlaW5nIiwiYSI6ImNqZ2gyYW50ODA0YTEycXFxYTAyOTZza2IifQ.NbvRDornVZjSg_RCJdE7ig', {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(keanoMap);

/*
let videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
    videoBounds = [[ 32, -130], [ 13, -100]];
L.videoOverlay(videoUrl, videoBounds ).addTo(keanoMap);
*/

let videoUrl = 'dist/img/tropomi.mp4',
    videoBounds = [[ 70, -180], [ -70, 180]],
    videoOptions = {opacity: 0.5};
L.videoOverlay(videoUrl, videoBounds, videoOptions).addTo(keanoMap);


let LeafIcon = Icon.extend({
    options: {
        //shadowUrl: 'dist/img/leaf-shadow.png',
        iconSize:     [32, 32],
        //shadowSize:   [50, 64],
        iconAnchor:   [16, 16],
        //shadowAnchor: [4, 62],
        popupAnchor:  [0, -16]
    }
});

let icons = {
    "climateaction": new LeafIcon({iconUrl: 'dist/img/action.png'}),
    "pollution": new LeafIcon({iconUrl: 'dist/img/pollution.png'}),
    "transition": new LeafIcon({iconUrl: 'dist/img/transition.png'})
}


console.log(markers);
markers.markers.forEach(function(item) {
    let text = item.text;
    if (item.hasOwnProperty("origurl") && item.origurl.length > 0) {
        text += "<br/><a href=\"" + item.origurl + "\"><img src=\"dist/img/twitter.png\" /></a>";
    }
    marker([item.lat, item.lng], {icon: icons[item.tag]})
        .bindPopup(text)
        .addTo(keanoMap);
});
