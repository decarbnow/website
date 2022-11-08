import 'leaflet';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import url from './url.js';
import 'jquery';
import 'twitter-widgets';
import api from './api/proxy.js';

window.gotoLastStoryTweet=function(id){
    return manager.show(id);
};

function listenForTwitFrameResizes() {
    /* find all iframes with ids starting with "tweet_" */
    var tweetIframes=document.querySelectorAll("[id^='tweet_']");

    tweetIframes.forEach(element => {
        element.onload=function() {
        this.contentWindow.postMessage({ element: this.id, query: "height" }, "https://twitframe.com");
    };
    });

};

/* listen for the return message once the tweet has been loaded */
window.onmessage = (oe) => {
    if (oe.origin != "https://twitframe.com"){
        return;
    }
    if (oe.data.height && oe.data.element.match(/^tweet_/)){
      document.getElementById(oe.data.element).style.height = parseInt(oe.data.height) + "px";
    }

};

let manager = {
    sidebar: null,
    activeTweet: null,
    activeStory: null,
    autoScrolling: false,
    sidebarDiv: null,
    data: {
        tweets: [],
        stories: [],
        pathToTweetId: {},
        tweetIdToMarker: {}
    },

    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 11,
        maxClusterRadius: 10,
        animatedAddingMarkers: false,
        showCoverageOnHover: false
    }),

    init: function() {
        manager.sidebar = L.control.sidebar('show-tweet-sidebar', {
            closeButton: false,
            position: 'right'
        });

        base.map.addControl(manager.sidebar)
        manager.sidebarDiv = $('#show-tweet-sidebar')

        base.map.addLayer(manager.clusters)

        api.init();
        manager.loadMarkers();
        manager.addEventHandlers();
    },

    scrollAndActivateTweet: function(id, tweetActivated = false) {
        let tweetDiv = $(`#tweet-${id}`);

        manager.autoScrolling = true;
        if(!tweetActivated)
            manager.sidebarDiv.animate({
                scrollTop: manager.sidebarDiv.scrollTop() + tweetDiv.position().top - 80
            }, 600, function() {
                setTimeout(function() {
                    manager.autoScrolling = false;
                }, 1);
            })
        else
            manager.sidebarDiv.animate({
                scrollTop: manager.sidebarDiv.scrollTop()
            }, 0, function() {
                setTimeout(function() {
                    manager.autoScrolling = false;
                }, 1);
            })

        tweetDiv.parent().find('.tweet.selected').removeClass('selected');
        tweetDiv.addClass('selected');
    },


    activateMarker: function(id) {
        let marker = manager.data.tweetIdToMarker[id.toString()];
        manager.deactivateMarkers();
        if (marker && marker._icon)
            L.DomUtil.addClass(marker._icon, 'selected');
    },

    deactivateMarkers: function() {
        $('.leaflet-marker-icon.selected').removeClass('selected');
    },

    show: function(id, updateState = true) {
        base.map.closePopup();
        base.hideCrosshair();

        if (id == manager.activateTweet)
            return;

        manager.activateMarker(id);

        let tweetInfo = manager.data.tweets[id];


        if (tweetInfo.story && manager.activeStory == tweetInfo.story)
            manager.scrollAndActivateTweet(id, true);
        else
            manager.openSidebar(id);

        let state = {...tweetInfo.state};
        state.center = base.getSidebarCorrectedCenter(state.center, state.zoom);
        base.setState(state);
        base.hideCrosshair();

        manager.openSidebar(id)
        manager.activeTweet = id;
        manager.activeStory = tweetInfo.story;
    },

    openSidebar: function(id) {
        let tweetInfo = manager.data.tweets[id];

        if (tweetInfo.reply){
            let ids = [tweetInfo.reply];

            let entries = ids.map(tweetId => {
                let classes = ['tweet', 'loading'];

                if (id == tweetId)
                    classes.push('selected');
            });

            let text = entries.join('');
        } else {
          let ids = [id];
          let entries = ids.map(tweetId => {
              let classes = ['tweet', 'loading'];
              if (id == tweetId)
                  classes.push('selected');
              return `
              <iframe border=0 frameborder=0 src="https://twitframe.com/show?url=https://twitter.com/x/status/${tweetId}&conversation=none" id="tweet_${tweetId}"></iframe>
              `;
          });

          let text = "<div class=\"sidebar-container\"><div style=\"text-align:center\">"

          if (tweetInfo.story){
              text = text + "<div class=\"key_container\">"
              let ids_story = manager.data.stories[tweetInfo.story];

              let pos_previousID = ids_story.indexOf(ids[0])-1;
              let pos_nextID = ids_story.indexOf(ids[0])+1;


              let page_arr = new Array(ids_story.length).fill(0);

              page_arr[0] = 1
              page_arr[ids_story.length-1] = 1
              page_arr[ids_story.indexOf(ids[0])] = 1

              if(ids_story.indexOf(ids[0]) == 0 & ids_story.length >= 3){
                  page_arr[1] = 1
                  page_arr[2] = 1
              }

              if(ids_story.indexOf(ids[0]) == 0 & ids_story.length < 3){
                  page_arr[1] = 1
              }

              if(ids_story.indexOf(ids[0]) == 1 & ids_story.length >= 3)
                  page_arr[2] = 1

              if(ids_story.indexOf(ids[0]) == 2)
                  page_arr[1] = 1

              if(ids_story.indexOf(ids[0]) == ids_story.length-1){
                  page_arr[ids_story.length-2] = 1
                  page_arr[ids_story.length-3] = 1
              }

              if(ids_story.indexOf(ids[0]) == ids_story.length-2)
                  page_arr[ids_story.length-3] = 1

              if(ids_story.indexOf(ids[0]) == ids_story.length-3)
                  page_arr[ids_story.length-2] = 1

              page_arr.forEach(function (x, i){
                  if(x == 0 & page_arr[i-1] == 0){
                        return;
                  } else if (x == 0 & page_arr[i-1] == 1)
                        text = text + "<button class=\"button button_inactive\">" + "&#183;&#183;&#183;" + "</button>"
                  else {
                    if(ids_story.indexOf(ids[0]) == i){
                        text = text + "<button onclick='gotoLastStoryTweet(\"" + ids_story[i] + "\")' class=\"key key_active\">" + (i+1) + "</button>"
                    } else {
                        text = text + "<button onclick='gotoLastStoryTweet(\"" + ids_story[i] + "\")' class=\"key key_inactive\">" + (i+1) + "</button>"
                    }
                  }
              });

              text = text + "&nbsp; &nbsp; "

              if(pos_previousID > -1){
                  text = text + "\n<button onclick='gotoLastStoryTweet(\"" + ids_story[pos_previousID] + "\")' class=\"key_pn key_inactive\"> prev </button>"//&#8249;
              } else {
                  text = text + "\n<button class=\"key_pn key_greyed\"> prev </button>"
              }

              if(pos_nextID < ids_story.length){
                text = text + "<button onclick='gotoLastStoryTweet(\"" + ids_story[pos_nextID] + "\")' class=\"key_pn key_inactive\"> next </button>"//&#8250;
              } else {
                text = text + "<button class=\"key_pn key_greyed\"> next </button>"
              }

              text = text + "</div>"
            };

          text = text + "</div>"

          text = text + entries.join('');

          text = text + "</div>"
          base.showSidebar(manager, text)
          listenForTwitFrameResizes()
          manager.sidebarDiv.find('.tweet').each((i, e) => {
              let te = $(e);
              let tweetId = te.data('tweet').toString();
              window.twttr.widgets.createTweet(tweetId, document.getElementById(`tweet-${tweetId}`).getElementsByClassName("widget")[0], {conversation: 'none'}).then(function () {
                  te.removeClass('loading');
                  if (manager.tweetsLoaded())
                      manager.scrollAndActivateTweet(id, false);
              });
          });
        }
    },

    closeSidebar: function() {
        manager.deactivateMarkers();
        manager.activeTweet = null;
        manager.activeStory = null;
        base.showCrosshair();
        base.showLayer("tweets");
        manager.sidebar.hide();
        url.pushState();

    },

    tweetsLoaded: function() {
        return (manager.sidebarDiv.find('.tweet.loading').length == 0);
    },

    loadMarkers: function() {
        api.getTweets().then(function(data) {
            manager.data.tweets = data;
            let tweetOpacity = 0.3

            Object.keys(manager.data.tweets).forEach((id) => {

                let tweetInfo = manager.data.tweets[id];

                manager.data.pathToTweetId[tweetInfo.url] = id;
                tweetInfo.state = url._urlToState(tweetInfo.url)

                if (!tweetInfo.state.center)
                    return;

                manager.data.tweets[id] = tweetInfo;
                if (tweetInfo.story) {
                    if (!manager.data.stories[tweetInfo.story])
                        manager.data.stories[tweetInfo.story] = [];
                    manager.data.stories[tweetInfo.story].push(id);
                }

                if (tweetInfo.state.zoom >= 6){
                  let marker = L.marker(tweetInfo.state.center, {icon: icons['climateaction'], opacity: tweetOpacity})

                  if(tweetOpacity < 1)
                    tweetOpacity = tweetOpacity + 0.006

                  marker.addTo(base.layerSets.tweets.layers.tweets)
                  marker.on('click', function () {
                      manager.show(id)
                  })
                  manager.data.tweetIdToMarker[id] = marker
                }
                else {
                  return;
                }

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
            if(selectedTop + selectedHeight < scrollWindowHeight - 500/* - SOMETHING */)
                positionAllows.push("down");
            if(selectedTop > 0 + selectedHeight + 0)
                positionAllows.push("up");

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
            let scrollTop = $(this).scrollTop();
            if(manager.tweetsLoaded()  && !manager.autoScrolling)
                scrollAction(scrollTop > lastScrollTop ? 'down' : 'up')
            lastScrollTop = scrollTop;
            e.stopPropagation();
        })

        // mouse wheel
        manager.sidebarDiv.bind('wheel', function(e) {
            if(manager.tweetsLoaded()  && !manager.autoScrolling){
                //https://www.h3xed.com/programming/javascript-mouse-scroll-wheel-events-in-firefox-and-chrome
                //let delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -e.detail;
                let delta = e.originalEvent.deltaY;

                scrollAction(delta > 0 ? 'down' : 'up')
            }
            e.stopPropagation();
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
