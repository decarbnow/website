import dmap from './base.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';

let pollutionStyle = {
    fillColor: "#FF0000",
    stroke: true,
    weight: 0.5,
    opacity: 0.7,
    color: "#F1EFE8",
    interactive: false,
    fillOpacity: 0.05
}


// let layers = {
//     list: {},
//     overlays: {},
//     nameToID: {},
//     hidden: null,
//     switch: function(id) {
//         layers.hidden.clearLayers();
//         layers.hidden.addData(layers.list[id].content);
//         layers.list[id].layer.addTo(dmap.map)
//     },
//     show: function(id, doAfter) {
//         if (layers.list[id].content) {
//             layers.switch(id)
//             if (doAfter)
//                 doAfter()
//         } else {
//             dmap.map.spin(true);
//             $.getJSON("/data/layers/no2/" + layers.list[id].file, function(layer) {
//                 layers.list[id].content = layer
//                 layers.switch(id)
//                 dmap.map.spin(false);
//                 if (doAfter)
//                     doAfter()
//             })
//         }
//     },
//     init: function(active) {
//         let omiYears = [2007, 2011, 2015, 2019]
//
//         omiYears.forEach(n => {
//             layers.list[`no2_${n}`] = {
//                 file: `World_${n}_rastered.geojson`,
//                 name: `NO<sub>2</sub> ${n}`,
//                 content: null,
//             }
//         })
//
//         let tropomiDates = [[2019, 12], [2020, 1], [2020, 2], [2020, 3]]
//
//         tropomiDates.forEach(n => {
//             layers.list[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
//                 file: `World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
//                 name: `NO<sub>2</sub> ${n[0]}-${String(n[1]).padStart(2, '0')}`,
//                 content: null,
//             }
//         })
//
//         let emptyFeature = null;
//         layers.hidden = L.geoJson(emptyFeature, {style: pollutionStyle}).addTo(dmap.map)
//
//         Object.keys(layers.list).forEach(n => {
//             layers.nameToID[layers.list[n].name] = n
//             let l = new L.LayerGroup()
//             layers.overlays[layers.list[n].name] = l
//             layers.list[n].layer = l
//         })
//     }
// }

class LasyLayerGroup {
    constructor() {
        this.list = {}
        this.overlays = {}
        this.nameToID = {}
        this.hidden = null
    }

    switch(id) {
        this.hidden.clearLayers();
        this.hidden.addData(this.list[id].content);
        this.list[id].layer.addTo(dmap.map)
    }

    show(id, doAfter) {
        let self = this;
        if (this.list[id].content) {
            this.switch(id)
            if (doAfter)
                doAfter()
        } else {
            dmap.map.spin(true);
            $.getJSON("/data/layers/no2/" + this.list[id].file, function(layer) {
                self.list[id].content = layer
                self.switch(id)
                dmap.map.spin(false);
                if (doAfter)
                    doAfter()
            })
        }
    }

    init(active) {
        let self = this;

        let omiYears = [2007, 2011, 2015, 2019]

        omiYears.forEach(n => {
            this.list[`no2_${n}`] = {
                file: `World_${n}_rastered.geojson`,
                name: `NO<sub>2</sub> ${n}`,
                content: null,
            }
        })

        let tropomiDates = [[2019, 12], [2020, 1], [2020, 2], [2020, 3]]

        tropomiDates.forEach(n => {
            this.list[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
                file: `World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
                name: `NO<sub>2</sub> ${n[0]}-${String(n[1]).padStart(2, '0')}`,
                content: null,
            }
        })

        let emptyFeature = null;
        this.hidden = L.geoJson(emptyFeature, {style: pollutionStyle}).addTo(dmap.map)

        Object.keys(this.list).forEach(n => {
            self.nameToID[self.list[n].name] = n
            let l = new L.LayerGroup()
            self.overlays[self.list[n].name] = l
            self.list[n].layer = l
        })
    }
}

export default LasyLayerGroup
