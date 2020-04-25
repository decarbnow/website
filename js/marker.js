import {marker, Icon } from 'leaflet';
import twemoji from 'twemoji';
import { encode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import dmap from "./map.js";
//import 'leaflet.marker.highlight';


const API_URL = 'https://decarbnow.space/api';


function replaceURLWithHTMLLinks(text){
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(exp,"<a href='$1'>$1</a>"); 
}


let markerInfo = {
    "pollution":  {
        "fonticon": "nf nf-mdi-periodic_table_co2",
        "cssname": "pollution",
        "title": "Pollution",
        "question": "Who pollutes our planet?",
        "desc": "Register and pinpoint polluters."
    },
    "climateaction": {
        "fonticon": "fa fa-bullhorn",
        "cssname": "action",
        "title": "Climate Action",
        "question": "Who took action?",
        "desc": "Locate climate action to accelerate change."
    },
    "transition": {
        "fonticon": "nf nf-mdi-lightbulb_on",
        "cssname": "transition",
        "title": "Transition",
        "question": "Who takes the first step?",
        "desc": "Making climate transition initiatives visible."
    }
};


let icons = {
    "pollution": markerInfo.pollution,
    "climateaction": markerInfo.climateaction,
    "transition": markerInfo.transition
};

// let currentMarkerFilters = ["climateaction", "pollution", "transition"];




//let currentMarker = null;

let jumpedToMarker = false;

let urlMarker = null;

const JUMP_TIMEOUT = 2000;





function centerLeafletMapOnMarker(map, marker, d_zoom) {
    var sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
    var markerLatLon = marker.getLatLng();
    
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

function checkMatch(url, item) {
    if (url.length == 0 || url.split("/").length < 4) {
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



let markers = {
    currentMarkers: {},

    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 19,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
        //removeOutsideVisibleBounds: true
    }),

    init: function() {
        markers.reset()
        markers.refresh()
        window.setInterval(markers.refresh, 30000);
    },

    reset: function() {
        markers.currentMarkers = {
            "pollution": [],
            "climateaction": [],
            "transition": []
        };
    },


    refresh: function() {
        markers.clusters.clearLayers()
        if ($('.decarbnowpopup').length > 0) {
            return;
        }
        console.log("refreshing markers from " + API_URL + '/poi');

        $.get(API_URL + "/poi?size=100", function(data) {
            console.log("function refreshMarkers");
            for (var i in markers.currentMarkers) {
                for (var mi in markers.currentMarkers[i]) {
                    decarbnowMap.removeLayer(markers.currentMarkers[i][mi]);
                }
            }

            markers.reset();
            data._embedded.poi.forEach(function(item) {

                // create the text, that will be shown, when clicking on the poi
                let text = '';
                let twitterIds = [];
                //"POINT (48.1229059305042 16.5587781183422)"
                let p = item.position;
                let bp = p.substring(p.indexOf("(")+1,p.indexOf(")")).split(" ");
                let long = parseFloat(bp[0]);
                let lat = parseFloat(bp[1]);
                
                /*if(currentMarkerFilters.indexOf(item.type) === -1) {
                    return;
                }*/

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
                markers.currentMarkers[item.type].push(mm
                    .addTo(markers.clusters)
                    .on('click', function () {
                        // if(currentMarker){
                        //     currentMarker.disablePermanentHighlight();
                        //     currentMarker = null;
                        // } 
                        
                        if(window.twttr.widgets){
                            dmap.sidebar.show();
                            dmap.sidebar.setContent(twemoji.parse(text));
                            for (let idx in twitterIds) {
                                let twitterId = twitterIds[idx];
                                
                                //console.debug("rendering " + twitterId, document.getElementById('tweet-' + twitterId));
                                window.twttr.widgets.createTweet(twitterId, document.getElementById('tweet-' + twitterId)).then(() => {
                                    //console.debug('created tweet');
                                    //infScroll.loadNextPage();
                                });
                            }
                        }
                        
                        // ChangeUrl(item);
                        //function ChangeUrl(item) {
                        jumpedToMarker = true;
                        //console.log(item, mm);
                        let r = new RegExp("[\(\)]", "g");
                        let lng = item.position.replace(r, "").split(" ")[1]*1;
                        let lat = item.position.replace(r, "").split(" ")[2]*1;
                        let itemGeohash = encode(lng, lat);
                        if (typeof (history.pushState) != "undefined") {
                            var obj = { Title: itemGeohash, Url: '/map/' + itemGeohash + '/' + item.type};
                            history.pushState(obj, obj.Title, obj.Url);
                        } else {
                            alert("Browser does not support HTML5.");
                        }
                        //}

                        centerLeafletMapOnMarker(decarbnowMap, mm, 2);

                        // currentMarker = mm;
                        // currentMarker.enablePermanentHighlight();

                    })
                );
                            
                let zoomLevel = 7;
                
                if(!isNaN(Number(window.location.pathname.split("/")[4]))){
                    zoomLevel = Number(window.location.pathname.split("/")[4]);
                } 

                
                if (!jumpedToMarker && urlMarker == null && checkMatch(window.location.pathname, item)) {
    //                console.debug("found url marker!", item, mm);
                    urlMarker = {
                        marker: mm,
                        text: text,
                        twitterIds: twitterIds,
                        zoomLevel: zoomLevel,
                    };
                }
            });

            if (!jumpedToMarker && urlMarker != null) {
    //            console.debug("jumping to poi in " + JUMP_TIMEOUT + "ms:", urlMarker);
                window.setTimeout(function () {
    //                console.debug("jumping now");
                    if(window.twttr.widgets){
                        dmap.sidebar.show();
                        dmap.sidebar.setContent(twemoji.parse(urlMarker.text));
                        for (let idx in urlMarker.twitterIds) {
                            let twitterId = urlMarker.twitterIds[idx];
                            //console.debug("rendering " + twitterId, document.getElementById('tweet-' + twitterId));
                            window.twttr.widgets.createTweet(twitterId, document.getElementById('tweet-' + twitterId)).then(() => {
                                //console.debug('created tweet');
                                //infScroll.loadNextPage();
                            });
                        }
                    }
                    
                    console.log(urlMarker.zoomLevel)
                    centerLeafletMapOnMarker(decarbnowMap, urlMarker.marker, urlMarker.zoomLevel - decarbnowMap.getZoom());

                    /*currentMarker = urlMarker.marker;
                    
                    if(!decarbnowMap.hasLayer(currentMarker)){
                        decarbnowMap.addLayer(currentMarker);
                    }

                    currentMarker.enablePermanentHighlight();*/

                    jumpedToMarker = true;
                }, JUMP_TIMEOUT);
            }
        });
    }
}

export default markers