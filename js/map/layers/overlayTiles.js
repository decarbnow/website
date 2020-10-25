let layersList = {
    temp: {
        layer: L.tileLayer('http://127.0.0.1:8088/layers/temperature/{z}/{x}/{y}.png', {
            attribution: '© CDS',
            minZoom: 0,
            maxZoom: 15,
            maxNativeZoom: 7,
            opacity: 0.3,
            tms: false,
            ext: 'png'
        }),
        name: 'Temp'
    },
    // mapnik: {
    //     layer: L.tileLayer('http://127.0.0.1:8088/layers/output/{z}/{x}/{y}.png', {
    //         attribution: '© CDS',
    //         minZoom: 1,
    //         maxZoom: 12,
    //         maxNativeZoom: 4,
    //         //opacity: 0.5,
    //         tms: false,
    //         ext: 'png'
    //     }),
    //     name: 'mapnik'
    // },
};

export default {
    style: {},
    list: layersList
}
