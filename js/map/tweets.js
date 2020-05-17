import 'leaflet';
import twemoji from 'twemoji';
import { encode, decode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import tweetList from './tweets.json';

let manager = {
    currentMarkers: {},
    autoScrolling: false,
    scrollPosition: null,
    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 19,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
        //removeOutsideVisibleBounds: true
    }),

    init: function() {
        base.layers.points.layers.tweets.addLayer(manager.clusters);
        manager.load()

        $('#show-tweet-sidebar').scroll(function(event) {
            if($('#show-tweet-sidebar .tweet.unloaded').length == 0 && !manager.autoScrolling && manager.scrollPosition) {
                let t = $('#show-tweet-sidebar .tweet.selected');
                let tn = null
                if ($('#show-tweet-sidebar').scrollTop() > manager.scrollPosition) {
                    tn = t.next('.tweet')
                } else {
                    tn = t.prev('.tweet')
                }
                if (tn.length > 0) {
                    manager.activate(tn.data('tweet'));
                }
            }
            manager.scrollPosition = $('#show-tweet-sidebar').scrollTop()
        });
    },

    getLatLng: function(tweetInfo) {
        let t = decode(tweetInfo['@']);
        return {
            lat: t.latitude,
            lng: t.longitude,
        }
    },

    activate: function(id) {
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
        // let p = state.center || s.center;

        let z = 10;
        if (tweetInfo.z)
            z = tweetInfo.z


        let sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width,
            latlng = manager.getLatLng(tweetInfo);

        base.map.flyTo(base.map.unproject(base.map.project(latlng, z).subtract([sidebarOffset / 2, 0]), z), z);
        //console.log('Autoscrolling to: ' + id + ' Tweet positon: ' + tweetDiv.position().top)
        manager.autoScrolling = true;
        $('#show-tweet-sidebar').animate({
            scrollTop: $('#show-tweet-sidebar').scrollTop() + tweetDiv.position().top
        }, 500, function() {
            setTimeout(function() {
                manager.autoScrolling = false;
            }, 200);
        })

        tweetDiv.parent().find('.tweet.selected').removeClass('selected');
        tweetDiv.addClass('selected');
    },

    initSidebar: function(id) {
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
                </div>`;
        });
        let text = entries.join('');
        if (tweetInfo.story)
            text = `<div id="story-${tweetInfo.story}" class="story" data-story="${tweetInfo.story}">${text}</div>`;

        base.showSidebar('show-tweet')
            .setContent(text);

        $('#show-tweet-sidebar .tweet').each((i, e) => {
            let te = $(e)
            window.twttr.widgets.createTweet(te.data('tweet'), te.find('.widget')[0], {conversation: 'none'}).then(() => {
                te.addClass('loaded');
                te.removeClass('unloaded');
                if($('#show-tweet-sidebar .tweet.unloaded').length == 0) {
                    manager.activate(id);
                }
            });
        });

        // $('#show-tweet-sidebar').on("click", "div.tweet", function() {
        //     let tweet = $(this)
        //     manager.activate(tweet.data('tweet'));
        // });
    },

    load: function() {
        console.log(tweetList)
        Object.keys(tweetList.tweets).forEach((id) => {
            let tweetInfo = tweetList.tweets[id];
            L.marker(manager.getLatLng(tweetInfo), {icon: icons[tweetInfo.tags[0]]})
                .addTo(manager.clusters)
                .on('click', function () {
                    // IS OPEN
                    if (tweetInfo.story && base.sidebars['show-tweet'].isVisible() & $(`#story-${tweetInfo.story}`).length) {
                        manager.activate(id);
                    } else {
                        manager.initSidebar(id);
                    }

                })
        });
    }
}

export default manager
