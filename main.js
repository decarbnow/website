import { map, tileLayer, marker, Icon } from 'leaflet';
import twemoji from 'twemoji';
import $ from 'jquery';
import { encode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import leaflet_sidebar from 'leaflet-sidebar';
import InfiniteScroll from 'infinite-scroll'
import 'leaflet-control-geocoder';
import leaflet_timedimension from 'leaflet-timedimension';

const API_URL = 'https://decarbnow.space/api';
const DEBOUNCE_TIMEOUT = 200;
const JUMP_TIMEOUT = 5000;

//**************************************************************************
// configuration and declaration
//**************************************************************************
let decarbnowMap = map('map', {
    zoomControl: false, // manually added
    tap: true
//}).setView([48.2084, 16.373], 5);
//}).setView([, L.GeoIP.getPosition().lon], 12);
//}).setView([L.GeoIP.getPosition().lat, L.GeoIP.getPosition().lng], 15);
}).setView([47, 16], 5);

let toggleZoom = true;

let urlMarker = null;

let zoomState = 0;

let imageUrl = '/map/no2layers/World_raster_2020_02.png',
    imageBounds = [[-77.65, -155.95], [71.85, 166.15]];

let markerInfo = {
    "pollution":  {
        "img": "/map/img/pollution_glow.png", 
        "icon_img": "/map/img/pollution.png",
        //"fonticon": "nf nf-mdi-periodic_table_co2",
        //nf-mdi-thought_bubble, nf-fa-thumbs_down nf-mdi-flag
        "fonticon": "nf nf-mdi-periodic_table_co2",
        "cssname": "pollution",
        "title": "Pollution",
        "question": "Who pollutes our planet?",
        "desc": "Register and pinpoint polluters."
    },
    "climateaction": {
        "img": "/map/img/action_glow.png",
        "icon_img": "/map/img/action.png",
        //"fonticon": "nf nf-mdi-bullhorn",
        //nf-mdi-guy_fawkes_mask
        "fonticon": "fa fa-bullhorn",
        "cssname": "action",
        "title": "Climate Action",
        "question": "Who took action?",
        "desc": "Locate climate action to accelerate change."
    },
    "transition": {
        "img": "/map/img/transition_glow.png",
        "icon_img": "/map/img/transition.png",
        "fonticon": "nf nf-mdi-lightbulb_on",
        "cssname": "transition",
        "title": "Transition",
        "question": "Who takes the first step?",
        "desc": "Making climate transition initiatives visible."
    }
};

let currentMarkers = {};
let currentMarkerFilters = ["climateaction", "pollution", "transition"];

let LeafIcon = Icon.extend({
    options: {
        //shadowUrl: 'map/img/leaf-shadow.png',
        shadowUrl: '/map/img/icon-shadow.png',
        iconSize:     [24, 34],
        shadowSize:   [34, 34],
        iconAnchor:   [12, 34],
        shadowAnchor: [19, 34],
        popupAnchor:  [0, -16]
    }
});

let icons = {
    "pollution": markerInfo.pollution,
    "climateaction": markerInfo.climateaction,
    "transition": markerInfo.transition
};

let showGeoLoc = L.popup().setContent(
    '<p>Tell the World!</p>'
);

let markerClusters = L.markerClusterGroup(
    {
        disableClusteringAtZoom: 19,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
        //removeOutsideVisibleBounds: true
    });

let sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});

var infScroll = null;

sidebar.on('shown', function () {
    infScroll = new InfiniteScroll(document.getElementById('sidebar'), {
        history: false,
        path: '.nextTweet'
        //function() {
        //    return "https://decarbnow.space/api/render/1169366632000438272";
        //} //'.nextTweet'
    });
});

