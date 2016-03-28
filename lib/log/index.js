'use strict';

/**
 * It's good to override logging
 * @type {Object}
 */
module.exports = {

    /**
     * Log infos
     */
    i (...args) {
        console.info.apply(this, args);
    },

    /**
     * Just log
     */
    log (...args) {
        console.log.apply(this, args);
    },

    /**
     * Log errors
     */
    e (...args) {
        console.error.apply(this, args);
    }
};
