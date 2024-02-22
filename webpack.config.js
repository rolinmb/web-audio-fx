const path = require("path");
const bundleOutputDir = "./public";

module.exports = {
  entry: {
    main: "./dist/app"
  },
  output: {
    filename: "dist.bundle.js",
    path: path.join(__dirname, bundleOutputDir),
    publicPath: "/"
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
	      exclude: ['/node_modules/']
      }
    ]
  }
};
