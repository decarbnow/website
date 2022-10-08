const baseConfig = require('./webpack.config.base.js');
//const merge = require('webpack-merge');
const { merge } = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        static: 'intro.html',
        host: 'www.localhost',
        allowedHosts: "all",
        open: true,
        liveReload: true
    },
    devtool: 'source-map'
});
