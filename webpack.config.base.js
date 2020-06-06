const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const config = require('./config.json')

//const path = require('path');



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
                { from: 'data', to: 'data' }
            ],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[chunkhash].css'
        }),
        new FixStyleOnlyEntriesPlugin(),
        new HtmlWebpackPlugin({
            filename: 'map.html',
            chunks: ['map', 'mapStyle'],
            template: 'map.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'intro.html',
            chunks: ['intro', 'introStyle'],
            template: 'intro.html'
        }),
        new webpack.DefinePlugin({
            __BACKEND__: JSON.stringify(config.backend)
        })
    ],
    output: {
        publicPath: '/'
    }
};
