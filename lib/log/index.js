'use strict';

/**
 * It's good to override logging
 * @type {Object}
 */
module.exports = {

    /**
     * Log infos
     */
    i () {
        console.info.apply(this, arguments);
    },

    /**
     * Just log
     */
    log () {
        console.log.apply(this, arguments);
    },

    /**
     * Log errors
     */
    e () {
        console.error.apply(this, arguments);
    }
};
