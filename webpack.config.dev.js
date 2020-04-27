const baseConfig = require('./webpack.config.base.js');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'development',
    devServer: {
        historyApiFallback: {
            rewrites: [
                { from: /^\/map/, to: '/map/index.html' },
            ]
        },
        open: true,
        liveReload: true
    },
    // performance: {
    //     hints: false,
    // },
    devtool: 'source-map'
});
