'use strict';


module.exports = {

    /**
     * @type {Boolean}
     */
    production: false,

    /**
     * @type {Boolean}
     */
    debugEnabled: true,

    /**
     * [initialize description]
     * @param {String} environment
     */
    initialize (environment) {
        if (!environment) {
            return;
        }
        try {
            const configuration = require(`./config.${environment}`);
            Object.assign(this, configuration);
        } catch (e) {
            console.log(`Failed to log configuration for ENV: ${environment}`);
        }
    }

};
