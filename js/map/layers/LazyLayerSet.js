import base from '../base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';


L.LazyLayerGroup = L.LayerGroup.extend({
    initialize: function(id, options) {
        this.id = id;

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
    constructor(id, options) {
        let self = this;

        this.id = id;
        this.defaultAttr = options.style;

        this.layers = {};
        Object.keys(options.list).forEach(n => {
            let o = options.list[n];
            o.parent = self;
            o.attr = o.attr || {};

            let layer = o.layer;

            if (!layer)
                layer = new L.LazyLayerGroup(n, o);
            else
                L.setOptions(layer, o);

            self.layers[n] = layer;
        })
    }

    getVisibleLayerIds() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));
    }

    getVisibleLayers() {
        return Object.values(this.layers).filter(l => (base.map.hasLayer(l)));
    }

    getNameObject() {
        return Object.assign({}, ...Object.values(this.layers).map(l => ({[l.options.name]: l})))
    }
}

export default LazyLayerSet
