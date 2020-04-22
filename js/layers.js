let SatelliteMap = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
	attribution: '© <a href="https://maps.google.com">Google Maps</a>, '+ 
                     '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                     '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                     '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
	maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

let LightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
	attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, '+
        			 '© <a href="https://carto.com/attribution">CARTO</a>, '+
                     '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                     '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                     '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
	maxZoom: 20, 
	subdomains:['mt0','mt1','mt2','mt3']
});

let StreetsMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, '+ 
                     '<a href="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary?keywords=omi">NASA</a>, '+
                     '<a href="https://earth.esa.int/web/guest/missions/esa-eo-missions/sentinel-5p">ESA/Copernicus</a>, '+
                     '<a href="https://github.com/wri/global-power-plant-database">WRI</a>',
	maxZoom: 20,
	ext: 'png'
});

export default {
    Satellite: SatelliteMap,
    Streets: StreetsMap,
    Light: LightMap
};