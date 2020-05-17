import 'leaflet';
import twemoji from 'twemoji';
import { encode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
//import 'leaflet.marker.highlight';

const API_URL = 'https://decarbnow.space/api';


function replaceURLWithHTMLLinks(text){
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1'>$1</a>");
}

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

let tweets = {
    currentMarkers: {},

    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 19,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
        //removeOutsideVisibleBounds: true
    }),

    init: function() {
        base.layerSets.points.layers.tweetsLegacy.addLayer(tweets.clusters);
        tweets.reset()
        tweets.refresh()
        window.setInterval(tweets.refresh, 30000);
    },

    reset: function() {
        Object.values(tweets.currentMarkers).forEach(g => {
            g.forEach(m => {
                base.map.removeLayer(m);
            });
        });
        tweets.currentMarkers = {};
    },

    refresh: function() {
        tweets.clusters.clearLayers()

        console.log("refreshing tweets from " + API_URL + '/poi');

        $.get(API_URL + "/poi?size=100", function(data) {
            tweets.reset();
            data._embedded.poi.forEach(function(item) {

                // create the text, that will be shown, when clicking on the poi
                let text = '';
                let twitterIds = [];

                //"POINT (48.1229059305042 16.5587781183422)"
                let temp = item.position.substring(item.position.indexOf("(") + 1, item.position.indexOf(")")).split(" ");
                let latlng = {
                    lat: parseFloat(temp[0]),
                    lng: parseFloat(temp[1])
                }

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

                let mm = L.marker(latlng, {icon: icons[item.type]})
                    .addTo(tweets.clusters)
                    .on('click', function () {
                        if (window.twttr.widgets){
                            base.showSidebar('show-tweet')
                                .setContent(twemoji.parse(text));

                            for (let idx in twitterIds) {
                                let twitterId = twitterIds[idx];
                                window.twttr.widgets.createTweet(twitterId, document.getElementById('tweet-' + twitterId))
                            }
                        }

                        centerLeafletMapOnMarker(base.map, mm, 2);
                    })

                if (!tweets.currentMarkers[item.type])
                    tweets.currentMarkers[item.type] = [];

                tweets.currentMarkers[item.type].push(mm);


                let zoomLevel = 7;

                // if(!isNaN(Number(window.location.pathname.split("/")[4]))){
                //     zoomLevel = Number(window.location.pathname.split("/")[4]);
                // }

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
                        base.showSidebar('show-tweet')
                            .setContent(twemoji.parse(urlMarker.text));

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
                    centerLeafletMapOnMarker(base.map, urlMarker.marker, urlMarker.zoomLevel - base.map.getZoom());

                    jumpedToMarker = true;
                }, JUMP_TIMEOUT);
            }
        });
    }
}

export default tweets
