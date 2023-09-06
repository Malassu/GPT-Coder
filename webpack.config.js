const prod = process.env.NODE_ENV === 'production';
const webpack = require('webpack')
require('dotenv').config({ path: './.env' }); 

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
  return {
    mode: prod ? 'production' : 'development',
    entry: './src/index.tsx',
    output: {
      path: __dirname + '/dist/',
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
          },
          use: 'ts-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ]
    },
    devtool: prod ? undefined : 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
      }),
      new MiniCssExtractPlugin(),
    ],
  }
};
