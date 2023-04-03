import base from '../base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';
import config from '../config.js'

let latLngs = [];
let country_i = 1
// credits: https://github.com/turban/Leaflet.Mask
L.Mask = L.Polygon.extend({
	options: {
		stroke: false,
		color: '#333',
		fillOpacity: 0.3,
		clickable: false,

		outerBounds: new L.LatLngBounds([-90, -360], [90, 360])
	},

	initialize: function (latLngs, options) {

         var outerBoundsLatLngs = [
			this.options.outerBounds.getSouthWest(),
			this.options.outerBounds.getNorthWest(),
			this.options.outerBounds.getNorthEast(),
			this.options.outerBounds.getSouthEast()
		];
        L.Polygon.prototype.initialize.call(this, [outerBoundsLatLngs, latLngs], options);
	},

});

L.mask = function (latLngs, options) {
	return new L.Mask(latLngs, options);
};


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
        //console.log(`LazyLayerGroupI ('${this.id}'): load`)
        let self = this;
        base.map.spin(true);
        $.getJSON(self.source, function(data) {
            if (self.options.transform)
                data = self.options.transform(data)
            // console.log(self.id)
            // if(self.id.startsWith("countries!")){
            //   country_i = country_i + 1
            //   //var obj = L.geoJson(data, {...self.options.parent.defaultAttr, ...self.options.attr})
            //   //console.log(data)
            //   var coordinates = data.features[0].geometry.coordinates[0];
            //   //console.log(coordinates)
            //
            //   // coordinates.forEach((item, i) => {
            //   //   latLngs.push(new L.LatLng(coordinates[i][1], coordinates[i][0]));
            //   // });
            //   var strng = JSON.stringify(coordinates)
            //
            //   var object = JSON.parse(strng);
            //
            //   // Extract the values of the object into an array
            //   var array = Object.values(object);
            //   var array2 = array.flat(3)
            //
            //
            //   array2 = array2.reduce(function(result, value, index, array) {
            //     if (index % 2 === 0)
            //       result.push(array.slice(index, index + 2));
            //     return result;
            //   }, []);
            //
            //   array2.forEach((item, i) => {
            //     latLngs.push(new L.LatLng(array2[i][1], array2[i][0]));
            //   });
            //   if(base.country_n == country_i)
            //       self.addLayer(L.mask(latLngs))
            // } else {
            //   self.addLayer(L.geoJson(data, {...self.options.parent.defaultAttr, ...self.options.attr}))
            // }
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
                    legend = L.control({ position: "bottomright" });
                    legend.onAdd = function(map) {
                        var div = L.DomUtil.create("div", "legend");
                        div.innerHTML = layerOptions.legend;
                        return div;
                    };
                    legend.addTo(base.map);
                })

                layer.on('remove', function() {
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
