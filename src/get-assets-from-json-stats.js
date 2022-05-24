/**
 * Reducer function for use converting stats.toJson() output into a full array
 * of all included assets.
 *
 * @param {Object[]} carry Array of all actual assets.
 * @param {Object}   asset Asset or meta-asset object.
 * @returns {Object[]} Reducer carry array.
 */
const recursivelyReduceAssets = ( carry, asset ) => {
  if ( asset.type !== 'asset' && asset.children ) {
    return carry.concat( asset.children.reduce( recursivelyReduceAssets, [] ) );
  }
  return carry.concat( [ asset ] );
};

/**
 * Traverse the assets list from stats.toJson() output to build a flat list
 * of all generated assets.
 *
 * @param {Object} stats Output from Webpack stats.toJson() function.
 * @returns {Object[]} Array of asset objects.
 */
const getAssetsFromJsonStats = ( stats ) => stats.assets
  .reduce( recursivelyReduceAssets, [] );

module.exports = getAssetsFromJsonStats;