window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    console.debug("initialising ready function");
    t.ready = function(f) {
        console.debug("inside loading");
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"));

window.twttr.ready(function() {
    console.log('ready');
});


//**************************************************************************
// functions
//**************************************************************************
function locate() {
      map.locate({setView: true});
}


function centerLeafletMapOnMarker(map, marker, d_zoom) {
    var sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
    var markerLatLon = marker.getLatLng();
    //var lat = markerLatLon.lat;
    //var lng = markerLatLon.lng;
    
    if (map.getZoom() >= 7) {
        var targetZoom = map.getZoom();
    } else {
        var targetZoom = map.getZoom() + d_zoom;
    }

    var targetPoint = map.project(markerLatLon, targetZoom).subtract([sidebarOffset / 2, 0]),
        targetLatLng = map.unproject(targetPoint, targetZoom);

    map.flyTo(targetLatLng, targetZoom, {
        animate: true,
        duration: 1.5
    });
}

function initializeMarkers() {
    currentMarkers = {
        "pollution": [],
        "climateaction": [],
        "transition": []
    };
}

function createBackgroundMap() {
    return tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //return tileLayer('https://api.mapbox.com/styles/v1/sweing/cjrt0lzml9igq2smshy46bfe7/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3dlaW5nIiwiYSI6ImNqZ2gyYW50ODA0YTEycXFxYTAyOTZza2IifQ.NbvRDornVZjSg_RCJdE7ig', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, '+ 
                     '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                     '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                     '<a href="https://github.com/wri/global-power-plant-database">WRI</a>'
    });
}


function createBackgroundMapSat() {
    return tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: '© <a href="https://maps.google.com">Google Maps</a>, '+ 
                     '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA OMI</a>, '+
                     '<a href="https://github.com/wri/global-power-plant-database">WRI</a>'
    });
}
/*
function createBackgroundMapSat() {
    return tileLayer('https://api.mapbox.com/styles/v1/sweing/ck1xo0pmx1oqs1co74wlf0dkn/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3dlaW5nIiwiYSI6ImNqZ2gyYW50ODA0YTEycXFxYTAyOTZza2IifQ.NbvRDornVZjSg_RCJdE7ig', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © <a href="https://www.mapbox.com/legal/tos/">MapBox</a>'
    });
}
*/
//https://api.mapbox.com/styles/v1/sweing/ck1xo0pmx1oqs1co74wlf0dkn/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3dlaW5nIiwiYSI6ImNqZ2gyYW50ODA0YTEycXFxYTAyOTZza2IifQ.NbvRDornVZjSg_RCJdE7ig
//https://api.mapbox.com/styles/v1/sweing/cjrt0lzml9igq2smshy46bfe7/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3dlaW5nIiwiYSI6ImNqZ2gyYW50ODA0YTEycXFxYTAyOTZza2IifQ.NbvRDornVZjSg_RCJdE7ig


function pollutionStyle(feature) {
    return {
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
        fillOpacity: getPollutionOpacity(feature.properties.value)
    };
}

function getPollutionOpacity(value) {

    //let max = 24009000000000000;
    //let min = 350000000000000;
    let max = 1;
    let min = 0;

    //return Math.max(0, (value - min ) / (max - min) * 0.3);
    return 0.05;
}

