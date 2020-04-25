const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');

module.exports = {
    entry: {
        main: './js/main.js',
        style: './style/main.scss'
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
            filename: 'index.html',
            template: 'map.html'
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'map'),
    },
    // performance: {
    //     hints: false,
    // },
    devtool: 'source-map'
};
