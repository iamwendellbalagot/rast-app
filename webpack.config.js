const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: {
        app: path.resolve(__dirname,'./index.js')
      },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
          {
              test: /\.js?$/,
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader'
              }
          },
          {
            test: /\.(css|scss)$/i,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader'
            ],
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
          },
          
        ]
    },
    plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      favicon: path.resolve(__dirname, './assets/logo.png')
    }),
  ],
}