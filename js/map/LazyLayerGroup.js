import base from './base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';

class LazyLayerGroup {
    constructor(id, list, defaultAttr = {}) {
        let self = this;

        this.active = null;
        this.id = id;
        this.list = list;
        this.defaultAttr = defaultAttr;
        this.overlays = {};

        Object.keys(list).forEach(n => {
            // create dummy layer
            let l = new L.LayerGroup()
            l.group = self
            l.id = n
            // add info
            let e = list[n];
            e.layer = l
            e.loaded = false
            e.attr = e.attr || {}
            self.overlays[e.name] = l
        })
    }

    switch(id) {
        if (this.active)
            base.map.removeLayer(this.active);
        this.list[id].layer.addTo(base.map)
        this.active = this.list[id].layer
    }

    show(id, doAfter) {
        //console.log(`LazyLayerGroup: show layer ID '${id}'`)
        let self = this;
        if (!this.list[id].loaded) {
            base.map.spin(true);
            //console.log(`LazyLayerGroup: load layer ID '${id}'`)
            $.getJSON(`/data/layers/${this.list[id].file}`, function(data) {
                self.list[id].layer = L.geoJson(data, {...self.defaultAttr, ...self.list[id].attr})
                self.list[id].loaded = true
                self.switch(id)
                base.map.spin(false);
                if (doAfter)
                    doAfter()
            })
        } else {
            this.switch(id)
            if (doAfter)
                doAfter()
        }
    }
}

export default LazyLayerGroup
