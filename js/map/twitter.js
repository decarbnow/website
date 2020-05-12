import createMarkerIcon from "./marker.js";
import { encode } from '@alexpavlov/geohash-js';

const DEBOUNCE_TIMEOUT = 200;

let text = `
<div id='tweetSidebar'>
    <h3>Tweet about</h3>
    <div class="select">
        <select id="icontype">
            <option value="pollution">Pollution</option>
            <option value="climateaction">Climate Action</option>
            <option value="transition">Transition</option>
        </select>
    </div>
    <form>
        <textarea id="tweetText" cols="22" rows="5"></textarea>
    </form>
    <div id="tweetBtn">
        <a class="twitter-share-button" href="http://twitter.com/share" data-url="null" data-text="#decarbnow">Tweet</a>
    </div>
</div>
`;

let twitter = {
    marker: null,
    setMarker: function(latlng, type = 'pollution') {
        if (twitter.marker) {
            twitter.marker.setLatLng(latlng);
        } else {
            twitter.marker = L.marker(latlng, {
                icon: createMarkerIcon(type)
            })
        }
    },
    showTweetSidebar: function(latlng) {
        // add marker
        twitter.setMarker(latlng)
        twitter.marker.addTo(base.map);

        // open sidebar
        base.sidebar
            .setContent(text)
            .show();

        //here comes the beauty
        function onTweetSettingsChange(e) {
            let tweettypeInput = document.getElementById("icontype");
            let tweettype = tweettypeInput.options[tweettypeInput.selectedIndex].value;

            twitter.marker.setIcon(createMarkerIcon(tweettype))

            let tweet = null;

            if($('#tweetText').val().search("#decarbnow") == -1){
                tweet = '#decarbnow ' + $('#tweetText').val();
            } else {
                tweet = $('#tweetText').val()
            }

            //tweet += ' https://decarbnow.space/map/' + hash + '/' + tweettype;

            // Remove existing iframe
            $('#tweetBtn').html('');
            // Generate new markup
            var tweetBtn = $('<a></a>')
                .addClass('twitter-share-button')
                .attr('href', 'http://twitter.com/share')
                .attr('data-url', 'https://decarbnow.space/map/')
                //.attr('data-url', 'https://decarbnow.space/map/' + hash + '/' + tweettype)
                .attr('data-text', tweet);
            $('#tweetBtn').append(tweetBtn);
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

        $('#icontype').on('change', onTweetSettingsChange);

        $('#tweetText').on('input', function() {
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
