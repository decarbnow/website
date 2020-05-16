import 'leaflet';
import twemoji from 'twemoji';
import { encode, decode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import tweetList from './tweets.json';

let manager = {
    currentMarkers: {},

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
    },

    getLatLng: function(tweetInfo) {
        let t = decode(tweetInfo['@']);
        return {
            lat: t.latitude,
            lng: t.longitude,
        }
    },

    activate: function(id) {
        let tweet = tweetList.tweets[id];

        if (tweet.ls) {
            Object.values(base.layers).forEach(ls => {
                ls.getActiveLayers().forEach((l) => {
                    l.removeFrom(base.map)
                });
            });

            tweet.ls.forEach((n) => {
                console.log('ACTIVATE LAYER ' + n)
                base.activateLayer(n);
            });
        }
        // let p = state.center || s.center;

        let z = 10;
        if (tweet.z)
            z = tweet.z


        base.map.setView(manager.getLatLng(tweet), z);

    },

    load: function() {
        console.log(tweetList)
        Object.keys(tweetList.tweets).forEach((id) => {
            let info = tweetList.tweets[id];

            L.marker(manager.getLatLng(info), {icon: icons[info.tags[0]]})
                .addTo(manager.clusters)
                .on('click', function () {
                    if (window.twttr.widgets) {
                        let ids = [id];
                        if (info.story)
                            ids = tweetList.stories[info.story];

                        let entries = ids.map(tweetId => {
                            let classes = ['tweet'];
                            if (id == tweetId)
                                classes.push('selected');
                            return `
                                <div class="${classes.join(' ')}" data-tweet="${tweetId}">
                                    <div class="control">${tweetId}</div>
                                    <div class="widget">
                                    </div>
                                </div>`;
                        });
                        let text = entries.join('');
                        if (info.story)
                            text = `<div class="story" data-story="${info.story}">${text}</div>`;

                        base.showSidebar('show-tweet')
                            .setContent(text);

                        $('#show-tweet-sidebar .tweet').each((i, e) => {
                            let te = $(e)
                            window.twttr.widgets.createTweet(te.data('tweet'), te.find('.widget')[0], {conversation: 'none'}).then(() => {
                                te.addClass('loaded');
                            });
                        });

                        $('#show-tweet-sidebar').on("click", "div.tweet", function() {
                            let tweet = $(this)
                            manager.activate(tweet.data('tweet'));
                            tweet.parent().find('.tweet.selected').removeClass('selected');
                            tweet.addClass('selected');
                        });
                    }

                })
        });
    }
}

export default manager
