import { icons } from "./marker/icons.js";
import { encode } from '@alexpavlov/geohash-js';
import 'twitter-widgets';
import base from './base.js'
import url from './url.js';

const DEBOUNCE_TIMEOUT = 500;
var twittermarker;

var TwitterWidgetsLoader = require('twitter-widgets');

let showGeoLoc = L.popup().setContent(
    '<p>Tell the World!</p>'
);

function changeCheckboxState() {
  /* find all iframes with ids starting with "tweet_" */
  var allIdsFromCheckbox = document.querySelectorAll("[id^='layers-']")
  // allIdsFromCheckbox.forEach(elem =>
  //   console.log(elem.getAttribute('id'))
  // );
  var a = []
  allIdsFromCheckbox.forEach(elem => {
      a.push(elem.getAttribute('id').replace("layers-", ""))
    //var a =


    //elem.getAttribute('id').replace("layers-", "")
  });

  var b = url.getState().layers

  //console.log(a)
  //console.log(b)


  var activeCheckboxIds =  a.filter(function(v) {
      return b.includes(v);
    })


  a.forEach((item, i) => {
      document.getElementById("layers-" + item).checked = false;
  });

  activeCheckboxIds.forEach((item, i) => {
      document.getElementById("layers-" + item).checked = true;
  });

  //console.log(url.getState());
  //console.log(allIdsFromCheckbox[0])
  // for (var i = 0; i < allIdsFromCheckbox.length; i++)
  //     allIdsFromCheckbox[i].replace("layer-", "");


  //console.log(tweetIframes)
  //console.log(url.getState().layers)
  // tweetIframes.forEach(element => {
  //     element.onload=function() {
  //     this.contentWindow.postMessage({ element: this.id, query: "checked" });
  // };
  // });
  // tweetIframes.forEach(element => {
  //     element.onload=function() {
  //     this.contentWindow.postMessage({ element: this.id, query: "height" }, "https://twitframe.com");
  // };
  // });
}




/* listen for the return message once the tweet has been loaded */
// window.onmessage = (oe) => {
//     if (oe.origin != "https://twitframe.com")
//         return;
//     if (oe.data.height && oe.data.element.match(/^tweet_/))
//         document.getElementById(oe.data.element).style.height = parseInt(oe.data.height) + "px";
// }

function changeDropDownState() {
    var selectedBaseLayer = url.getState().layers[0];
    //console.log(selectedBaseLayer)
    //console.log(document.getElementById("selectLayer").value)
    //if(selectedBaseLayer != document.getElementById("selectLayer").value
    document.getElementById("selectLayer").value = selectedBaseLayer;
}

window.SwitchLayer = function(event) {
    let res = event.value.toString();
    let getStateForSelection = url.getState();
    //console.log(getStateForSelection)
    //getStateForSelection.layers[0] = res;
    //console.log('res:' + res)
    base.hideLayer(getStateForSelection.layers[0]);
    base.showLayer(res);
}

// window.SwitchEPRT = function(event) {
//   let res = event.value.toString()
//   let getStateForSelection = url.getState();
//
//   getStateForSelection.layers[0] = res
//
//   base.setState(getStateForSelection)
// }

