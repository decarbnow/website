import base from '../base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';

let data = __DATA__;
let urlPrefix = data.list[data.default];

L.LazyLayerGroup = L.LayerGroup.extend({
    initialize: function(id, options) {
        this.id = id;

        L.LayerGroup.prototype.initialize.call(this);
        L.setOptions(this, options);

        this.source = null;
        if (this.options.file)
            this.source = `/data/layers/${this.options.file}`

        if (this.options.url)
            this.source = `${urlPrefix}layers/${this.options.url}`

        this.loaded = !this.source;

        this.on('add', function() {
            if (!this.loaded)
                this.load();

            if (this.legend) {
                console.log('LOAD LEGNED')
            }
        })
    },
    load: function() {
        // console.log(`LazyLayerGroupI ('${this.id}'): load`)
        let self = this;
        base.map.spin(true);

        $.getJSON(self.source, function(data) {
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
        Object.keys(options.list).forEach(layerId => {
            let layerOptions = options.list[layerId];
            layerOptions.parent = self;
            layerOptions.attr = layerOptions.attr || {};

            let layer = layerOptions.layer;

            if (!layer)
                layer = new L.LazyLayerGroup(layerId, layerOptions);
            else
                L.setOptions(layer, layerOptions);


            if (layerOptions.legend) {
                let legend = null;
                layer.on('add', function() {
                    legend = L.control({ position: "bottomleft" });
                    legend.onAdd = function(map) {
                        var div = L.DomUtil.create("div", "legend");
                        div.innerHTML = layerOptions.legend;
                        return div;
                    };
                    legend.addTo(base.map);
                })

                layer.on('remove', function() {
                    console.log(legend)
                    legend.remove(base.map);
                })
            }

            self.layers[layerId] = layer;
        })
    }

    getVisibleLayers() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));
    }

    getNameObject() {
        return Object.assign({}, ...Object.values(this.layers).map(l => ({[l.options.name]: l})))
    }
}

export default LazyLayerSet
