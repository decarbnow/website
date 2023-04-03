import config from '../config.js'
let urlPrefix = "https://raw.githubusercontent.com/decarbnow/data/master/layers";
let layersList = {};

let omiYears = [2007, 2011, 2015];

omiYears.forEach(n => {
    layersList[`no2_${n}`] = {
        url: `/no2/World_${n}_rastered.geojson`,
        name: `NO₂ ${n}`,
        hidden: false
    }
});

let tropomiDates = [[2019, 12], [2020, 1], [2020, 3], [2020, 4], [2020, 5], [2020, 6], [2020, 7]];
tropomiDates.forEach(n => {
    layersList[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
        url: `/no2/World_${n[0]}_${String(n[1]).padStart(2, '0')}.geojson`,
        name: `NO₂ ${n[0]}-${String(n[1]).padStart(2, '0')}`,
        hidden: false
    }
});

// TODO: MAKE LEGEND CLASS
// LEGEND
let legend = ''
legend += "<h4>Diff. Temperature</h4>";
legend += "<h5>Average 1980-1989 <br/>compared with 2015-2019<h5>";
legend += "<div class='inner'>";

let tempThresholds = [-Infinity, -8, -4, -2, -1, 0, 1, 2, 4, 8, Infinity]
let tempColors = [
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

tempColors.forEach(function (color, i) {
    if (!visible[i])
        return;
    let t1 = tempThresholds[i];
    let t2 = tempThresholds[i + 1];

    let text = [];
    if (isFinite(t1))
        text.push(`≥${tempToStr(t1)}℃`)
    if (isFinite(t2))
        text.push(`<${tempToStr(t2)}℃`)
    legend += `<i style="background: ${color}"></i><span>${text.join(', ')}</span><br>`;
});
legend += "</div>";

// LEGEND
let no2Legend = `<div class="card align-self-center"><div class="card-body"><div id="legend">`;
no2Legend += `<div class="scale">`;
no2Legend += `<div id="gradient-bar"></div>`;
no2Legend += `<div class="indicator" style="top: -5px">250</div>`;
no2Legend += `<div class="indicator" style="top: 15px">200</div>`;
no2Legend += `<div class="indicator" style="top: 35px">150</div>`;
no2Legend += `<div class="indicator" style="top: 55px">100</div>`;
no2Legend += `<div class="indicator" style="top: 75px">50</div>`;
no2Legend += `<div class="indicator" style="top: 95px">0</div>`;
no2Legend += `<div class="indicator" style="top: 30px; left: 45px; writing-mode: vertical-rl; transform: rotate(-180deg);">μmol m⁻²</div>`;
no2Legend += `</div></div></div></div>`;



let tilesLayersYears = [2018, 2019, 2020, 2021];

tilesLayersYears.forEach(n => {
    layersList[`no2_${n}`] = {
        layer: L.tileLayer(`${urlPrefix}/no2/tiles/reds/yearly/${n}/{z}/{x}/{y}.png`, {
            name: `NO₂ ${n}`,
            //attribution: '© Copernicus',
            minZoom: 0,
            maxZoom: 10,
            maxNativeZoom: 7,
            opacity: 0.8,
            tms: false,
            ext: 'png'
        }),
        // legend: legend,
        // name: 'NO2 <i class="fa fa-info-circle" title="Average 2021"></i>'
    }

});

let tilesLayersYearsTest = [2021];

tilesLayersYearsTest.forEach(n => {
    layersList[`no2_${n}_test`] = {
        layer: L.tileLayer(`${urlPrefix}/no2/tiles/test/2/{z}/{x}/{y}.png`, {
            name: `NO₂ ${n} Test`,
            //attribution: '© Copernicus',
            minZoom: 0,
            maxZoom: 10,
            maxNativeZoom: 7,
            opacity: 0.6,
            tms: false,
            ext: 'png',
            hidden: true
        }),
        legend: no2Legend,
        name: 'NO2 <i class="fa fa-info-circle" title="Average 2021"></i>'
    }

});


let tilesLayersMonths = [[2018, 5], [2020, 2]];

tilesLayersMonths.forEach(n => {
    layersList[`no2_${n[0]}_${String(n[1]).padStart(2, '0')}`] = {
        layer: L.tileLayer(`${urlPrefix}/no2/tiles/blues/monthly/${n[0]}/${String(n[1]).padStart(2, '0')}/{z}/{x}/{y}.png`, {
            name: `NO₂ ${n[0]}-${String(n[1]).padStart(2, '0')}`,
            //attribution: '© Copernicus',
            minZoom: 0,
            maxZoom: 10,
            maxNativeZoom: 7,
            opacity: 0.8,
            tms: false,
            ext: 'png'
        }),
    }
});


layersList['empty'] = {
    name: 'Disabled',
    hidden: false
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
