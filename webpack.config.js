const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//const path = require('path');

module.exports = {
    entry: {
        map: './js/map.js',
        start: './js/start.js',
        mapStyle: './style/map.scss',
        startStyle: './style/start.scss',
    },
    module: {
        rules: [{
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader'],
        }, {
            test: /\.(png|jpe?g|gif|ttf|woff|woff2|eot|svg)$/i,
            use: ['file-loader']
        }, {
            test: /\.scss$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader', "sass-loader"],
        }],
    },
    mode: 'development',
    plugins: [
        new CopyWebpackPlugin([
            { from: 'data', to: 'data' }
        ]),
        new MiniCssExtractPlugin({
            filename: '[name].[chunkhash].css'
        }),
        new HtmlWebpackPlugin({
            filename: 'map/index.html',
            chunks: ['map', 'mapStyle'],
            template: 'map.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            chunks: ['start', 'startStyle'],
            template: 'start.html'
        }),
    ],
    output: {
        //path: path.resolve(__dirname, 'map'),
    },
    devServer: {
        historyApiFallback: true,
        open: true,
        liveReload: true
    },
    // performance: {
    //     hints: false,
    // },
    devtool: 'source-map'
};
