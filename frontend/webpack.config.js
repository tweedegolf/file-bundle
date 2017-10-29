const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: [
        './index.js',
    ],
    output: {
        path: path.resolve(__dirname, 'build/scripts'),
        filename: 'file-bundle.js',
    },
    context: path.resolve(__dirname, 'src/js'),
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src/js'),
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'src/js'),
            'node_modules',
        ],
        extensions: ['.js', '.jsx'],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                dead_code: true,
                warnings: false,
                drop_console: true
            }
        })
    ],
};
