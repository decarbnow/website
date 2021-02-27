import config from '../config.js'

let layersList = {};

let omiYears = [2007, 2011, 2015, 2019, 2020];
omiYears.forEach(n => {
    layersList[`no2_${n}`] = {
        //file: `no2/World_${n}_rastered.geojson`,
        url: `/no2/World_${n}_rastered.geojson`,
        name: `NO<sub>2</sub> ${n}`
    }
});

let tropomiDates = [[2019, 12], [2020, 1], [2020, 2], [2020, 3], [2020, 4], [2020, 5], [2020, 6], [2020, 7]];
tropomiDates.forEach(n => {
    layersList[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
        //file: `no2/World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
        url: `/no2/World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
        name: `NO<sub>2</sub> ${n[0]}-${String(n[1]).padStart(2, '0')}`
    }
});

// layersList['temp'] = {
//     layer: L.tileLayer('http://127.0.0.1:8088/layers/temperature/{z}/{x}/{y}.png', {
//         attribution: '© CDS',
//         minZoom: 0,
//         maxZoom: 15,
//         maxNativeZoom: 7,
//         opacity: 0.7,
//         tms: false,
//         ext: 'png'
//     }),
//     name: 'Temperature'
// }



// TODO: MAKE LEGEND CLASS
// LEGEND
let legend = ''
legend += "<h4>Diff. Temperature</h4>";
legend += "<h5>Average 1980-1989 <br/>compared with 2015-2019<h5>";
legend += "<div class='inner'>";

let tempThresholds = [-Infinity, -8, -4, -2, -1, 0, 1, 2, 4, 8, Infinity]
let colors = [
    "#0000FF", "#3333FF", "#6666FF", "#9999FF", "#CCCCFF",
    "#FFCCCC", "#FF9999", "#FF6666", "#FF3333", "#FF0000"
]

let visible = [
    false, false, false, true, true,
    true, true, true, true, false
];

let tempToStr = function(t) {
    if (t < 0)
        return t;
    else
        return `&nbsp;${t}`
}

colors.forEach(function (color, i) {
    if (!visible[i])
        return;
    let t1 = tempThresholds[i];
    let t2 = tempThresholds[i + 1];

    let text = [];
    if (isFinite(t1))
        text.push(`≥${tempToStr(t1)}℃`)
    if (isFinite(t2))
        text.push(`<${tempToStr(t2)}℃`)
    // if (isFinite(t))
    //     text += ` < ${t}`
    legend += `<i style="background: ${color}"></i><span>${text.join(', ')}</span><br>`;
});
legend += "</div>";


layersList['tempDiff'] = {
    layer: L.tileLayer(`${config.data.url}layers/temperature/80-89to15-19/{z}/{x}/{y}.png`, {
        attribution: '© CDS',
        minZoom: 0,
        maxZoom: 10,
        maxNativeZoom: 2,
        opacity: 0.6,
        tms: false,
        ext: 'png'
    }),
    legend: legend,
    name: 'Temperature Diff. <i class="fa fa-info-circle" title="Average 1980-1989 compared with 2015-2019"></i>'
}

layersList['empty'] = {
    name: 'Disabled'
};

export default {
    style: {
        fillColor: "#FF0000",
        stroke: true,
        weight: 0.1,
        opacity: 0.7,
        color: "#F1EFE8",
        interactive: false,
        fillOpacity: 0.05
    },
    list: layersList
}
