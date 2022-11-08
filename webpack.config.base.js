const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-remove-empty-scripts');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const config = require('./config.json')

module.exports = {
    entry: {
        map: './js/map.js',
        intro: './js/intro.js',
        mapStyle: './style/map.scss',
        introStyle: './style/intro.scss',
    },
    module: {
        rules: [{
            test: /\.html$/i,
            loader: 'html-loader',
        }, {
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
    plugins: [
        new FaviconsWebpackPlugin(),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'static', to: 'static' }
            ],
        }),
        new FixStyleOnlyEntriesPlugin({ ignore: 'webpack-dev-server' }),
        new MiniCssExtractPlugin({
            filename: '[name].[chunkhash].css'
        }),
        new HtmlWebpackPlugin({
            filename: 'map.html',
            chunks: ['map', 'mapStyle'],
            template: 'map.ejs',
            environment: config
        }),
        new HtmlWebpackPlugin({
            filename: 'intro.html',
            chunks: ['intro', 'introStyle'],
            template: 'intro.ejs'
        }),
        new webpack.DefinePlugin({
            __BACKEND__: JSON.stringify(config.backend),
            __DATA__: JSON.stringify(config.data.list[config.data.default]),
            __URL__: JSON.stringify(config.url),
            __KEYS__: JSON.stringify(config.keys)
        })
    ],
    output: {
        publicPath: '/'
    }
};
