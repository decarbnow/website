import { icons } from "./marker/icons.js";
import { encode } from '@alexpavlov/geohash-js';

const DEBOUNCE_TIMEOUT = 200;

let twitter = {
    marker: L.marker(null, {icon: icons['pollution']}),
    showTweetSidebar: function(latlng) {
        // update marker
        twitter.marker.setLatLng(latlng);
        twitter.marker.addTo(base.map);
        
        // open sidebar
        base.showSidebar('new-tweet');

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

            if(window.twttr.widgets){
                window.twttr.widgets.load();
            }


            // if (typeof (history.pushState) != "undefined") {
            //     var obj = { Title: hash, Url: '/map/' + hash + '/' + tweettype};
            //     history.pushState(obj, obj.Title, obj.Url);
            // } else {
            //     alert("Browser does not support HTML5.");
            // }

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

        $('#new-tweet-sidebar .tweetBtn').on('input', function() {
            debounce(onTweetSettingsChange)();
        });

        //init debounce
        debounce(onTweetSettingsChange)();
        //console.log(e);
        if(window.twttr.widgets){
            window.twttr.widgets.load();
        }
    },
}

export default twitter
