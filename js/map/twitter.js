import { icons } from "./marker/icons.js";
import { encode } from '@alexpavlov/geohash-js';

import base from './base.js'

const DEBOUNCE_TIMEOUT = 200;

let twitter = {
    sidebar: null,
    marker: L.marker(null, {icon: icons['pollution']}),
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
    openSidebar: function(latlng) {
        // update marker
        twitter.marker.setLatLng(latlng);
        twitter.marker.addTo(base.map);

        // open sidebar
        base.showSidebar(twitter);

        //here comes the beauty
        function onTweetSettingsChange(e) {
            let tweettype = $('#new-tweet-sidebar select.icontype').val();

            twitter.marker.setIcon(icons[tweettype])

            let tweet = $('#new-tweet-sidebar textarea').val();

            if (tweet.search("#decarbnow") == -1)
                tweet = '#decarbnow ' + tweet;

            //tweet += ' https://decarbnow.space/map/' + hash + '/' + tweettype;

            // Remove existing iframe
            $('#new-tweet-sidebar .tweetBtn').html('');
            // Generate new markup
            var tweetBtn = $('<a></a>')
                .addClass('twitter-share-button')
                .attr('href', 'http://twitter.com/share')
                .attr('data-url', 'https://decarbnow.space/map/')
                //.attr('data-url', 'https://decarbnow.space/map/' + hash + '/' + tweettype)
                .attr('data-text', tweet);
            $('#new-tweet-sidebar .tweetBtn').append(tweetBtn);

            if(window.twttr.widgets)
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

        $('#new-tweet-sidebar select.icontype').on('change', onTweetSettingsChange);

        $('#new-tweet-sidebar textarea').on('input', function() {
            debounce(onTweetSettingsChange)();
        });

        //init debounce
        debounce(onTweetSettingsChange)();
        //console.log(e);
        if(window.twttr.widgets){
            window.twttr.widgets.load();
        }
    },
    closeSidebar: function() {
        twitter.sidebar.hide();
    }
}

export default twitter
