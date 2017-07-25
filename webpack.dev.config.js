const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

fs.open('./src/config/env.js', 'w', function (err, fd) {
    const buf = 'export default "development";';
    fs.write(fd, buf, 0, buf.length, 0, function (err, written, buffer){});
});

module.exports = merge(webpackBaseConfig, {
    devtool: '#source-map',
    output: {
        publicPath: '/dist/',
        filename: '[name].js',
        chunkFilename: '[name].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.js'
        }),
        new webpack.ProvidePlugin({
            $: "jquery"
        }),
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: './src/template/index.ejs',
            inject: false
        }),
        new CopyWebpackPlugin([
            // {output}/to/file.txt
            { from: 'src/config/config.js', to: 'config.js' },
            { from: 'src/libs/RongIMLib-dev.js', to: 'RongIMLib.js' },
            { from: 'src/libs/plupload.full.min-2.1.1.js', to: 'plupload.js' },
            { from: 'src/libs/qiniu-1.0.17.js', to: 'qiniu.js' },
        ])
    ]
});