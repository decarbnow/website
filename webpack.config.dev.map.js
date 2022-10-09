const baseConfig = require('./webpack.config.base.js');
const { merge } = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        static: 'map.html',
        host: 'map.localhost',
        //host: '0.0.0.0',
        historyApiFallback: {
            rewrites: [
                { from: /.*/, to: '/map.html' },
            ]
        },
        allowedHosts: "all",
        open: true,
        liveReload: true
    },
    optimization: {
        runtimeChunk: 'single'
    },
    devtool: 'source-map'
});
