import 'leaflet';
import MarkerClusterGroup from 'leaflet.markercluster';
import base from "./base.js";
import { icons } from "./marker/icons.js";
import url from './url.js';
import 'jquery';
import 'twitter-widgets';
import api from './api/proxy.js';
import twitter from './twitter.js';
import './scripts/embed-post.js';
import sidebar from './sidebar.js';



window.toggleFunction = function () {
    let x = $('embed-post').css("display")
    if (x === "none") {
        $("embed-post").css("display", "block")
    } else {
        $("embed-post").css("display", "none")
    }
};


window.gotoLastStoryTweet=function(id){
    return manager.show(id);
};

function listenForTwitFrameResizes() {
    /* find all iframes with ids starting with "tweet_" */
    var tweetIframes=document.querySelectorAll("[id^='tweet_']");
    console.log(tweetIframes)
    tweetIframes.forEach(element => {
        element.onload=function() {
        this.contentWindow.postMessage({ element: this.id, query: "data-maxheight" }, "https://mastodon.social");
    };
    });

};

/* listen for the return message once the tweet has been loaded */
window.onmessage = (oe) => {
    if (oe.origin != "https://mastodon.social"){
        return;
    }
    let cssHeight = 36 + 38 + 30
    if (oe.data.height && oe.data.element.match(/^tweet_/)){
      if(parseInt(oe.data.height) > (window.innerHeight-cssHeight))
          document.getElementById(oe.data.element).style.height = window.innerHeight - cssHeight + "px";
      else
          document.getElementById(oe.data.element).style.height = parseInt(oe.data.height) + "px";
    }

};


