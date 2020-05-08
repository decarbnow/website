import dmap from './base.js'
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
            dmap.map.removeLayer(this.list[this.active].layer);
        this.list[id].layer.addTo(dmap.map)
        this.active = id
    }

    show(id, doAfter) {
        console.log(`SHOW ID '${id}'`)
        let self = this;
        if (!this.list[id].layer.loaded) {
            dmap.map.spin(true);
            $.getJSON(`/data/layers/${this.list[id].file}`, function(data) {
                self.list[id].layer = L.geoJson(data, {...self.attr, ...self.list[id].attr})
                self.list[id].layer.group = self;
                self.list[id].loaded = true
                self.switch(id)
                dmap.map.spin(false);
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
