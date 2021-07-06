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
        name: 'Google Satellite'
    },
    esri: {
        layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© <a href="http://www.esri.com/">Esri</a>, '+
                             'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community, '+
                             '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                             '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                             '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
            maxZoom: 20,
        }),
        name: 'Esri Satellite'
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
    terrain: {
        layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service, '+
                           '© <a href="https://carto.com/attribution">CARTO</a>, '+
                           '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                           '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                           '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        }),
        name: 'Terrain'
    },
    dark: {
        layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
          attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service, '+
                           '© <a href="https://carto.com/attribution">CARTO</a>, '+
                           '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                           '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                           '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        }),
        name: 'Dark'
    },
    // sentinalmap16: {
    //     layer: L.tileLayer(`https://tile.sentinelmap.eu/2016/summer/rgb/{z}/{x}/{y}.jpg?key=${__KEYS__['sentinalmap']}`, {
    //         attribution: 'Modified <a href="https://scihub.copernicus.eu/">Copernicus</a>' +
    //     	   ' Sentinel data 2016 by ' +
    //     	   '<a href="https://www.sentinelmap.eu">SentinelMap</a>',
    //         minZoom: 5,
    //         maxZoom: 14
    //     }),
    //     name: 'Sentinal (2016, SentinelMap)'
    // },
    s2maps20: {
        layer: L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg', {
            attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2020)',
            maxZoom: 20
        }),
        name: 'Sentinel-2 (2020, EOX)'
    },
    s2maps19: {
        layer: L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2019_3857/default/g/{z}/{y}/{x}.jpg', {
            attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2019)',
            maxZoom: 20
        }),
        name: 'Sentinel-2 (2019, EOX)'
    },
    s2maps18: {
        layer: L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{y}/{x}.jpg', {
            attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2018 &amp; 2017)',
            maxZoom: 20
        }),
        name: 'Sentinel-2 (2018, EOX)'
    },
    s2maps17: {
        layer: L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2017_3857/default/g/{z}/{y}/{x}.jpg', {
            attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2017)',
            maxZoom: 20
        }),
        name: 'Sentinel-2 (2017, EOX)'
    },
    s2maps16: {
        layer: L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg', {
            attribution: '<a href="https://s2maps.eu">Sentinel-2 cloudless - https://s2maps.eu</a> by <a href="https://eox.at">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2016 &amp; 2017)',
            maxZoom: 20
        }),
        name: 'Sentinel-2 (2016, EOX)'
    },
    empty: {
        name: 'Disabled'
    }
};

export default {
    style: {},
    list: layersList
}
