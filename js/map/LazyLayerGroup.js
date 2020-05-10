import base from './base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';


L.LazyLayerGroup = L.LayerGroup.extend({
    initialize: function(id, options) {
        this.id = id;
        options.pane = `${id}Pane`;

        L.LayerGroup.prototype.initialize.call(this);
        L.setOptions(this, options);

        this.loaded = !this.options.file;

        this.on('add', function() {
            if (!this.loaded)
                this.load();
        })
    },
    load: function() {
        // console.log(`LazyLayerGroupI ('${this.id}'): load`)
        let self = this;
        base.map.spin(true);
        $.getJSON(`/data/layers/${self.options.file}`, function(data) {
            self.addLayer(L.geoJson(data, {...self.options.parent.defaultAttr, ...self.options.attr}))
            self.loaded = true
            base.map.spin(false);
        })
    }
});

class LazyLayerSet {
    constructor(id, list, defaultAttr = {}) {
        let self = this;

        this.id = id;
        this.defaultAttr = defaultAttr;

        this.overlays = {};
        this.layers = {};
        Object.keys(list).forEach(n => {
            let o = list[n];
            let layer = o.layer;
            if (!layer) {
                // add info
                o.parent = self;
                o.attr = o.attr || {};
                // create dummy layer
                layer = new L.LazyLayerGroup(n, o);
            }
            self.layers[n] = layer;
            self.overlays[o.name] = layer;
        })
    }

    getActiveLayers() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));
    }
}

export default LazyLayerSet
