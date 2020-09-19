let layersList = {
    satellite: {
        layer: L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            attribution: '© <a href="https://maps.google.com">Google Maps</a>, '+
                             '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                             '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                             '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        }),
        name: 'Satellite'
    },
    streets: {
        layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, '+
                             '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                             '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                             '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
            maxZoom: 20,
            ext: 'png'
        }),
        name: 'Streets'
    },
    light: {
        layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, '+
                             '© <a href="https://carto.com/attribution">CARTO</a>, '+
                             '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                             '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                             '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        }),
        name: 'Light'
    },
    sentinal: {
        layer: L.tileLayer(`https://tile.sentinelmap.eu/2016/summer/rgb/{z}/{x}/{y}.jpg?key=${__KEYS__['sentinalmap']}`, {
            attribution: 'Modified <a href="https://scihub.copernicus.eu/">Copernicus</a>' +
        	  ' Sentinel data 2016 by ' +
        	  '<a href="https://www.sentinelmap.eu">SentinelMap</a>',
            minZoom: 5,
            maxZoom: 14
        }),
        name: 'Sentinal 2 (2016)'
    },
};

export default {
    style: {},
    list: layersList
}
