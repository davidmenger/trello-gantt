'use strict';

const crypto = require('crypto');

/**
 * (description)
 *
 * @class Token
 */
class Token {

    /**
     * Creates an instance of Token.
     *
     * @param fromObject (description)
     */
    constructor (fromObject) {
        if (fromObject instanceof Object) {
            Object.assign(this, fromObject);
            return;
        }

        /**
         * @type {string}
         */
        this.token = null;

        /**
         * @type {Object|null}
         */
        this.meta = null;
    }

    /**
     * (description)
     *
     * @static
     * @param {Object} [meta] (description)
     * @returns {Promise.<Token>} (description)
     */
    static create (meta) {
        const ret = new Token();

        ret.meta = meta || null;

        return new Promise((resolve, reject) => {
            crypto.randomBytes(256, (err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    ret.token = buffer.toString('hex');
                    resolve(ret);
                }
            });
        });
    }
}

module.exports = Token;
