import 'leaflet';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import url from './url.js';
import 'jquery';
import 'twitter-widgets';
import api from './api/proxy.js';

let popupOptions = {
   minWidth: 350, autoPan: true, closeButton: true, autoPanPadding: [15, -30], keepInView: true
   //minHeight: "auto"
};

window.gotoLastStoryTweet=function(id){
  //base.map.closePopup();
  return manager.show(id);
};

function listenForTwitFrameResizes() {
/* find all iframes with ids starting with "tweet_" */
    var tweetIframes=document.querySelectorAll("[id^='tweet_']");
    //console.log(tweetIframes)
    tweetIframes.forEach(element => {
        element.onload=function() {
        this.contentWindow.postMessage({ element: this.id, query: "height" }, "https://twitframe.com");
    };
    });

}

/* listen for the return message once the tweet has been loaded */
window.onmessage = (oe) => {
    if (oe.origin != "https://twitframe.com")
        return;
    if (oe.data.height && oe.data.element.match(/^tweet_/))
        document.getElementById(oe.data.element).style.height = parseInt(oe.data.height) + "px";
}

window.showIframeHeight = function() {
    return console.log($('iframe').contents().height() + ' is the height');
};

let manager = {
    sidebar: null,
    activeTweet: null,
    activeStory: null,
    autoScrolling: false,
    sidebarDiv: null,
    data: {
        //date: null,
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
        // removeOutsideVisibleBounds: true
    }),

    init: function() {
        manager.sidebar = L.control.sidebar('show-tweet-sidebar', {
            closeButton: true,
            position: 'left'
        });

        base.map.addControl(manager.sidebar)
        manager.sidebarDiv = $('#show-tweet-sidebar')

        base.map.addLayer(manager.clusters)
        // base.layerSets.tweets.layers.tweets.addLayer(manager.clusters);

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
        //console.log(`tweets manager.show(${id})`)
        if (id == manager.activateTweet)
            return;

        manager.activateMarker(id);

        let tweetInfo = manager.data.tweets[id];

        // if (tweetInfo.story && manager.activeStory == tweetInfo.story)
        //     manager.scrollAndActivateTweet(id, true);
        // else
        //     manager.openPopup(id);
        //     //manager.openSidebar(id);

        let state = {...tweetInfo.state};
        //state.center = base.getSidebarCorrectedCenter(state.center, state.zoom);
        base.setState(state);

        manager.openPopup(id);

        manager.activeTweet = id;
        manager.activeStory = tweetInfo.story;
        listenForTwitFrameResizes()

    },





    openPopup: function(id) {



      let tweetInfo = manager.data.tweets[id];

      //console.log(tweetInfo);
      let ids = [id];
      //if (tweetInfo.story)
      //    ids = manager.data.stories[tweetInfo.story];
      //console.log(ids);


      let entries = ids.map(tweetId => {
          let classes = ['tweet', 'loading'];

          if (id == tweetId)
              classes.push('selected');
          // return `
          //     <table><tr height=400><td>
          //     <iframe src="https://nttr.stream/i/status/${tweetId}/embed?theme=twitter" id="your-iframe-id" frameborder="0" style="overflow: hidden; height: 400px; width: 350px; position: relative; flex-grow: 1" ></iframe>
          //     </td></tr></table>
          // `;
          return `
          <iframe border=0 frameborder=0 src="https://twitframe.com/show?url=https://twitter.com/x/status/${tweetId}&conversation=none" id="tweet_${tweetId}"></iframe>
          `;
          // return `
          // <div  id="tweet" class="twitter-tweet" data-dnt="true" data-conversation="none" tw-align-center></div>
          // `;

          // return `
          // <blockquote class="twitter-tweet" data-dnt="true" data-conversation="none" tw-align-center>
          //   <a href="https://twitter.com/x/status/${tweetId}"></a>
          // </blockquote>
          // `;

      });

      let text = entries.join('');
      //if (tweetInfo.story)
          //text = `<div id="story-${tweetInfo.story}" class="story" data-story="${tweetInfo.story}">${text}</div>`;
          //text = `<iframe src="https://nttr.stream/i/status/${tweetInfo.story}/embed" frameborder="0" style="overflow: hidden; height: 100%; width: 100%; position: absolute;"></iframe>`;

      //base.bindPopup(text)
      if (tweetInfo.story){

          let ids_story = manager.data.stories[tweetInfo.story];

          let pos_previousID = ids_story.indexOf(ids[0])-1;
          let pos_nextID = ids_story.indexOf(ids[0])+1;

          if(pos_previousID > -1)
              text = text + "\n<button onclick='gotoLastStoryTweet(\"" + ids_story[pos_previousID] + "\")'>Previous</button>"

          if(pos_nextID < ids_story.length)
              text = text + "<button onclick='gotoLastStoryTweet(\"" + ids_story[pos_nextID] + "\")'>Next</button>"

        };

      let showTweet = L.popup(popupOptions).setContent(
          '<p>Tell the World!</p>'
      );

      showTweet
            .setLatLng(tweetInfo.state.center)
            .setContent(text)
            .openOn(base.map);

            /* listen for the return message once the tweet has been loaded */


        //setTimeout(updateIframe(), 5000);

        //console.log($('iframe').contents().height() + ' is the height')
        //setTimeout(window.showIframeHeight, 5000);
        // $('iframe').on('load', function() {
        //     setTimeout(iResize, 500);
        //     // Safari and Opera need a kick-start.
        //     var iSource = document.getElementById('your-iframe-id').src;
        //     document.getElementById('your-iframe-id').src = '';
        //     document.getElementById('your-iframe-id').src = iSource;
        // });
        // function iResize() {
        //     console.log($('iframe').contents().height() + ' is the height')
        //     document.getElementById('your-iframe-id').style.height =
        //     document.getElementById('your-iframe-id').contentWindow.document.body.offsetHeight + 'px';
        // }


      // let TwitterWidgetsLoader = require('twitter-widgets');
      //
      // TwitterWidgetsLoader.load(function(err, twttr) {
      // 	if (err) {
      // 		//do some graceful degradation / fallback
      // 		return;
      // 	}
      //
      // 	twttr.widgets.createTweet('20', document.getElementById('tweet'));
      // });
      //
      // TwitterWidgetsLoader.load(function(err, twttr) {
      // 	if (err) {
      // 		//do some graceful degradation / fallback
      // 		return;
      // 	}
      //
      // 	twttr.widgets.createFollowButton('Prinzhorn', document.getElementById('follow'));
      // });
      //
      // //The callback is optional.
      // TwitterWidgetsLoader.load();
      // // at some point later `window.twttr` will be defined.
      // //L.popup.bindPopup(tweetInfo.state.center, text)



    },

    // openSidebar: function(id) {
    //     let tweetInfo = manager.data.tweets[id];
    //
    //     let ids = [id];
    //     if (tweetInfo.story)
    //         ids = manager.data.stories[tweetInfo.story];
    //
    //     let entries = ids.map(tweetId => {
    //         let classes = ['tweet', 'loading'];
    //         if (id == tweetId)
    //             classes.push('selected');
    //         return `
    //             <div id="tweet-${tweetId}" class="${classes.join(' ')}" data-tweet="${tweetId}">
    //                 <div class="widget"></div>
    //                 <div class="overlay"></div>
    //             </div>
    //         `;
    //     });
    //     let text = entries.join('');
    //     if (tweetInfo.story)
    //         text = `<div id="story-${tweetInfo.story}" class="story" data-story="${tweetInfo.story}">${text}</div>`;
    //         //text = `<iframe src="https://nttr.stream/i/status/${tweetInfo.story}/embed" frameborder="0" style="overflow: hidden; height: 100%; width: 100%; position: absolute;"></iframe>`;
    //
    //     base.showSidebar(manager, text)
    //
    //     manager.sidebarDiv.find('.tweet').each((i, e) => {
    //         let te = $(e);
    //         let tweetId = te.data('tweet').toString();
    //         window.twttr.widgets.createTweet(tweetId, document.getElementById(`tweet-${tweetId}`).getElementsByClassName("widget")[0], {conversation: 'none'}).then(function () {
    //             te.removeClass('loading');
    //             if (manager.tweetsLoaded())
    //                 manager.scrollAndActivateTweet(id, false);
    //         });
    //     });
    // },
    //
    closeSidebar: function() {
        //console.log(`tweets manager.closeSidebar`)
        manager.deactivateMarkers();
        manager.activeTweet = null;
        manager.activeStory = null;
        //manager.sidebar.hide();
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

                if (tweetInfo.hashtags.includes('private') || tweetInfo.hashtags.includes('hide'))
                    return;

                if (tweetInfo.state.zoom >= 6){
                  let marker = L.marker(tweetInfo.state.center, {icon: icons['climateaction'], opacity: tweetOpacity})

                  if(tweetOpacity < 1)
                    tweetOpacity = tweetOpacity + 0.006
                  //marker.addTo(manager.clusters)
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
            let scrollTop = $(this).scrollTop();
            if(manager.tweetsLoaded()  && !manager.autoScrolling)
                scrollAction(scrollTop > lastScrollTop ? 'down' : 'up')
            lastScrollTop = scrollTop;
            e.stopPropagation();
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