let twitter = {
    sidebar: null,
    marker: L.marker(null, {icon: icons['climateaction']}),
    init: function() {
        // twitter.sidebar = L.control.sidebar('new-tweet-sidebar', {
        //     closeButton: false,
        //     position: 'left'
        // });
        // base.map.addControl(twitter.sidebar)
        // twitter.sidebar.on('hide', function () {
        //     twitter.marker.remove()
        // });

    },
    showTweetBox: function(e) {
        // update marker
        twitter.marker.setLatLng(e.latlng);
        twitter.marker.addTo(base.map);

        // open sidebar
        //base.showSidebar(twitter);

        //twittermarker = L.marker(e.latlng);

        //base.map.addLayer(twittermarker);

        let hash = encode(e.latlng.lat, e.latlng.lng);
        function selectLayer(event) {
            console.log('this is ' + event.value.toString())
        }

        let text = '<label>Set appearance:</label>' +
        '<form  method=get>'+
        '<select id="selectLayer" onchange="window.SwitchLayer(this)"></select>'

        for (let i = 1; i < url.getState().layers.length; i++) {
            //console.log(url.getState().layers[i])
            text = text + '<div id="layercontrol"><label><input id="layers-' + url.getState().layers[i] + '" type="checkbox" data-layer="' + url.getState().layers[i] + '" checked>' + base.layers[url.getState().layers[i]].options.name + '</label></div>'
        };
        text = text + '<label><br>What\'s happening here?</label>'+
        '<textarea id="tweetText" ></textarea>' +
        '</form>'+
        '<div id="tweetBtn" style="min-height: 25px;">'+
        '<center><a target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="false" data-text=""></center>' +
        '</div>';

        showGeoLoc
            .setLatLng(e.latlng)
            .setContent(text)
            .openOn(base.map);



        let getStateForSelection = url.getState();
        let baseTilesArray = base.layerSets.baseTiles


        let layerNames = baseTilesArray.getNameObject()
        //console.log(Object.keys(layerNames)[1])
        let select = document.getElementById('selectLayer');

        for (let i = 0; i < Object.keys(layerNames).length; i++) {
          let optco = Object.keys(layerNames)[i];
          let optco2 = Object.keys(baseTilesArray.layers)[i];
          let opt = document.createElement('option');
          opt.textContent = optco;
          opt.value = optco2;
          select.appendChild(opt);
          select.value = getStateForSelection.layers[0]
          // loop for grabbing each country name and displaying it in the drop-down
        }

        $('div#layercontrol input[type="checkbox"]').on('change', function() {
            var checkbox = $(this);
            var layer = checkbox.data().layer;
            var baseLayer = 'base.layers[\"' + layer + '\"]'
            // console.log(base.layers);
            // console.log(layer);
            // console.log(checkbox)
            // toggle the layer

            if ($(this).is(':checked')) {
                  if(layer.indexOf('no2_') === 0) {
                      //hide all layers that start with "no2"
                      let arr = url.getState().layers
                      arr = arr.filter(function (item) {
                          return item.indexOf("no2_") === 0;
                        });

                       if(arr.length == 1)
                           base.hideLayer(arr)
                  }

                  base.showLayer(layer);

             } else {
                  base.hideLayer(layer);
             }

             let stateNow = url.getState();

             stateNow.layers = base.getVisibleLayers();
             //console.log(base.getVisibleLayers());
             url.pushState(stateNow);
      });




        //base.map.showSidebar(twitter, text)
        //base.map.sidebar.setContent(text)

        //console.log(e);
        TwitterWidgetsLoader.load(function(err, twttr) {
            if (err) {
                showError();
                //do some graceful degradation / fallback
                return;
            }

            twttr.widgets.load();
        });
        let stateSet = false
        let location = null
        let firstState = null
        //here comes the beauty
        function onTweetSettingsChange(e) {
            let tweettype = $('#new-tweet-sidebar select.icontype').val();
            //listenForLayerChange()


            twitter.marker.setIcon(icons['climateaction'])
            let tweet = $('#tweetText').val()
            //let tweet = $('#new-tweet-sidebar textarea').val();

            // if (tweet.search("#decarbnow") == -1)
            //     tweet = '#decarbnow ' + tweet;
            let state = url.getPath();


            //tweet += ' https://map.decarbnow.space' + state;

            // Remove existing iframe
            //$('#new-tweet-sidebar .tweetBtn').html('');
            $('#tweetBtn').html('');
            // Generate new markup
            // var tweetBtn = $('<a></a>')
            //     .addClass('twitter-share-button')
            //     .attr('href', 'http://twitter.com/share')
            //     .attr('data-url', 'https://decarbnow.space/map/')
            //     //.attr('data-url', 'https://decarbnow.space/map/' + hash + '/' + tweettype)
            //     .attr('data-text', tweet);
            // $('#new-tweet-sidebar .tweetBtn').append(tweetBtn);

            var tweetBtn = $('<a></a>')
                .addClass('twitter-share-button')
                .attr('href', 'http://twitter.com/share')
                .attr('data-text', tweet + '\n\n');

            if(!stateSet){
                tweetBtn = tweetBtn
                    .attr('data-url', 'https://map.decarbnow.space' + state)
                location = state.split("/")[1]
            } else {
                let stateSplit = state.split("/")
                stateSplit[1] = location
                firstState = stateSplit.join('/')
                tweetBtn = tweetBtn
                    .attr('data-url', 'https://map.decarbnow.space' + firstState)
            };
            //console.log(firstState)
            stateSet = true


            $('#tweetBtn').append(tweetBtn);
            if(window.twttr.widgets){
                window.twttr.widgets.load();
            }

            // if(window.twttr.widgets)
            //     window.twttr.widgets.load();
        }

        function debounce(callback) {
            // each call to debounce creates a new timeoutId
            let timeoutId;
            //console.log("debouncing..");
            return function() {
                // this inner function keeps a reference to
                // timeoutId from the function outside of it
                clearTimeout(timeoutId);
                timeoutId = setTimeout(callback, DEBOUNCE_TIMEOUT);
            }
        }

        $('#tweetText').on('input', function() {
            debounce(onTweetSettingsChange)();
        });

        //
        // $('#selectLayer').on('input', function() {
        //     debounce(onTweetSettingsChange)();
        // });
        //

        //Debouncing, hide NO2 layer does not count as overlay change (bug?)
        for (let i = 1; i < url.getState().layers.length; i++) {
          $('#layers-' + url.getState().layers[i]).on('input', function() {
              debounce(onTweetSettingsChange)();
          });
        }

        base.map.on('baselayerchange overlayadd overlayremove zoomend', function(e) {
          //console.log(base.tweetBoxActive)
          if(base.tweetBoxActive){
            debounce(onTweetSettingsChange)();
            changeCheckboxState();
            changeDropDownState();
          }

        });

        // base.map.on('baselayerchange overlayadd overlayremove zoomend', function(e) {
        //   changeCheckboxState();
        // });

        // $('#new-tweet-sidebar select.icontype').on('change', onTweetSettingsChange);
        //
        // $('#new-tweet-sidebar textarea').on('input', function() {
        //     debounce(onTweetSettingsChange)();
        // });

        // //init debounce Timeout not working!!
        //debounce(onTweetSettingsChange)();
        tweets.closeSidebar();
        base.hideCrosshair();

        //console.log(e);
        if(window.twttr.widgets){
            window.twttr.widgets.load();
        }

    }
    // closeSidebar: function() {
    //     twitter.sidebar.hide();
    // }
}

export default twitter
