import base from './base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';

class LazyLayerGroup {
    constructor(list, attr = {}) {
        let self = this;

        this.active = null;
        this.list = list
        this.attr = attr
        this.overlays = {}

        Object.keys(this.list).forEach(n => {
            if (!self.list[n].attr)
                self.list[n].attr = {}
            self.list[n].loaded = false
            let l = new L.LayerGroup()
            l.group = self
            l.id = n
            self.overlays[self.list[n].name] = l
            self.list[n].layer = l
        })
    }

    switch(id) {
        if (this.active)
            base.map.removeLayer(this.list[this.active].layer);
        this.list[id].layer.addTo(base.map)
        this.active = id
    }

    show(id, doAfter) {
        //console.log(`LazyLayerGroup: show layer ID '${id}'`)
        let self = this;
        if (!this.list[id].loaded) {
            base.map.spin(true);
            //console.log(`LazyLayerGroup: load layer ID '${id}'`)
            $.getJSON(`/data/layers/${this.list[id].file}`, function(data) {
                self.list[id].layer = L.geoJson(data, {...self.attr, ...self.list[id].attr})
                self.list[id].layer.group = self;
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
