const baseConfig = require('./webpack.config.base.js');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        open: true,
        liveReload: true
    },
    // performance: {
    //     hints: false,
    // },
    devtool: 'source-map'
});
