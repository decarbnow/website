const baseConfig = require('./webpack.config.base.js');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        index: 'intro.html',
        host: 'www.localhost',
        disableHostCheck: true,
        open: true,
        liveReload: true
    },
    devtool: 'source-map'
});
