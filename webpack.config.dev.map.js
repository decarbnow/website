const baseConfig = require('./webpack.config.base.js');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        index: 'map.html',
        host: 'map.localhost',
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: '/map.html' },
            ]
        },
        disableHostCheck: true,
        open: true,
        liveReload: true
    },
    devtool: 'source-map'
});
