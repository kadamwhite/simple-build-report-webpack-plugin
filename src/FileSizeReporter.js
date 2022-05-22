/**
 * Adapted from source code copyright (c) 2015-present, Facebook, Inc,
 * and licensed under the MIT license. Compare to original in vendor/.
 *
 * These ESLint rules acknowledge and maintain the style of the adopted code.
 */
/* eslint-disable func-style */
/* eslint-disable id-length */
/* eslint-disable max-params */
/* eslint-disable no-negated-condition */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-reflect */
/* eslint-disable require-jsdoc */
/* eslint-disable strict */
/* eslint-disable object-property-newline */

'use strict';

let fs = require( 'fs' );
let path = require( 'path' );
let chalk = require( 'chalk' );
let filesize = require( 'filesize' );
let recursive = require( 'recursive-readdir' );
let stripAnsi = require( 'strip-ansi' );
let gzipSize = require( 'gzip-size' ).sync;

function canReadAsset( asset ) {
  return (
    ( /\.(js|css)$/ ).test( asset ) &&
    !( /service-worker\.js/ ).test( asset ) &&
    !( /precache-manifest\.[0-9a-f]+\.js/ ).test( asset )
  );
}

// Prints a detailed summary of build files.
function printFileSizesAfterBuild(
  webpackStats,
  previousSizeMap,
  buildFolder,
  maxBundleGzipSize,
  maxChunkGzipSize
) {
  let { root } = previousSizeMap;
  let { sizes } = previousSizeMap;
  let assets = ( webpackStats.stats || [ webpackStats ] )
    .map( stats => stats
      .toJson( { all: true, assets: true } )
      .assets.filter( asset => canReadAsset( asset.name ) )
      .filter( asset => {
        // Filter out files which did not get emitted due to build errors.
        try {
          fs.accessSync( path.join( root, asset.name ) );
          return true;
        } catch ( e ) {
          return false;
        }
      } )
      .map( asset => {
        let fileContents = fs.readFileSync( path.join( root, asset.name ) );
        let size = gzipSize( fileContents );
        let previousSize = sizes[ removeFileNameHash( root, asset.name ) ];
        let difference = getDifferenceLabel( size, previousSize );
        return {
          folder: path.join(
            path.basename( buildFolder ),
            path.dirname( asset.name )
          ),
          name: path.basename( asset.name ),
          size,
          sizeLabel:
              filesize( size ) + ( difference ? ` (${ difference })` : '' ),
        };
      } ) )
    .reduce( ( single, all ) => all.concat( single ), [] );
  assets.sort( ( a, b ) => b.size - a.size );
  let longestSizeLabelLength = Math.max.apply(
    null,
    assets.map( a => stripAnsi( a.sizeLabel ).length )
  );
  let suggestBundleSplitting = false;
  assets.forEach( asset => {
    let { sizeLabel } = asset;
    let sizeLength = stripAnsi( sizeLabel ).length;
    if ( sizeLength < longestSizeLabelLength ) {
      let rightPadding = ' '.repeat( longestSizeLabelLength - sizeLength );
      sizeLabel += rightPadding;
    }
    let isMainBundle = asset.name.indexOf( 'main.' ) === 0;
    let maxRecommendedSize = isMainBundle ?
      maxBundleGzipSize :
      maxChunkGzipSize;
    let isLarge = maxRecommendedSize && asset.size > maxRecommendedSize;
    if ( isLarge && path.extname( asset.name ) === '.js' ) {
      suggestBundleSplitting = true;
    }
    console.log( `  ${
      isLarge ? chalk.yellow( sizeLabel ) : sizeLabel
    }  ${
      chalk.dim( asset.folder + path.sep )
    }${ chalk.cyan( asset.name ) }` );
  } );
  if ( suggestBundleSplitting ) {
    console.log();
    console.log( chalk.yellow( 'The bundle size is significantly larger than recommended.' ) );
    console.log( chalk.yellow( 'Consider reducing it with code splitting: https://create-react-app.dev/docs/code-splitting/' ) );
    console.log( chalk.yellow( 'You can also analyze the project dependencies: https://create-react-app.dev/docs/analyzing-the-bundle-size/' ) );
  }
}

function removeFileNameHash( buildFolder, fileName ) {
  return fileName
    .replace( buildFolder, '' )
    .replace( /\\/g, '/' )
    .replace(
      /\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/,
      ( match, p1, p2, p3, p4 ) => p1 + p4
    );
}

// Input: 1024, 2048
// Output: "(+1 KB)"
function getDifferenceLabel( currentSize, previousSize ) {
  let FIFTY_KILOBYTES = 1024 * 50;
  let difference = currentSize - previousSize;
  let fileSize = !Number.isNaN( difference ) ? filesize( difference ) : 0;
  if ( difference >= FIFTY_KILOBYTES ) {
    return chalk.red( `+${ fileSize }` );
  } else if ( difference < FIFTY_KILOBYTES && difference > 0 ) {
    return chalk.yellow( `+${ fileSize }` );
  } else if ( difference < 0 ) {
    return chalk.green( fileSize );
  }
  return '';

}

function measureFileSizesBeforeBuild( buildFolder ) {
  return new Promise( resolve => {
    recursive( buildFolder, ( err, fileNames ) => {
      let sizes;
      if ( !err && fileNames ) {
        sizes = fileNames.filter( canReadAsset ).reduce( ( memo, fileName ) => {
          let contents = fs.readFileSync( fileName );
          let key = removeFileNameHash( buildFolder, fileName );
          memo[ key ] = gzipSize( contents );
          return memo;
        }, {} );
      }
      resolve( {
        root: buildFolder,
        sizes: sizes || {},
      } );
    } );
  } );
}

module.exports = {
  measureFileSizesBeforeBuild,
  printFileSizesAfterBuild,
};
