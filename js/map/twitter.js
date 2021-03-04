import { icons } from "./marker/icons.js";
import { encode } from '@alexpavlov/geohash-js';
import 'twitter-widgets';
import base from './base.js'

const DEBOUNCE_TIMEOUT = 200;
var twittermarker;

var TwitterWidgetsLoader = require('twitter-widgets');

let showGeoLoc = L.popup().setContent(
    '<p>Tell the World!</p>'
);

let twitter = {
    sidebar: null,
    marker: L.marker(null, {icon: icons['climateaction']}),
    init: function() {
        twitter.sidebar = L.control.sidebar('new-tweet-sidebar', {
            closeButton: false,
            position: 'left'
        });
        base.map.addControl(twitter.sidebar)
        twitter.sidebar.on('hide', function () {
            twitter.marker.remove()
        });

    },
    showTweetBox: function(e) {
        // update marker
        twitter.marker.setLatLng(e.latlng);
        twitter.marker.addTo(base.map);

        // open sidebar
        //base.showSidebar(twitter);

        //twittermarker = L.marker(e.latlng);

        //base.map.addLayer(twittermarker);

        let hash = encode(e.latlng.lat, e.latlng.lng);

        let text = '<p>Tweet about stuff here with the button below:</p>' +
        '<center><a target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="false" data-text=""></center>'

        showGeoLoc
            .setLatLng(e.latlng)
            .setContent(text)
            .openOn(base.map);


        //base.map.showSidebar(twitter, text)
        //base.map.sidebar.setContent(text)

        //console.log(e);
        TwitterWidgetsLoader.load(function(err, twttr) {
            if (err) {
                showError();
                //do some graceful degradation / fallback
                return;
            }

            twttr.widgets.load();
        });

        //here comes the beauty
        // function onTweetSettingsChange(e) {
        //     let tweettype = $('#new-tweet-sidebar select.icontype').val();
        //
        //     twitter.marker.setIcon(icons['climateaction'])
        //
        //     let tweet = $('#new-tweet-sidebar textarea').val();
        //
        //     if (tweet.search("#decarbnow") == -1)
        //         tweet = '#decarbnow ' + tweet;
        //
        //     //tweet += ' https://decarbnow.space/map/' + hash + '/' + tweettype;
        //
        //     // Remove existing iframe
        //     $('#new-tweet-sidebar .tweetBtn').html('');
        //     // Generate new markup
        //     var tweetBtn = $('<a></a>')
        //         .addClass('twitter-share-button')
        //         .attr('href', 'http://twitter.com/share')
        //         .attr('data-url', 'https://decarbnow.space/map/')
        //         //.attr('data-url', 'https://decarbnow.space/map/' + hash + '/' + tweettype)
        //         .attr('data-text', tweet);
        //     $('#new-tweet-sidebar .tweetBtn').append(tweetBtn);
        //
        //     if(window.twttr.widgets)
        //         window.twttr.widgets.load();
        // }
        //
        // function debounce(callback) {
        //     // each call to debounce creates a new timeoutId
        //     let timeoutId;
        //     return function() {
        //         // this inner function keeps a reference to
        //         // timeoutId from the function outside of it
        //         clearTimeout(timeoutId);
        //         timeoutId = setTimeout(callback, DEBOUNCE_TIMEOUT);
        //     }
        // }
        //
        // $('#new-tweet-sidebar select.icontype').on('change', onTweetSettingsChange);
        //
        // $('#new-tweet-sidebar textarea').on('input', function() {
        //     debounce(onTweetSettingsChange)();
        // });
        //
        // //init debounce
        // debounce(onTweetSettingsChange)();
        // //console.log(e);
        // if(window.twttr.widgets){
        //     window.twttr.widgets.load();
        // }
    },
    closeSidebar: function() {
        twitter.sidebar.hide();
    }
}

export default twitter
