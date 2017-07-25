const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
const fs = require('fs');
var CopyWebpackPlugin = require('copy-webpack-plugin');

fs.open('./src/config/env.js', 'w', function (err, fd) {
    const buf = 'export default "production";';
    fs.write(fd, buf, 0, buf.length, 0, function (err, written, buffer){});
});

module.exports = merge(webpackBaseConfig, {
    devtool: '#source-map',
    output: {
        publicPath: '/smp_imweb/dist/',
        filename: '[name].[hash].js',
        chunkFilename: '[name].[hash].chunk.js'
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].[hash].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'vendors.[hash].js'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new CopyWebpackPlugin([
            // {output}/to/file.txt
            { from: 'src/config/config.js', to: 'config.js' },
            { from: 'src/libs/RongIMLib-dev.js', to: 'RongIMLib.js' },
            { from: 'src/libs/plupload.full.min-2.1.1.js', to: 'plupload.js' },
            { from: 'src/libs/qiniu-1.0.17.js', to: 'qiniu.js' },
        ]),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,//生成sourcemap
            compress: {
                warnings: false
            }
        }),
        new webpack.ProvidePlugin({
            $: "jquery"
        }),
        new HtmlWebpackPlugin({
            filename: '../index.jsp',
            template: './src/template/index.ejs',
            inject: false
        })
    ]
});