function createLayer1() {
    return L.tileLayer(
        'https://api.mapbox.com/styles/v1/sweing/ck1xo0pmx1oqs1co74wlf0dkn/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic3dlaW5nIiwiYSI6ImNqZ2gyYW50ODA0YTEycXFxYTAyOTZza2IifQ.NbvRDornVZjSg_RCJdE7ig', {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
}

function showError() {
    alert('Please make sure, all blockers are disabled. Otherwise, tweets will not load.');
    /*
    modal(
        { title: 'Disable Blockers'
            , content: 'Please make sure, all blockers are disabled. Otherwise, tweets will not load.'
            , buttons:
                [
                    { text: 'OK', event: 'cancel', keyCodes: [ 13, 27 ] }
//                    , { text: 'Delete', event: 'confirm', className: 'button-danger', iconClassName: 'icon-delete' }
                ]
        });
        //.on('confirm', deleteItem)
    */
}


/*
let videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
    videoBounds = [[ 32, -130], [ 13, -100]];
L.videoOverlay(videoUrl, videoBounds ).addTo(decarbnowMap);
*/

/*
let videoUrl = 'map/img/tropomi.mp4',
    videoBounds = [[ 70, -180], [ -70, 180]],
    videoOptions = {opacity: 0.5};
L.videoOverlay(videoUrl, videoBounds, videoOptions).addTo(decarbnowMap);
*/

function checkMatch(url, item) {
    if (url.length == 0 || url.split("/").length < 3) {
        return false;
    }
    let r = new RegExp("[\(\)]", "g");
    let lng = item.position.replace(r, "").split(" ")[1]*1;
//    console.debug(lng);
    let lat = item.position.replace(r, "").split(" ")[2]*1;
//    console.debug(lat);
    let urlGeohash = url.split("/")[2].toLowerCase();
//    console.debug(urlGeohash);
    let type = url.split("/")[3].toLowerCase();
//    console.debug(type);
    let itemGeohash = encode(lng, lat).substr(0, urlGeohash.length);
//    console.debug(itemGeohash);
    if (urlGeohash == itemGeohash && item.type == type) {
        return true;
    }
    return false;
}

//console.log(markers);

function refreshMarkers() {
    markerClusters.clearLayers()
    if ($('.decarbnowpopup').length > 0) {
        return;
    }
    console.log("refreshing markers from " + API_URL + '/poi');

    $.get(API_URL + "/poi?size=100", function(data) {
        console.log("function refreshMarkers");
        for (var i in currentMarkers) {
            for (var mi in currentMarkers[i]) {
                decarbnowMap.removeLayer(currentMarkers[i][mi]);
            }
        }

        initializeMarkers();
        data._embedded.poi.forEach(function(item) {

            // create the text, that will be shown, when clicking on the poi
            let text = '';
            let twitterIds = [];
            //"POINT (48.1229059305042 16.5587781183422)"
            let p = item.position;
            let bp = p.substring(p.indexOf("(")+1,p.indexOf(")")).split(" ");
            let long = parseFloat(bp[0]);
            let lat = parseFloat(bp[1]);
            
            if(currentMarkerFilters.indexOf(item.type) === -1) {
                return;
            }

            // add the original tweet to the panel OR the text of the tweet, if no original URL is specified
            if (item.urlOriginalTweet) {
                text += '<div id="tweet-' + item.tweetId + '"></div>'; // <a href=\"" + item.origurl + "\"><img src=\"map/img/twitter.png\" /></a>
                twitterIds.push(item.tweetId);
                if (item.replyFromSameUser && item.nextTweetId) {
                    text += '<div id="tweet-' + item.nextTweetId + '"></div>'; // <a href=\"" + item.origurl + "\"><img src=\"map/img/twitter.png\" /></a>
                    twitterIds.push(item.nextTweetId);
                    text += '<a class="nextTweet" href="' + API_URL + '/render/' + item.nextTweetId + '"></a>';
                }
            } else {
                // this is basically obsolete, as all tweets have an original url
                text += replaceURLWithHTMLLinks('<h3>' + item.text + '</h3>');

                // add the replied tweet to the panel
                if (item.urlInReplyTweet) {
                    let tws = item.urlInReplyTweet.split("/");
                    let twitterId = tws[tws.length-1];
                    text += '<div id="tweet-' + twitterId + '"></div>'; // <a href=\"" + item.origurl + "\"><img src=\"map/img/twitter.png\" /></a>
                    twitterIds.push(twitterId);
                }

                // add the quoted tweet to the panel
                if (item.urlQuotedTweet) {
                    let tws = item.urlQuotedTweet.split("/");
                    let twitterId = tws[tws.length-1];
                    text += '<div id="tweet-' + twitterId + '"></div>'; // <a href=\"" + item.origurl + "\"><img src=\"map/img/twitter.png\" /></a>
                    twitterIds.push(twitterId);
                }
            }
            let icon = L.divIcon({
                iconSize: [30, 42],
                iconAnchor: [15, 42] // half of width + height
            });
            //console.log(item.type);
            icon = L.divIcon({
                className: 'custom-div-icon',
                html: "<div class='marker-pin " + icons[item.type].cssname + "'></div><i class='"+ icons[item.type].fonticon +" " + icons[item.type].cssname +"'>",
                iconSize: [24, 34],
                iconAnchor: [12, 34]
                });

            let mm = marker([long, lat], {icon: icon});

            //mm.sidebar.setContent(twemoji.parse(text)).show()

            //decarbnowMap.addLayer(markerClusters);
            currentMarkers[item.type].push(mm
                .addTo(markerClusters)
                .on('click', function () {
                    sidebar.show();
                    sidebar.setContent(twemoji.parse(text));
                    for (let idx in twitterIds) {
                        let twitterId = twitterIds[idx];
                        //console.debug("rendering " + twitterId, document.getElementById('tweet-' + twitterId));
                        window.twttr.widgets.createTweet(twitterId, document.getElementById('tweet-' + twitterId)).then(() => {
                            //console.debug('created tweet');
                            //infScroll.loadNextPage();
                        });
                    }
                    
                    centerLeafletMapOnMarker(decarbnowMap, mm, 2);
                    
                })
            );

            if (urlMarker == null && checkMatch(window.location.pathname, item)) {
                console.debug("found url marker!", item, mm);
                urlMarker = {
                    marker: mm,
                    text: text,
                    twitterIds: twitterIds
                };
            }
        });

        if (urlMarker != null) {
            console.debug("jumping to poi in " + JUMP_TIMEOUT + "ms:", urlMarker);
            window.setTimeout(function () {
                console.debug("jumping now");

                sidebar.show();
                sidebar.setContent(twemoji.parse(urlMarker.text));
                for (let idx in urlMarker.twitterIds) {
                    let twitterId = urlMarker.twitterIds[idx];
                    //console.debug("rendering " + twitterId, document.getElementById('tweet-' + twitterId));
                    window.twttr.widgets.createTweet(twitterId, document.getElementById('tweet-' + twitterId)).then(() => {
                        //console.debug('created tweet');
                        //infScroll.loadNextPage();
                    });
                }

                centerLeafletMapOnMarker(decarbnowMap, urlMarker.marker, 2);
            }, JUMP_TIMEOUT);
        }
    });
}

L.Control.Layers.TogglerIcon = L.Control.Layers.extend({
    options: {
        // Optional base CSS class name for the toggler element
        togglerClassName: undefined
    },

    _initLayout: function(){
        L.Control.Layers.prototype._initLayout.call(this);
        if (this.options.togglerClassName) {
            L.DomUtil.addClass(this._layersLink, togglerClassName);
        }
    }
});

L.control.layers.TogglerIcon = function(opts) {
    return new L.Control.Layers.TogglerIcon(opts);
};

L.GeoIP = L.extend({
  getPosition: function (ip) {
    var url = "https://freegeoip.app/json/";
    var result = L.latLng(0, 0);

    if (ip !== undefined) {
      url = url + ip;
    } else {
      //url = url + "143.130.30.36";
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function () {
      var status = xhr.status;
      if (status == 200) {
        var geoip_response = JSON.parse(xhr.responseText);
        result.lat = geoip_response.latitude;
        result.lng = geoip_response.longitude;
      } else {
        console.log("Leaflet.GeoIP.getPosition failed because its XMLHttpRequest got this response: " + xhr.status);
      }
    };
    xhr.send();
    return result;
  },

  centerMapOnPosition: function (map, zoom, ip) {
    var position = L.GeoIP.getPosition(ip);
    map.setView(position, zoom);
  }
});


L.Control.Markers = L.Control.extend({
    onAdd: function(map) {
        let markerControls = L.DomUtil.create('div');
        markerControls.style.width = '400px';
        markerControls.style.height = '24px';
        markerControls.style.backgroundColor = '#fff';
        markerControls.style.display = 'flex';
        markerControls.style.flexDirection = 'row';
        markerControls.style.justifyContent = 'space-evenly';
        markerControls.style.alignItems = 'center';
        markerControls.style.paddingBottom = "0px";
        markerControls.classList.add("leaflet-bar");
        

        Object.keys(markerInfo).forEach(markerKey => {
            let marker = markerInfo[markerKey];
            let markerContainer = L.DomUtil.create('div');
            markerContainer.innerHTML = '<div class="bubble ' + marker.cssname +'"><i class="' + marker.fonticon + '"></i></div> ' + marker.title;
            markerContainer.title = marker.question + " " + marker.desc;
            markerControls.append(markerContainer);
            //console.log(markerContainer);
        });

        return markerControls;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});
L.control.markers = function(opts) {
    return new L.Control.Markers(opts);
};

function setTweetMessage(variable){
        var a = document.getElementById(variable);
        a.value = "new value";
}   

function replaceURLWithHTMLLinks(text){
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(exp,"<a href='$1'>$1</a>"); 
}

//**************************************************************************
// events
//**************************************************************************
decarbnowMap.on('contextmenu',function(e){

    console.debug(e);

    let hash = encode(e.latlng.lat, e.latlng.lng);

    let text = '<h3>Tweet about</h3>'+
    '<select id="icontype">'+
    '<option value="pollution" data-image="/map/img/pollution.png">Pollution</option>'+
    '<option value="climateaction"  data-image="/map/img/action.png">Climate Action</option>'+
    '<option value="transition" data-image="/map/img/transition.png">Transition</option>'+
    '</select>'+
    '<form>'+
    '<textarea id="tweetText" ></textarea>' +
    '</form>'+
    '<div id="tweetBtn">'+
    '<a class="twitter-share-button" href="http://twitter.com/share" data-url="null" data-text="#decarbnow">Tweet</a>'+
    '</div>';

    showGeoLoc
        .setLatLng(e.latlng)
        .setContent(text)
        .openOn(decarbnowMap);

    //here comes the beauty
    function onTweetSettingsChange (e) {
        let tweettypeInput = document.getElementById("icontype");
        let tweettype = tweettypeInput.options[tweettypeInput.selectedIndex].value;

        let tweet = '#decarbnow ' + $('#tweetText').val();

        tweet += ' https://decarbnow.space/map/' + hash + '/' + tweettype;

        // Remove existing iframe
        $('#tweetBtn').html('');
        // Generate new markup
        var tweetBtn = $('<a></a>')
            .addClass('twitter-share-button')
            .attr('href', 'http://twitter.com/share')
            .attr('data-url', 'null')
            .attr('data-text', tweet);
        $('#tweetBtn').append(tweetBtn);

        window.twttr.widgets.load();
    }

    function debounce(callback) {
        // each call to debounce creates a new timeoutId
        let timeoutId;
        return function() {
            // this inner function keeps a reference to
            // timeoutId from the function outside of it
            clearTimeout(timeoutId);
            timeoutId = setTimeout(callback, DEBOUNCE_TIMEOUT);
        }
    }

    $('#icontype').on('change', onTweetSettingsChange);

    $('#tweetText').on('input', function() {
        debounce(onTweetSettingsChange)();
    });

    //console.log(e);
    window.twttr.widgets.load();
});

decarbnowMap.on('click', function () {
    sidebar.hide();
    if (typeof twittermarker !== 'undefined') { // check
        decarbnowMap.removeLayer(twittermarker); // remove
    }
});


//**************************************************************************
// initiation
//**************************************************************************

initializeMarkers();
refreshMarkers();

// add GeoJSON layers to the map once all files are loaded
$.getJSON("/map/no2layers/World_2007_rastered.geojson",function(no2_2007){
    $.getJSON("/map/no2layers/World_2011_rastered.geojson",function(no2_2011){
        $.getJSON("/map/no2layers/World_2015_rastered.geojson",function(no2_2015){
            $.getJSON("/map/no2layers/World_2019_rastered.geojson",function(no2_2019){
            	$.getJSON("/map/no2layers/World_2019_12.geojson",function(no2_2019_12){
	            	$.getJSON("/map/no2layers/World_2020_01.geojson",function(no2_2020_01){
	            		$.getJSON("/map/no2layers/World_2020_02.geojson",function(no2_2020_02){
	            			$.getJSON("/map/no2layers/World_2020_03.geojson",function(no2_2020_03){
			            		$.getJSON("/map/global_power_plant_database.geojson",function(coalplants) {
				                    
				                    let baseLayers = {
				                        "Satellite": createBackgroundMapSat(),
				                        "Streets": createBackgroundMap().addTo(decarbnowMap)
				                    };
				                    let overlays = {
				                        "NO<sub>2</sub> 2007": L.geoJson(no2_2007, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2011": L.geoJson(no2_2011, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2015": L.geoJson(no2_2015, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2019": L.geoJson(no2_2019, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2019-12": L.geoJson(no2_2019_12, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2020-01": L.geoJson(no2_2020_01, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2020-02": L.geoJson(no2_2020_02, {style: pollutionStyle}),
				                        "NO<sub>2</sub> 2020-03": L.geoJson(no2_2020_03, {style: pollutionStyle}).addTo(decarbnowMap),
				                        "Disable": L.geoJson(null, {style: pollutionStyle})
				                        
				                    };
				                    
				                    

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
				                        }).addTo(decarbnowMap)
				                    }

				                    decarbnowMap.addLayer(markerClusters);
				                    L.control.layers(baseLayers, overlays_other,{collapsed:false}).addTo(decarbnowMap);
				                    L.control.layers(overlays, null, {collapsed:false}).addTo(decarbnowMap);
				                    L.Control.geocoder({position: "topleft"}).addTo(decarbnowMap);      

				                    decarbnowMap.addControl(sidebar);
				           	 	});
				           	});
		                });
	                });
	            });
	        });
        });
    });
});
  
L.control.markers({ position: 'topleft' }).addTo(decarbnowMap);
L.control.zoom({ position: 'topleft' }).addTo(decarbnowMap);
L.GeoIP.centerMapOnPosition(decarbnowMap, 5);
window.setInterval(refreshMarkers, 30000);
