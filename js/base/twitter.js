window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    //console.debug("initialising ready function");
    t.ready = function(f) {
        //console.debug("inside loading");
        t._e.push(f);
    };

    return t;
}(document, "script", "twitter-wjs"));
