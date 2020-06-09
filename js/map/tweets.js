import 'leaflet';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import url from './url.js';

import api from './api/proxy.js';

let manager = {
    sidebar: null,
    activeTweet: null,
    activeStory: null,
    autoScrolling: false,
    sidebarDiv: null,
    data: {
        date: null,
        tweets: [],
        stories: [],
        pathToTweetId: {}
    },

    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 19,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
        // removeOutsideVisibleBounds: true
    }),

    init: function() {
        manager.sidebar = L.control.sidebar('show-tweet-sidebar', {
            closeButton: false,
            position: 'left'
        });

        base.map.addControl(manager.sidebar)
        manager.sidebarDiv = $('#show-tweet-sidebar')

        base.layerSets.tweets.layers.tweets.addLayer(manager.clusters);

        api.init();
        manager.loadMarkers();
        manager.addEventHandlers();
    },

    scrollAndActivateTweet: function(id) {
        let tweetDiv = $(`#tweet-${id}`);

        manager.autoScrolling = true;
        manager.sidebarDiv.animate({
            scrollTop: manager.sidebarDiv.scrollTop() + tweetDiv.position().top
        }, 400, function() {
            setTimeout(function() {
                manager.autoScrolling = false;
            }, 400);
        })

        tweetDiv.parent().find('.tweet.selected').removeClass('selected');
        tweetDiv.addClass('selected');
    },

    show: function(id, updateState = true) {
        if (id == manager.activateTweet)
            return;

        let tweetInfo = manager.data.tweets[id];
        let tweetDiv = $(`#tweet-${id}`);

        if (tweetInfo.story && manager.activeStory == tweetInfo.story) {
            manager.scrollAndActivateTweet(id);
        } else {
            manager.openSidebar(id);
        }

        let s = {...tweetInfo.state};
        s.center = base.getSidebarCorrectedCenter(s.center, s.zoom);
        base.setState(s);

        manager.activeTweet = id;
        manager.activeStory = tweetInfo.story;
    },

    openSidebar: function(id) {
        let tweetInfo = manager.data.tweets[id];

        let ids = [id];
        if (tweetInfo.story)
            ids = manager.data.stories[tweetInfo.story];

        let entries = ids.map(tweetId => {
            let classes = ['tweet', 'loading'];
            if (id == tweetId)
                classes.push('selected');
            return `
                <div id="tweet-${tweetId}" class="${classes.join(' ')}" data-tweet="${tweetId}">
                    <div class="widget"></div>
                    <div class="overlay"></div>
                </div>
            `;
        });
        let text = entries.join('');
        if (tweetInfo.story)
            text = `<div id="story-${tweetInfo.story}" class="story" data-story="${tweetInfo.story}">${text}</div>`;

        base.showSidebar(manager, text)

        manager.sidebarDiv.find('.tweet').each((i, e) => {
            let te = $(e);
            window.twttr.widgets.createTweet(te.data('tweet'), te.find('.widget')[0], {conversation: 'none'}).then(function () {
                te.removeClass('loading');
                if (manager.tweetsLoaded()) {
                    manager.scrollAndActivateTweet(id);
                }

            });
        });
    },

    closeSidebar: function() {
        manager.activeTweet = null;
        manager.activeStory = null;
        manager.sidebar.hide();
        url.pushState();
    },

    tweetsLoaded: function() {
        return (manager.sidebarDiv.find('.tweet.loading').length == 0);
    },

    loadMarkers: function() {
        api.getTweets().then(function(data) {
            // console.log(data)
            manager.data.tweets = data;
            // manager.data.tweets = {...manager.data.tweets, ...data.tweets};
            // manager.data.date = data.date;
            // console.log(manager.data.tweets)
            Object.keys(manager.data.tweets).forEach((id) => {
                let tweetInfo = manager.data.tweets[id];

                manager.data.pathToTweetId[tweetInfo.url] = id;
                tweetInfo.state = url._urlToState(tweetInfo.url)

                manager.data.tweets[id] = tweetInfo;
                if (tweetInfo.story) {
                    if (!manager.data.stories[tweetInfo.story])
                        manager.data.stories[tweetInfo.story] = [];
                    manager.data.stories[tweetInfo.story].push(id);
                }

                L.marker(tweetInfo.state.center, {icon: icons['climateaction']})
                    .addTo(manager.clusters)
                    .on('click', function () {
                        manager.show(id)
                    })
            });
            $(manager).trigger('loaded');
        })
    },

    addEventHandlers: function() {
        function scrollAction(direction) {
            let t = manager.sidebarDiv.find('.tweet.selected');
            let tn = null;
            let positionDirection = null;

            let selectedTop = t.position().top,
                selectedHeight = t.height(),
                scrollWindowHeight = manager.sidebarDiv.height();

            let positionAllows = [];
            if(selectedTop + selectedHeight < scrollWindowHeight - 25/* - SOMETHING */)
                positionAllows.push("down");
            if(selectedTop > 0)
                positionAllows.push("up");

            // console.log("direction:" + direction)
            // console.log("postion allows:" + positionAllows)
            if (positionAllows.includes(direction)) {
                if (direction == 'down')
                    tn = t.next('.tweet');
                else if (direction == 'up')
                    tn = t.prev('.tweet');

                if (tn.length > 0)
                    manager.show(tn.data('tweet'));
            }
        }

        //scroll bar
        var lastScrollTop = 0;
        manager.sidebarDiv.bind('scroll', function(e) {
            // console.log("scrolling")
            let scrollTop = $(this).scrollTop()
            if(manager.tweetsLoaded()  && !manager.autoScrolling)
                scrollAction(scrollTop > lastScrollTop ? 'down' : 'up')
            lastScrollTop = scrollTop;
        })

        // mouse wheel
        manager.sidebarDiv.bind('wheel', function(e) {
            // console.log("wheel scrolling")
            if(manager.tweetsLoaded()  && !manager.autoScrolling){
                //https://www.h3xed.com/programming/javascript-mouse-scroll-wheel-events-in-firefox-and-chrome
                //let delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -e.detail;
                let delta = e.originalEvent.deltaY;
                // console.log("orgwheeld:" + delta)
                scrollAction(delta > 0 ? 'down' : 'up')
            }

        })

        // touch display
        let touchStart = null;
        manager.sidebarDiv.bind('touchstart', function(e) {
            touchStart = e.originalEvent.touches[0].clientY;
        });
        manager.sidebarDiv.bind('touchmove', function(e) {
            if($('#show-tweet-sidebar .tweet.unloaded').length == 0  && !manager.autoScrolling)
                scrollAction(touchStart > e.originalEvent.changedTouches[0].clientY ? 'down' : 'up')
            if (manager.autoScrolling)
                e.preventDefault();
        });

        // click activate
        manager.sidebarDiv.on('click', '.tweet .overlay', function(e) {
            manager.show($(this).parents('.tweet').data('tweet'));
        });
    }
}

window.tweets = manager;

export default manager
