const webpack = require("webpack");
const webpackResolve = require("craco-webpack-resolve");

module.exports = {
  reactScriptsVersion: "react-scripts" /* (default value) */,
  plugins: [
    {
      plugin: webpackResolve,
      options: {
        resolve: {
          fallback: {
            buffer: require.resolve("buffer"),
          },
        },
      },
    },
  ],
  webpack: {
    mode: "extends",
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ]
    },
    configure: {
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: "pre",
            use: ["source-map-loader"],
          },
        ],
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
