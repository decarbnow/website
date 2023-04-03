import { icons } from "./marker/icons.js";
import { encode } from '@alexpavlov/geohash-js';
import 'twitter-widgets';
import base from './base.js';
import url from './url.js';
import 'leaflet-control-window';

const DEBOUNCE_TIMEOUT = 500;
var twittermarker;

var TwitterWidgetsLoader = require('twitter-widgets');

function changeCheckboxState() {
  /* find all iframes with ids starting with "tweet_" */
  var allIdsFromCheckbox = document.querySelectorAll("[id^='layers-']")

  var a = []
  allIdsFromCheckbox.forEach(elem => {
      a.push(elem.getAttribute('id').replace("layers-", ""))
  });

  var b = url.getState().layers

  var activeCheckboxIds =  a.filter(function(v) {
      return b.includes(v);
  })


  a.forEach((item, i) => {
      document.getElementById("layers-" + item).checked = false;
  });

  activeCheckboxIds.forEach((item, i) => {
      document.getElementById("layers-" + item).checked = true;
  });
}

function changeDropDownState() {
    var selectedBaseLayer = url.getState().layers[0];
    document.getElementById("selectLayer").value = selectedBaseLayer;
}

window.SwitchLayer = function(event) {
    let res = event.value.toString();
    let getStateForSelection = url.getState();
    base.hideLayer(getStateForSelection.layers[0]);
    base.showLayer(res);
}

let twitter = {
    sidebar: null,
    controlwindow: null,
    marker: L.marker('selected', {icon: icons['climateaction']}),
    init: function() {
        twitter.controlwindow = L.control.window(base.map, {title:'', content:'', visible: false})
        twitter.addEventHandlers();
    },
    showTweetBox: function(e) {
        // update marker
        twitter.marker.setLatLng(e.latlng);
        twitter.marker.addTo(base.map);

        let hash = encode(e.latlng.lat, e.latlng.lng);
        function selectLayer(event) {
            console.log('this is ' + event.value.toString())
        }

        let text = '<div class=\"sidebar-container twitterwindowmenu"><div style=\"text-align:left; width:220px;"><label>Set appearance:</label>' +
        '<form  method=get>'+
        '<select id="selectLayer" onchange="window.SwitchLayer(this)"></select><br><br>'
        for (let i = 1; i < url.getState().layers.length; i++) {
            text = text + '<div id="layercontrol"><label><input id="layers-' + url.getState().layers[i] + '" type="checkbox" data-layer="' + url.getState().layers[i] + '" checked>' + base.layers[url.getState().layers[i]].options.name + '</label></div>'
        };
        text = text + '<label><br>What\'s happening here?</label>'+
        '<textarea id="tweetText" style="resize:vertical; width:270px; height:150px;"></textarea>' +
        '</form>'+
        '<div id="tweetBtn" style="height: 25px;">'+
        '<left><a target="_blank" href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="false" data-text=""></left>' +
        '</div></div></div>';

        twitter.controlwindow.content(text)
        twitter.controlwindow.title("Create Tweet @ (" + e.latlng.lat.toFixed(1) + ", " + e.latlng.lng.toFixed(1) + ")")
        twitter.controlwindow.show('topRight')

        let getStateForSelection = url.getState();
        let baseTilesArray = base.layerSets.baseTiles


        let layerNames = baseTilesArray.getNameObject()

        let select = document.getElementById('selectLayer');

        for (let i = 0; i < Object.keys(layerNames).length; i++) {
          let optco = Object.keys(layerNames)[i];
          let optco2 = Object.keys(baseTilesArray.layers)[i];
          let opt = document.createElement('option');
          opt.textContent = optco;
          opt.value = optco2;
          select.appendChild(opt);
          select.value = getStateForSelection.layers[0]

        }

        $('div#layercontrol input[type="checkbox"]').on('change', function() {
            var checkbox = $(this);
            var layer = checkbox.data().layer;
            var baseLayer = 'base.layers[\"' + layer + '\"]'

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

             url.pushState(stateNow);
        });

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
            twitter.marker.setIcon(icons['climateaction'])
            if(twitter.marker._icon != null){
                twitter.marker._icon.classList.add("selected");
            }

            if(!url.getState().layers.includes("tweets") & twitter.marker._icon != null){
                twitter.marker._icon.classList.add("noTweets");
            }

            let tweet = $('#tweetText').val()

            let state = url.getPath();

            // Remove existing iframe
            $('#tweetBtn').html('');

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

            stateSet = true


            $('#tweetBtn').append(tweetBtn);
            if(window.twttr.widgets){
                window.twttr.widgets.load();
            }
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

        //Debouncing, hide NO2 layer does not count as overlay change (bug?)
        for (let i = 1; i < url.getState().layers.length; i++) {
          $('#layers-' + url.getState().layers[i]).on('input', function() {
              debounce(onTweetSettingsChange)();
          });
        }

        base.map.on('baselayerchange overlayadd overlayremove zoomend', function(e) {
          if(base.tweetBoxActive){
              debounce(onTweetSettingsChange)();
              changeCheckboxState();
              changeDropDownState();
              if(!url.getState().layers.includes("tweets") & twitter.marker._icon != null){
                  twitter.marker._icon.classList.add("noTweets");
              }
          }

        });

        tweets.closeSidebar();

        if(window.twttr.widgets){
            window.twttr.widgets.load();
        }
    },

    addEventHandlers: function() {
        twitter.controlwindow.on("hide", function(e) {
            tweets.closeSidebar();
            twitter.marker.remove();
        });

        twitter.controlwindow.on("show", function(e) {
            tweets.controlwindow.hide();
        });
    }
}

export default twitter
