import base from "./base.js";
import { encode, decode } from '@alexpavlov/geohash-js';

let url = {
    //prefix: '/map/',
    prefix: '/',
    //prefix: '',
    keyValueDivider: '=',
    specialKeys: ['@'],
    listDivider: ',',
    divider: '/',
    geoHash: true,

    _stateToUrl: function(s) {
        let lng = parseFloat(s.center.lng).toFixed(5),
            lat = parseFloat(s.center.lat).toFixed(5),
            layers = s.layers.filter(e => e !== 'empty');

        let vars = {
            z: s.zoom,
            ls: layers.join(url.listDivider),

        }

        if (s.tweet) {
            vars = {...{
                't': s.tweet,
            }, ...vars}
        }

        if (url.geoHash) {
            vars = {...{
                '@': encode(lat, lng),
            }, ...vars}
        } else {
            vars = {...{
                lng: lng,
                lat: lat,
            }, ...vars}
        }

        if(s.polygons){
            vars.polygons = s.polygons
        }

        let parts = Object.keys(vars).map(k => {
            return [k, vars[k]].join(url.specialKeys.includes(k) ? '' : url.keyValueDivider);
        })

        return url.prefix + parts.join(url.divider)
    },

    _urlToState: function(path) {
        let parts = path.split(url.divider);

        let rs = {};
        parts.forEach((n) => {
            if (url.specialKeys.includes(n.charAt(0))) {
                rs[n.charAt(0)] = n.slice(1);
            } else {
                let v = n.split(url.keyValueDivider);
                rs[v[0]] = v[1];
            }
        });

        let s = {};

        if (rs['@']) {
            let t = decode(rs['@']);
            s.center = {
                lat: t.latitude,
                lng: t.longitude,
            };
        }

        if (rs.lat && rs.lng)
            s.center = {
                lat: rs.lat,
                lng: rs.lng,
            };

        if (rs.z)
            s.zoom = parseInt(rs.z);

        if (rs.ls)
            s.layers = rs.ls.split(url.listDivider);

        if (rs.t)
            s.tweet = rs.t;

        if (rs.polygons)
            s.polygons = rs.polygons;

        return s;
    },

    pushState: function(state = null) {

        if (!state)
            state = base.getState();

        var obj = {
            Title: `Lat: ${state.center.lat}, Lng: ${state.center.lng}`,
            Url: url._stateToUrl(state)
        };

        history.pushState(obj, obj.Title, obj.Url);
    },

    getState: function() {
        return url._urlToState(url.getPath());
    },

    getPath: function() {
        return window.location.pathname;
    },
}

export default url;
