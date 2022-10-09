import base from '../base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';
//import 'topojson-client';
//import 'topojson';
//import * as omnivore from "@mapbox/leaflet-omnivore";
//import 'topojson-simplify';
import config from '../config.js'
import 'leaflet.vectorgrid'

L.LazyLayerGroup = L.LayerGroup.extend({
    initialize: function(id, options) {
        this.id = id;

        L.LayerGroup.prototype.initialize.call(this);
        L.setOptions(this, options);

        this.source = null;
        if (this.options.file)
            this.source = `/data/layers/${this.options.file}`

        if (this.options.url) {
            if (this.options.extern)
                this.source = this.options.url
            else
                this.source = `${config.data.url}layers/${this.options.url}`
        }

        this.loaded = !this.source;

        this.on('add', function() {
            if (!config.data.caching && this.source || !this.loaded)
                this.load();

            /* if (this.legend) {
                 console.log('LOAD LEGNED')
            } */
        })
    },
    load: function() {
        // console.log(`LazyLayerGroupI ('${this.id}'): load`)
        let self = this;
        base.map.spin(true);

        $.getJSON(self.source, function(data) {
            if (self.options.transform)
                data = self.options.transform(data)

            self.addLayer(L.vectorGrid.slicer(data, {
              ...self.options.parent.defaultAttr,
              ...self.options.attr,
              rendererFactory: L.svg.tile,
              zIndex: 10,
        			vectorTileLayerStyles: {
        				sliced: function(properties, zoom) {

        					var p = self.options.attr.style;
                  //console.log(self)
                  if(zoom < 7){
                    var pradius = 1
                  } else if (zoom < 10 & zoom > 6) {
                    var pradius = 3
                  } else if (zoom > 9){
                    var prdius = 5
                  }

                  // if (typeof self.options.attr.onEachFeature !== 'undefined') {
                  //     //self.options.attr.onEachFeature(properties)
                  //     console.log("feat exist")
                  // }

        					return {
        						fillColor: p.fillColor,
        						fillOpacity: eval(p.fillOpacity),
        	 					//fillOpacity: 1,
        						stroke: p.stroke,
        						fill: true,
        						color: p.color,
                    radius: pradius,
         							//opacity: 0.2,
        						weight: p.weight
        					}


        				}
        			},

        			interactive: self.options.attr.style.interactive,
        			getFeatureId: function(f) {
        				return f.properties.self;
              }



            })



          )

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
                    // console.log(legend)
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
        return Object.assign({}, ...Object.values(this.layers).filter(function (entry) {
            return config.data.ignoreHidden || !entry.options.hidden;
        }).map(l => ({[l.options.name]: l})))
    }
}

export default LazyLayerSet
