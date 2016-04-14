'use strict';

const config = require('./config');

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
        Object.assign(this, config);
        try {
            const configuration = require(`./config.${environment}`);
            Object.assign(this, configuration);
        } catch (e) {
            console.log(`Failed to log configuration for ENV: ${environment}`);
        }
    }

};
