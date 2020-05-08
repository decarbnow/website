import dmap from "./base.js";
import { encode } from '@alexpavlov/geohash-js';
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
        let center = dmap.map.getCenter();
        let z = dmap.map.getZoom();
        //let hash = encode(center.lat, center.lng);
        let ls = [];
        Object.keys(tiles).forEach((k) => {
            if (dmap.map.hasLayer(tiles[k]))
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

        dmap.map.flyTo({lat: url.s.lat, lng: url.s.lng}, url.s.z, {
            animate: true,
            duration: 1.5
        });

        tiles[url.s.ls.split(',')[0]].addTo(dmap.map)
    }

}

window.url = url

export default url;
