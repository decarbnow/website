import 'leaflet-control-geocoder';

L.GeoIP = L.extend({
  getPosition: function (ip) {
    var url = "https://freegeoip.app/json/";
    var result = L.latLng(0, 0);

    if (ip !== undefined) {
      url = url + ip;
    } else {
      //url = url + "143.130.30.36";
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onload = function () {
      var status = xhr.status;
      if (status == 200) {
        var geoip_response = JSON.parse(xhr.responseText);
        result.lat = geoip_response.latitude;
        result.lng = geoip_response.longitude;
      } else {
        console.log("Leaflet.GeoIP.getPosition failed because its XMLHttpRequest got this response: " + xhr.status);
      }
    };
    xhr.send();
    return result;
  },

  centerMapOnPosition: function (map, zoom, ip) {
    var position = L.GeoIP.getPosition(ip);
    map.setView(position, zoom);
  }
});


if(window.location.pathname.split("/").length > 3) {
    decarbnowMap.setView([15, 0], 2);
} else {
    L.GeoIP.centerMapOnPosition(decarbnowMap, 5);
}



