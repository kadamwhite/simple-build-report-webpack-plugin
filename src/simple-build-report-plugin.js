const chalk = require( 'chalk' );
const formatWebpackMessages = require( '../vendor/formatWebpackMessages' );
const {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
} = require( './FileSizeReporter' );
const msToS = require( './ms-to-s' );
const logOnce = require( './log-once' );

const pluginName = 'simple-build-report-webpack-plugin';

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const buildResults = [];

/**
 * A webpack plugin which takes over stats output and renders a human-oriented
 * summary of the build using logic adapted from react-dev-utils.
 */
class SimpleBuildReportPlugin {

  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply( compiler ) {

    logOnce( 'Creating an optimized production build...\n' );

    compiler.hooks.beforeCompile.tapPromise( pluginName, async () => {
      try {
        this.previousFileSizes = await measureFileSizesBeforeBuild( compiler.outputPath );
      } catch ( err ) {
        // An error means the output directory does not yet exist.
        // The build may not have been run yet, or it was deleted outside Webpack.
        this.previousFileSizes = {
          root: compiler.outputPath,
          sizes: {}
        };
      }

      // This is a coup. We are taking over stats output.
      // eslint-disable-next-line require-atomic-updates
      compiler.options.stats = 'none';
    } );

    compiler.hooks.done.tap( pluginName, ( stats ) => {
      console.log();

      const buildStats = stats.toJson( {
        all: true,
        warnings: true,
        errors: true,
      } );
      const { assets, time } = buildStats;

      const messages = formatWebpackMessages( buildStats );

      if ( messages.errors.length ) {
        if ( compiler.name ) {
          console.log( `${
            chalk.bold( chalk.red( compiler.name ) )
          } errored in ${ msToS( time ) }s.` );
        } else {
          console.log( `Build errored in ${ msToS( time ) }s` );
        }
        console.log( `${
          assets.reduce( ( count, { emitted } ) => count + ( emitted ? 1 : 0 ), 0 )
        } of ${ assets.length } assets emitted.` );
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        console.log( messages.errors[ 0 ] );

        buildResults.push( {
          name: compiler.name,
          success: false,
          warnings: ! ! messages.warnings.length,
          time,
        } );

        return;
      }

      const buildCompleteMessage = `Built ${
        assets.length
      } assets in ${
        msToS( time )
      }s. File sizes after gzip:\n`;
      if ( compiler.name ) {
        console.log( `${ chalk.bold( chalk.green( compiler.name ) ) } compiled successfully.\n${ buildCompleteMessage }` );
      } else {
        console.log( `Compiled successfully.\n${ buildCompleteMessage }` );
      }

      printFileSizesAfterBuild(
        stats,
        this.previousFileSizes,
        compiler.outputPath,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      );

      assets
        .filter( asset => ! ( /\.(js|css)$/ ).test( asset.name ) )
        .forEach( asset => {
          console.log( `  ${ chalk.dim( asset.name ) }` );
        } );

      if ( messages.warnings.length ) {
        console.log();
        console.log( chalk.yellow( 'Compiled with warnings.\n' ) );
        console.log( messages.warnings.join( '\n\n' ) );
        console.log( `\nSearch for the ${
          chalk.underline( chalk.yellow( 'keywords' ) )
        } to learn more about each warning.` );
        console.log( `To ignore, add ${
          chalk.cyan( '// eslint-disable-next-line' )
        } to the line before.\n` );
      }

      buildResults.push( {
        name: compiler.name,
        success: true,
        warnings: ! ! messages.warnings.length,
        time,
      } );
    } );

    compiler.hooks.shutdown.tap( pluginName, () => {
      let message = '';
      if ( buildResults.length === 1 ) {
        message = `Build ${
          buildResults[ 0 ].success ? chalk.green( 'completed' ) : chalk.red( 'errored' )
        } in ${ msToS( buildResults[ 0 ].time ) }`;
      } else {
        const successCount = buildResults.reduce( ( sum, { success } ) => sum + ( success ? 1 : 0 ), 0 );
        const errorCount = buildResults.length - successCount;
        if ( successCount ) {
          message = chalk.green( `${ successCount } builds compiled successfully` );
        }
        if ( successCount && errorCount ) {
          message = `${ message } and `;
        }
        if ( errorCount ) {
          message = `${ message }${ chalk.red( `${ errorCount } builds errored.` ) }`;
        }
      }
      logOnce( `\n${ message }\n` );
    } );
  }
}

module.exports = SimpleBuildReportPlugin;
