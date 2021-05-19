const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const path = require('path')

let config = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: '[name]-latest.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                include: [
                    path.resolve(__dirname, 'node_modules/leaflet-fullscreen/dist'),
                    path.resolve(__dirname, 'node_modules/leaflet-search/dist'),
                    path.resolve(__dirname, 'node_modules/leaflet/dist'),
                    path.resolve(__dirname, 'node_modules/mapbox-gl/dist'),
                    path.resolve(__dirname, 'node_modules/font-awesome/css'),
                    path.resolve(__dirname, 'node_modules/leaflet.locatecontrol/dist')
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: true
                    }
                }],
                include: [
                    path.resolve(__dirname, 'node_modules/leaflet-fullscreen/dist'),
                    path.resolve(__dirname, 'node_modules/leaflet-search/images'),
                    path.resolve(__dirname, 'node_modules/leaflet/dist/images')
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/i,
                use: ['url-loader'],
                include: [
                    path.resolve(__dirname, 'node_modules/font-awesome/fonts')
                ]
            }
        ]
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, 'src')]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ]
}

module.exports = (env, argv) => {
    config.plugins.push(
        new CompressionPlugin({
            filename: argv.mode === 'development' ? '[path].gz' :'[path]',
            test: /\.js$|\.css$|\.html$/,
            algorithm: 'gzip',
            deleteOriginalAssets: false
        })
    )

    if (argv.mode === 'development') {
        config.output.publicPath = '/'
        config.devtool = 'source-map'
        config.devServer = {
            inline: true,
            historyApiFallback: true,
            sockPort: 8080
        }
    }
    if (argv.mode === 'production') {
        config.output.publicPath = './'
        config.optimization = {
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all'
                    }
                }
            }
        }
    }

    return config
}