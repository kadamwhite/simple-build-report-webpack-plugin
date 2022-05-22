const logged = {};

/**
 * Log a message and know that this particular message will only be logged once.
 *
 * @param {string} message Message to log.
 */
const logOnce = ( message ) => {
  if ( ! logged[ message ] ) {
    console.log( message );
    logged[ message ] = true;
  }
};

module.exports = logOnce;
