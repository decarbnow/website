import 'leaflet';
import twemoji from 'twemoji';
import { encode, decode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import tweetList from './tweets.json';
import url from './url.js';

let manager = {
    sidebar: null,
    activeTweet: null,
    autoScrolling: false,
    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 19,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
        //removeOutsideVisibleBounds: true
    }),

    init: function() {
        manager.sidebar = L.control.sidebar('show-tweet-sidebar', {
            closeButton: false,
            position: 'left'
        });
        base.map.addControl(manager.sidebar)

        manager.sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
        base.layerSets.points.layers.tweets.addLayer(manager.clusters);

        manager.load();

        function scrollAction(direction) {
            let t = $('#show-tweet-sidebar .tweet.selected');
            let tn = null;

            if (direction == 'down')
                tn = t.next('.tweet');
            else if (direction == 'up')
                tn = t.prev('.tweet');

            if (tn.length > 0) {
                manager.activate(tn.data('tweet'));
            }
        }

        // wheel scroll
        $('#show-tweet-sidebar').bind('wheel scroll', function(e) {
            if($('#show-tweet-sidebar .tweet.unloaded').length == 0  && !manager.autoScrolling) {
                if (e.originalEvent.wheelDelta / 120 <= 0) {
                    scrollAction('down')
                } else {
                    scrollAction('up')
                }
            }
        });

        // touch display
        let ts = null;
        $('#show-tweet-sidebar').bind('touchstart', function(e) {
            ts = e.originalEvent.touches[0].clientY;
        });
        $('#show-tweet-sidebar').bind('touchmove', function(e) {
            if($('#show-tweet-sidebar .tweet.unloaded').length == 0  && !manager.autoScrolling) {
                if (ts > e.originalEvent.changedTouches[0].clientY) {
                    scrollAction('down')
                } else {
                    scrollAction('up')
                }
            }
        });

        //Move on click:
        /*
        $('#show-tweet-sidebar').bind('click', function(e){
          if($('#show-tweet-sidebar .tweet.unloaded').length == 0  && !manager.autoScrolling) {
              if ($(this).hasClass('next')) {
                  scrollAction('down')
              } else {
                  scrollAction('up')
              }
          }
        });
        */

    },

    getLatLng: function(tweetInfo) {
        let t = decode(tweetInfo['@']);
        return {
            lat: t.latitude,
            lng: t.longitude,
        }
    },

    activate: function(id, move = true) {
        let tweetInfo = tweetList.tweets[id];
        let tweetDiv = $(`#tweet-${id}`);

        if (tweetInfo.ls) {
            let visibleLayers = base.getVisibleLayerIds()

            let hide = visibleLayers.filter(x => !tweetInfo.ls.includes(x));
            hide.forEach((lid) => {
                base.hideLayerId(lid)
            });

            let show = tweetInfo.ls.filter(x => !visibleLayers.includes(x) );
            show.forEach((lid) => {
                base.showLayerId(lid)
            });
        }

        let z = 10;
        if (tweetInfo.z)
            z = tweetInfo.z

        if (move) {
            let latlng = manager.getLatLng(tweetInfo);
            base.map.flyTo(base.map.unproject(base.map.project(latlng, z).subtract([manager.sidebarOffset / 2, 0]), z), z);
        }

        manager.autoScrolling = true;
        $('#show-tweet-sidebar').animate({
            scrollTop: $('#show-tweet-sidebar').scrollTop() + tweetDiv.position().top - 100
        }, 500, function() {
            setTimeout(function() {
                manager.autoScrolling = false;
            }, 200);
        })

        tweetDiv.parent().find('.tweet.selected').removeClass('selected');
        tweetDiv.addClass('selected');

        manager.activeTweet = id;
        url.pushState()
    },

    openSidebar: function(id, move = true) {
        let tweetInfo = tweetList.tweets[id];

        let ids = [id];
        if (tweetInfo.story)
            ids = tweetList.stories[tweetInfo.story];

        let entries = ids.map(tweetId => {
            let classes = ['tweet', 'unloaded'];
            if (id == tweetId)
                classes.push('selected');
            return `
                <div id="tweet-${tweetId}" class="${classes.join(' ')}" data-tweet="${tweetId}">
                    <div class="widget"></div>
                    <div class="overlay"><div class="top-up"><i class="arrow down"></i></div><div class="bottom-down"><i class="arrow up"></i></div></div>
                </div>
                `;
        });
        let text = entries.join('');
        if (tweetInfo.story)
            text = `<div id="story-${tweetInfo.story}" class="story" data-story="${tweetInfo.story}">${text}</div>`;

        base.showSidebar(manager, text)

        $('#show-tweet-sidebar .tweet').each((i, e) => {
            let te = $(e)
            window.twttr.widgets.createTweet(te.data('tweet'), te.find('.widget')[0], {conversation: 'none'}).then(() => {
                te.addClass('loaded');
                te.removeClass('unloaded');
                if($('#show-tweet-sidebar .tweet.unloaded').length == 0) {
                    // all tweets are loaded
                    manager.activate(id, move);
                    $('#show-tweet-sidebar .tweet.loaded .overlay').on('click', function(e) {
                        manager.activate($(this).parents('.tweet').data('tweet'));
                    });
                }
            });
        });
    },

    closeSidebar: function() {
        manager.activeTweet = null;
        manager.sidebar.hide();
        url.pushState();
    },

    load: function() {
        Object.keys(tweetList.tweets).forEach((id) => {
            let tweetInfo = tweetList.tweets[id];
            L.marker(manager.getLatLng(tweetInfo), {icon: icons[tweetInfo.tags[0]]})
                .addTo(manager.clusters)
                .on('click', function () {
                    // IS OPEN
                    if (tweetInfo.story && manager.sidebar.isVisible() & $(`#story-${tweetInfo.story}`).length) {
                        manager.activate(id);
                    } else {
                        manager.openSidebar(id);
                    }
                })
        });
    }
}

export default manager
