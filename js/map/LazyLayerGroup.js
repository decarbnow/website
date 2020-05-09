import base from './base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';

class LazyLayerGroup {
    constructor(id, list, defaultAttr = {}) {
        let self = this;

        this.id = id;
        this.list = list;
        this.defaultAttr = defaultAttr;
        this.overlays = {};

        Object.keys(list).forEach(n => {
            let e = list[n];
            if (!e.layer) {
                // create dummy layer
                let layer = new L.LayerGroup()
                layer.group = self
                layer.id = n
                // add info
                e.layer = layer
                e.loaded = false
                e.attr = e.attr || {}
            }
            self.overlays[e.name] = e.layer
        })
    }

    getActiveLayers() {
        return Object.keys(this.list).filter(e => (base.map.hasLayer(this.list[e].layer)))
    }

    activateLayer(id) {
        this.load(id);
        this.list[id].layer.addTo(base.map);
    }

    load(id) {
        //console.log(`LazyLayerGroup ('${this.id}'): show layer '${id}'`)
        let self = this;
        let e = this.list[id];
        if (e.file && !e.loaded) {
            base.map.spin(true);
            $.getJSON(`/data/layers/${e.file}`, function(data) {
                e.layer.addLayer(L.geoJson(data, {...self.defaultAttr, ...self.list[id].attr}))
                e.loaded = true
                base.map.spin(false);
            })
        }
    }
}

export default LazyLayerGroup