let manager = {
    previousTweetId: null,
    controlwindow: null,
    activeTweet: null,
    activeStory: null,
    autoScrolling: false,
    connectedDots: null,
    storyline: null,
    sidebarDiv: null,
    data: {
        tweets: [],
        stories: [],
        polygons: null,
        pathToTweetId: {},
        tweetIdToMarker: {}
    },

    clusters: L.markerClusterGroup({
        disableClusteringAtZoom: 16,
        maxClusterRadius: 0.1,
        animatedAddingMarkers: false,
        showCoverageOnHover: false,
        //icon: icons['climateaction']
        // iconCreateFunction: function(cluster) {
        //     var count = cluster.getChildCount();
        //     return L.divIcon({
        //         fonticon: "nf nf-fa-twitter",
        //         cssname: "climate-action",
        //         icon: icons['climateaction']
        //         // html: '<span class="custom">' + (count + 100) + '</span>',
        //         // className: 'custom'
        //     })
        // }
    }),

    init: function() {
        manager.controlwindow = L.control.window(base.map, {title:'', content:'', visible: false})

        //api.init();

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

        //console.log(marker._leaflet_id)

        // function logVisibleClusters() {
        //     var parent;
        //     var visibleClusterMarkers = [];
        //     var bounds = base.map.getBounds();
        //     manager.clusters.eachLayer(function (marker) {
        //       parent = tweets.clusters.getVisibleParent(marker);
        //       if (parent && (typeof visibleClusterMarkers[parent._leaflet_id] == 'undefined')) {
        //         visibleClusterMarkers[parent._leaflet_id] = parent;
        //       }
        //     });
        //     visibleClusterMarkers.forEach(function(clusterMarker) {
        //       if(clusterMarker._leaflet_id != "undefined"){
        //         if (marker._leaflet_id == clusterMarker._leaflet_id) {
        //           console.log('visible: ', clusterMarker);
        //         }
        //       }
        //
        //     });
        //   }

        //logVisibleClusters()


        manager.deactivateMarkers();
        if (marker && marker._icon)
            L.DomUtil.addClass(marker._icon, 'selected');
    },

    visibleMarker: function(id) {
        let marker = manager.data.tweetIdToMarker[id.toString()];
        
        if (marker && marker._icon) {
            L.DomUtil.addClass(marker._icon.querySelector('.marker-pin.action'), 'visible-after');
            L.DomUtil.addClass(marker._icon.querySelector('.fab'), 'visible-after');
        }
    },
    
    

    invisibleMarker: function() {
        $('.marker-pin').removeClass('visible-after');
        $('.fab.fa-twitter').removeClass('visible-after');
    },

    deactivateMarkers: function() {
        $('.leaflet-marker-icon.selected').removeClass('selected');
    },

    show: function(id, updateState = true) {
        base.map.closePopup();
        twitter.marker.remove();
        ///twitter.controlwindow.hide();

        if (id == manager.activateTweet)
            return;

        manager.activateMarker(id);

        let tweetInfo = manager.data.tweets[id];

        let state = {...tweetInfo.state};

        base.setState(state);
        //manager.openSidebar(id)
        manager.activeTweet = id;
        manager.activeStory = tweetInfo.story;
        let class_ch = document.querySelector('.crosshair')
        class_ch.classList.add('hidden')
        sidebar.selectTweet(id);
        manager.previousTweetId = id
    },

    openSidebar: function(id) {
        let class_ch = document.querySelector('.crosshair')
        class_ch.classList.add('hidden')
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
          let account = tweetInfo.account;          
          let entries = ids.map(tweetId => {
              let classes = ['tweet', 'loading'];
              
              if (id == tweetId)
                  classes.push('selected');
              return `
              <embed-post
                data-src="https://mastodon.social/@${account}/${tweetId}"
                data-maxheight="800"
                id="tweet_${tweetId}"
                ></embed-post>
              `;
          });
          //<iframe src="https://mastodon.social/@${account}/${tweetId}/embed" class="mastodon-embed" style="max-width: 100%; border: 0" height="600" width="400" allowfullscreen="allowfullscreen" id="tweet_${tweetId}"></iframe><script src="https://mastodon.social/embed.js" async="async"></script>
          let title = null
          let text = "<div class=\"sidebar-container\"><div style=\"text-align:center\">"

          if (tweetInfo.story){
              //manager.loadStoryLines(id)
              text = text + "<div class=\"key_container\">"
              let ids_story = manager.data.stories[tweetInfo.story];

              let pos_previousID = ids_story.indexOf(ids[0])-1;
              let pos_nextID = ids_story.indexOf(ids[0])+1;


              let page_arr = new Array(ids_story.length).fill(0);

              page_arr[0] = 1
              page_arr[ids_story.length-1] = 1
              page_arr[ids_story.indexOf(ids[0])] = 1

              title = "Story - Twitter thread - " + (ids_story.indexOf(ids[0])+1) + " of " + ids_story.length

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
                  text = text + "\n<button onclick='gotoLastStoryTweet(\"" + ids_story[pos_previousID] + "\")' class=\"key_pn left key_inactive\"> < </button>"//&#8249;
              } else {
                  text = text + "\n<button class=\"key_pn left key_greyed\"> < </button>"
              }

              if(pos_nextID < ids_story.length){
                text = text + "<button onclick='gotoLastStoryTweet(\"" + ids_story[pos_nextID] + "\")' class=\"key_pn right key_inactive\"> > </button>"//&#8250;
              } else {
                text = text + "<button class=\"key_pn right key_greyed\"> > </button>"
              }

              text = text + "</div>"
          } else {
            title = "toot: " + id
          };

          text = text + "</div>"

          text = text + entries.join('');

          text = text + "</div>"

          title = title + "<a class=\"minimize\" onclick='toggleFunction()'>" + "_" + "</a>"

          base.showSidebarContent(manager, text, title)
          listenForTwitFrameResizes()
        }
    },

    closeSidebar: function() {
        manager.deactivateMarkers();
        manager.activeTweet = null;
        manager.activeStory = null;
        //var sidebar = document.getElementById('sidebar');
        //sidebar.scrollTop = 0;
        clearSearch();
        //console.log(previousTweetId)

        //document.getElementById('sidebar').scrollTop = 0;
        url.pushState();
        base.showLayer("tweets");
        let class_ch = document.querySelector('.crosshair')
        class_ch.classList.add('hidden')
        class_ch.classList.remove('hidden')

        let class_bb = document.querySelector('.back-btn')
        class_bb.classList.add('hidden')

        let class_nb = document.querySelectorAll('.navigation-button')
        class_nb.forEach(button => button.classList.remove('hidden'));

        if(manager.storyline)
            manager.storyline.remove()
    },

    addGeoJson: function() {
      let state = base.getState()
      if(tweets.data.polygons){
        state.polygons = tweets.data.polygons
        base.setState(state);
      }

    },

    connectTheDots: function(tweetid){
        var c = [];
        for (var i=0; i < manager.data.storiesarray.length; i++) {
            if(manager.data.stories[manager.data.storiesarray[i]].indexOf(tweetid) > -1){
                for (var j=0; j < manager.data.stories[manager.data.storiesarray[i]].length-1; j++) {

                    var x = manager.data.tweets[manager.data.stories[manager.data.storiesarray[i]][j]].state.center
                    var y = manager.data.tweets[manager.data.stories[manager.data.storiesarray[i]][j+1]].state.center
                    c.push([x, y]);
                }
            }
        }

        // for(i in data._layers) {
        //     var x = data._layers[i]._latlng.lat;
        //     var y = data._layers[i]._latlng.lng;
        //     c.push([x, y]);
        // }
        return c;
    },

    loadStoryLines: function(id) {
        manager.storyline = L.polyline(manager.connectTheDots(id)).addTo(base.map)
        //console.log(manager.data.tweets)
    },

    loadMarkers: function() {
        manager.data.storiesarray = []
        api.getTweets().then(function(data) {
            manager.data.tweets = data;

            let tweetOpacity = 1

            Object.keys(manager.data.tweets).forEach((id) => {


                let tweetInfo = manager.data.tweets[id];

                manager.data.pathToTweetId[tweetInfo.url] = id;
                tweetInfo.state = url._urlToState(tweetInfo.url)

                if (!tweetInfo.state.center)
                    return;

                manager.data.tweets[id] = tweetInfo;
                if (tweetInfo.story) {
                    if (!manager.data.stories[tweetInfo.story]){
                      manager.data.stories[tweetInfo.story] = [];
                      manager.data.storiesarray.push(id);
                    }

                    manager.data.stories[tweetInfo.story].push(id);

                }

                if (tweetInfo.state.zoom >= 2){
                  let marker = L.marker(tweetInfo.state.center, {icon: icons['climateaction'], opacity: tweetOpacity})

                  //manager.clusters.addLayer(marker);

                
                  //base.map.addLayer(manager.clusters);
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
        manager.controlwindow.on("hide", function(e) {
            manager.deactivateMarkers();
            manager.closeSidebar();
            base.showLayer("tweets");
        });
    }
}

window.tweets = manager;

export default manager
