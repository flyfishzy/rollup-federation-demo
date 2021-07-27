const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { ModuleFederationPlugin } = require("webpack").container;
module.exports = (env = {}) => ({
  mode: "development",
  cache: false,
  devtool: "source-map",
  optimization: {
    minimize: false,
  },
  target: "web",
  entry: path.resolve(__dirname, "./src/main.js"),
  output: {
    publicPath: "auto",
    module: true,
    environment: { module: true }
  },
  experiments: {
    outputModule: true
  },
  resolve: {
    extensions: [".vue", ".jsx", ".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.png$/,
        use: {
          loader: "url-loader",
          options: { limit: 8192 },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new ModuleFederationPlugin({
      name: "layout",
      filename: "remoteEntry.js",
      remotes: {
        remote_app: "http://localhost:8081/remoteEntry.js",
      },
      remoteType: "module",
      exposes: {},
    }),
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname, "./index.html"),
    //   chunks: ["main"],
    // }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: 'index.html' }]
    })
  ],
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    port: 3001,
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
});
