# Simple Build Report Webpack Plugin

This Webpack plugin bundles the `FileSizeReport` and `formatWebpackMessages` modules extracted from `react-dev-utils`, and packages them as a single plugin which can be used to instruct your webpack build to skip its normal `stats` output and log console output in a more human-oriented fashion.

Installation:

```sh
npm install --save-dev simple-build-report-webpack-plugin
```

Example usage:

```js
const SimpleBuildReportPlugin = require( 'simple-build-report-webpack-plugin' );

// Within your webpack configuration:
module.exports = {
  plugins: [
    new SimpleBuildReportPlugin(),
  ],
};
```

The plugin does not take any options.
