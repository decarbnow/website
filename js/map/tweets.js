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

            let ids = [id];
            if (info.story && tweetList.stories[info.story])
                ids = tweetList.stories[info.story];

            L.marker(latlng, {icon: icons[info.tags[0]]})
                .addTo(tweets.clusters)
                .on('click', function () {
                    if (window.twttr.widgets) {

                        let text = ids.map(tweetId => {
                            return `<div class="tweet" data-tweet="${tweetId}"></div>`;
                        }).join('')

                        base.showSidebar('show-tweet')
                            .setContent(text);

                        $('#sidebar .tweet').each((i, tweetTemplate) => {
                            window.twttr.widgets.createTweet($(tweetTemplate).data('tweet'), tweetTemplate, {conversation: 'none'});
                        });


                        //window.twttr.widgets.createTweet(info.id, document.getElementById('tweetABC-' + info.id), {conversation: 'none'}).then(() => {
                        //     console.debug('created tweet');
                        // });
                    }

                })
        });
    }
}

export default tweets
