import base from "./base.js";
import tiles from './tiles.js';

let url = {
    s: {
        z: 5,
        lat: 48,
        lng: 15,
        ls: 'Light',
    },
    prefix: '/map/',
    stateToUrl: function() {
        let center = base.map.getCenter();
        let z = base.map.getZoom();

        let ls = [];
        Object.keys(tiles).forEach((k) => {
            if (base.map.hasLayer(tiles[k]))
                ls.push(k);
        });
        if (ls.length == 0)
            ls = url.s.ls.split(',');

        var obj = { Title: `Lat: ${center.lat}, Lng: ${center.lng}`, Url: `${url.prefix}lng@${center.lng}/lat@${center.lat}/z@${z}/ls@${ls.join(',')}`};
        history.pushState(obj, obj.Title, obj.Url);
    },
    stateFromUrl: function() {
        let p = window.location.pathname.substring(url.prefix.length).split('/')

        p.forEach((n) => {
            let v = n.split('@')
            url.s[v[0]] = v[1]
        });

        base.map.flyTo({lat: url.s.lat, lng: url.s.lng}, url.s.z, {
            animate: true,
            duration: 1.5
        });

        tiles[url.s.ls.split(',')[0]].addTo(base.map)
    }

}

window.url = url

export default url;
