import webpackConfig from './webpack.core.babel.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
//require("./src/main/css/leaflet.css");
//require("./src/main/css/line_chart.css");

//var CORE = path.resolve(__dirname, './src/main/css/core.css');
//var LEAF = path.resolve(__dirname, './src/main/css/leaflet.css');
//var LINE = path.resolve(__dirname, './src/main/css/line_chart.css');

export default Object.assign({}, webpackConfig, {
  entry: {
    main : './src/main/main.js'
  },
  output: {
    path: "./dist/main/",
    filename: "[name].bundle.js"
  },
  plugins: [
    ...webpackConfig.plugins,
    new HtmlWebpackPlugin({
      title: 'Yelp Help',
      template: './src/main/index.ejs',
      appMountIds: ['header', 'app', 'footer']
    })
  ]
});
