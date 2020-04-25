const DEBOUNCE_TIMEOUT = 200;



window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    console.debug("initialising ready function");
    t.ready = function(f) {
        console.debug("inside loading");
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"));


let text = '<h3>Tweet about</h3>'+
    '<select id="icontype">'+
    '<option value="pollution" data-image="/map/img/pollution.png">Pollution</option>'+
    '<option value="climateaction"  data-image="/map/img/action.png">Climate Action</option>'+
    '<option value="transition" data-image="/map/img/transition.png">Transition</option>'+
    '</select>'+
    '<form>'+
    '<textarea id="tweetText" ></textarea>' +
    '</form>'+
    '<div id="tweetBtn">'+
    '<a class="twitter-share-button" href="http://twitter.com/share" data-url="null" data-text="#decarbnow">Tweet</a>'+
    '</div>';


let showGeoLoc = L.popup().setContent(
    '<p>Tell the World!</p>'
);


let showTweetBox = function(latlng, hash) {
    showGeoLoc
    .setLatLng(latlng)
    .setContent(text)
    .openOn(decarbnowMap);

    //here comes the beauty
    function onTweetSettingsChange (e) {
        let tweettypeInput = document.getElementById("icontype");
        let tweettype = tweettypeInput.options[tweettypeInput.selectedIndex].value;

        let tweet = '#decarbnow ' + $('#tweetText').val();

        //tweet += ' https://decarbnow.space/map/' + hash + '/' + tweettype;

        // Remove existing iframe
        $('#tweetBtn').html('');
        // Generate new markup
        var tweetBtn = $('<a></a>')
            .addClass('twitter-share-button')
            .attr('href', 'http://twitter.com/share')
            .attr('data-url', 'https://decarbnow.space/map/' + hash + '/' + tweettype)
            .attr('data-text', tweet);
        $('#tweetBtn').append(tweetBtn);
        if(window.twttr.widgets){
            window.twttr.widgets.load();
        }
        

        if (typeof (history.pushState) != "undefined") {
            var obj = { Title: hash, Url: '/map/' + hash + '/' + tweettype};
            history.pushState(obj, obj.Title, obj.Url);
        } else {
            alert("Browser does not support HTML5.");
        }

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
}

export default showTweetBox