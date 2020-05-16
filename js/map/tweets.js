import 'leaflet';
import twemoji from 'twemoji';
import { encode, decode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import tweetList from './tweets.json';

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
        base.layers.points.layers.tweets.addLayer(tweets.clusters);
        tweets.load()
    },

    load: function() {
        console.log(tweetList)
        Object.keys(tweetList.tweets).forEach((id) => {
            let info = tweetList.tweets[id];
            let t = decode(info.geohash);
            let latlng = {
                lat: t.latitude,
                lng: t.longitude,
            }

            L.marker(latlng, {icon: icons[info.tags[0]]})
                .addTo(tweets.clusters)
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
                    }

                })
        });
    }
}

export default tweets
