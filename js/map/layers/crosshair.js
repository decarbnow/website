let layersList = {
    'crosshair': {
        name: "crosshair",
        interactive: false,
        attr: {
            style: {
                color: '#6600ff'
            },
            pointToLayer: function(feature, latlng) {
                return new L.marker(latlng, {interactive:false});
            }
        }
    },
    // 'tweetsProd': {
    //     name: "Tweets (Prod)",
    // },
    // 'tweetsDev': {
    //     name: "Tweets (Dev)",
    // },
};

export default {
    style: {},
    list: layersList
}
