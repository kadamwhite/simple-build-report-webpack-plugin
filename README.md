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

## Output

This plugin takes Webpack output that may look like this by default:

```txt
webpack --config=test/test-config.js

Webpack Bundle Analyzer saved report to ~/test/build/prod/bundle-analyzer-report.html
Webpack Bundle Analyzer saved stats file to ~/test/build/prod/stats.json
asset prod.a7f2c32d4e157b20cfbf.js 1.36 KiB [emitted] [immutable] [minimized] (name: prod)
asset prod.1fe4a5eb8ea7f8db458d.css 109 bytes [emitted] [immutable] [minimized] (name: prod)
asset production-asset-manifest.json 94 bytes [compared for emit]
Entrypoint prod 1.46 KiB = prod.1fe4a5eb8ea7f8db458d.css 109 bytes prod.a7f2c32d4e157b20cfbf.js 1.36 KiB
orphan modules 3.24 KiB (javascript) 937 bytes (runtime) [orphan] 9 modules
cacheable modules 1.64 KiB (javascript) 138 bytes (css/mini-extract)
  ./test/src/index.js + 1 modules 1.64 KiB [built] [code generated]
  css ./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[0].oneOf[3].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[0].oneOf[3].use[2]!./node_modules/sass-loader/dist/cjs.js??ruleSet[1].rules[0].oneOf[3].use[3]!./test/src/style.scss 138 bytes [built] [code generated]
production-test (webpack 5.72.0) compiled successfully in 987 ms
```

and reformats it to look like this:

```txt
webpack --config=test/test-config.js

Creating an optimized production build...

production-test compiled successfully.
Built 3 assets in 1.072s. File sizes after gzip:

  775 B  prod/prod.a7f2c32d4e157b20cfbf.js
  111 B  prod/prod.1fe4a5eb8ea7f8db458d.css
  production-asset-manifest.json

1 build compiled successfully
```
