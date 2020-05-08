import LazyLayerGroup from './LazyLayerGroup.js';

let style = {
    fillColor: "#FF0000",
    stroke: true,
    weight: 0.5,
    opacity: 0.7,
    color: "#F1EFE8",
    interactive: false,
    fillOpacity: 0.05
};

let layersList = {};

let omiYears = [2007, 2011, 2015, 2019];
omiYears.forEach(n => {
    layersList[`no2_${n}`] = {
        file: `no2/World_${n}_rastered.geojson`,
        name: `NO<sub>2</sub> ${n}`
    }
});

let tropomiDates = [[2019, 12], [2020, 1], [2020, 2], [2020, 3]];
tropomiDates.forEach(n => {
    layersList[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
        file: `no2/World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
        name: `NO<sub>2</sub> ${n[0]}-${String(n[1]).padStart(2, '0')}`
    }
});

layersList['empty'] = {
    name: 'Disabled'
};

export default {
    init: function() {
        let llg = new LazyLayerGroup('pollution', layersList, {
            style: style
        });
        return llg;
    }
};
