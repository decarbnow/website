import dmap from './map.js'
import { LayerGroup } from 'leaflet';
import 'leaflet-spin';

let pollutionStyle = {
    fillColor: "#FF0000",
    //fillColor: "#a1a1e4",
    stroke: true,
    weight: 0.5,
    opacity: 0.7,
    //weight: 0.8,
    //opacity: 1,
    color: "#F1EFE8",
    interactive: false,
    //weight: 2,
    //opacity: 1,
    //color: 'white',
    //dashArray: '3',
    fillOpacity: 0.05
}


let layers = {
    list: {},
    overlays: {},
    nameToID: {},
    hidden: null,
    switch: function(id) {
        layers.hidden.clearLayers();
        layers.hidden.addData(layers.list[id].content);
        layers.list[id].layer.addTo(dmap.map)
    },
    show: function(id, doAfter) {
        console.log(`show layer ${id}`)
        if (layers.list[id].content) {
            layers.switch(id)
            if (doAfter)
                doAfter()
        } else {
            dmap.map.spin(true);
            $.getJSON("/map/no2layers/" + layers.list[id].file, function(layer) {
                layers.list[id].content = layer
                layers.switch(id)
                dmap.map.spin(false);
                if (doAfter)
                    doAfter()
            })
        }
    },
    init: function(active) {
        let omiYears = [2007, 2011, 2015, 2019]

        omiYears.forEach(n => {
            layers.list[`no2_${n}`] = {
                file: `World_${n}_rastered.geojson`,
                name: `NO<sub>2</sub> ${n}`,
                content: null,
            }
        })

        let tropomiDates = [[2019, 12], [2020, 1], [2020, 2], [2020, 3]]

        tropomiDates.forEach(n => {
            layers.list[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
                file: `World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
                name: `NO<sub>2</sub> ${n[0]}-${String(n[1]).padStart(2, '0')}`,
                content: null,
            }
        })

        let emptyFeature = null;
        layers.hidden = L.geoJson(emptyFeature, {style: pollutionStyle}).addTo(dmap.map)

        Object.keys(layers.list).forEach(n => {
            layers.nameToID[layers.list[n].name] = n
            let l = new L.LayerGroup()
            layers.overlays[layers.list[n].name] = l
            layers.list[n].layer = l
        })
    }
}

export default layers
