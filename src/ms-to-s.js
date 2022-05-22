/**
 * Output a milliseconds count as a decimal seconds value.
 *
 * @param {Number} ms Milliseconds.
 * @returns {Number} Seconds.
 */
const msToS = ( ms ) => ( ms / 1000 ).toFixed( 3 ).replace( /0+$/, '' );

module.exports = msToS;
