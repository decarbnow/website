import 'leaflet';
import twemoji from 'twemoji';
import { encode, decode } from '@alexpavlov/geohash-js';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import tweetList from './tweets.json';
import url from './url.js';

let manager = {
    sidebar: null,
    activeTweet: null,
    autoScrolling: false,
    sidebarDiv: null,

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

        manager.sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
        base.layerSets.points.layers.tweets.addLayer(manager.clusters);

        manager.createMarkers();
        manager.addEventHandlers();
    },

    activate: function(id, move = true) {
        let tweetInfo = tweetList.tweets[id];
        let tweetDiv = $(`#tweet-${id}`);

        if (tweetInfo.ls) {
            let visibleLayers = base.getVisibleLayerIds()

            let hide = visibleLayers.filter(x => !tweetInfo.ls.includes(x));
            hide.forEach((lid) => {
                base.hideLayerId(lid)
            });

            let show = tweetInfo.ls.filter(x => !visibleLayers.includes(x) );
            show.forEach((lid) => {
                base.showLayerId(lid)
            });
        }

        let z = 10;
        if (tweetInfo.z)
            z = tweetInfo.z

        if (move) {
            let latlng = manager.getLatLng(tweetInfo);
            base.map.flyTo(base.map.unproject(base.map.project(latlng, z).subtract([manager.sidebarOffset / 2, 0]), z), z);
        }

        manager.autoScrolling = true;
        manager.sidebarDiv.animate({
            scrollTop: manager.sidebarDiv.scrollTop() + tweetDiv.position().top
        }, 400, function() {
            setTimeout(function() {
                manager.autoScrolling = false;
            }, 200);
        })

        tweetDiv.parent().find('.tweet.selected').removeClass('selected');
        tweetDiv.addClass('selected');

        manager.activeTweet = id;
        url.pushState()
    },

    openSidebar: function(id, move = true) {
        let tweetInfo = tweetList.tweets[id];

        let ids = [id];
        if (tweetInfo.story)
            ids = tweetList.stories[tweetInfo.story];

        let entries = ids.map(tweetId => {
            let classes = ['tweet', 'unloaded'];
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
                te.addClass('loaded');
                te.removeClass('unloaded');
                if (manager.tweetsLoaded())
                    manager.activate(id, move);
            });
        });
    },

    closeSidebar: function() {
        manager.activeTweet = null;
        manager.sidebar.hide();
        url.pushState();
    },

    getLatLng: function(tweetInfo) {
        let t = decode(tweetInfo['@']);
        return {
            lat: t.latitude,
            lng: t.longitude,
        }
    },

    tweetsLoaded: function() {
        return (manager.sidebarDiv.find('.tweet.unloaded').length == 0);
    },

    createMarkers: function() {
        Object.keys(tweetList.tweets).forEach((id) => {
            let tweetInfo = tweetList.tweets[id];
            L.marker(manager.getLatLng(tweetInfo), {icon: icons[tweetInfo.tags[0]]})
                .addTo(manager.clusters)
                .on('click', function () {
                    // IS OPEN
                    if (tweetInfo.story && manager.sidebar.isVisible() & $(`#story-${tweetInfo.story}`).length) {
                        manager.activate(id);
                    } else {
                        manager.openSidebar(id);
                    }
                })
        });
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
            if(selectedTop + selectedHeight < scrollWindowHeight /* - SOMETHING */)
                positionAllows.push("down");
            if(selectedTop > 0)
                positionAllows.push("up");

            if (positionAllows.includes(direction)) {
                if (direction == 'down')
                    tn = t.next('.tweet');
                else if (direction == 'up')
                    tn = t.prev('.tweet');

                if (tn.length > 0)
                    manager.activate(tn.data('tweet'));
            }
        }

        // scroll bar
        var lastScrollTop = 0;
        manager.sidebarDiv.bind('scroll', function(e) {
            let scrollTop = $(this).scrollTop()
            if(manager.tweetsLoaded()  && !manager.autoScrolling)
                scrollAction(scrollTop > lastScrollTop ? 'down' : 'up')
            lastScrollTop = scrollTop;
        })

        // mouse wheel
        manager.sidebarDiv.bind('wheel DOMMouseScroll', function(e) {
            if(manager.tweetsLoaded()  && !manager.autoScrolling)
                scrollAction(e.originalEvent.wheelDelta < 0 ? 'down' : 'up')
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
        manager.sidebarDiv.on('click', '.tweet.loaded .overlay', function(e) {
            manager.activate($(this).parents('.tweet').data('tweet'));
        });
    }
}

export default manager
