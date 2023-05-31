// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
    entry: './src/app/index.js',
    output: {
        path: path.resolve(__dirname, '../backend/src_flask_server/flask_bps/templates/static_home/'),
        filename: 'bundle.js'
    },
    devServer: {
        open: true,
        host: 'localhost',
        port: 8091,
        static: {
            directory: path.join(__dirname, "")
        }
    },
    plugins: [
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: { presets: ['@babel/preset-env'] }
                }
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: ["style-loader", "css-loader"]
                
            }
            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = (env, argv) => {
    console.log('----------------------------\n',env,'\n------------------------\n');
    
    if (isProduction) 
        config.mode = 'production'
    else
        config.mode = 'development';
    
    const WSSERVER_H = process.env.WSSERVER_H || env.WSSERVER_H;
    const WSSERVER_P = process.env.WSSERVER_P || env.WSSERVER_P;

    config.plugins = [
        ...config.plugins,
        new webpack.DefinePlugin({
            'process.env': JSON.stringify({
                ...env,
                WSSERVER_H: WSSERVER_H,
                WSSERVER_P: WSSERVER_P
            })
        })
    ];
    
    return config;
};
