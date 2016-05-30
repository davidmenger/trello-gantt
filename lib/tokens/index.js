'use strict';

const TokenStorage = require('./TokenStorage');
const Token = require('./Token');

module.exports = {

    /**
     * @type {TokenStorage}
     */
    _tokenStorage: null, // TokenStorage

    init (db) {
        this._tokenStorage = new TokenStorage(db);

        return this._tokenStorage.init();
    },

    /**
     * (description)
     *
     * @param {Object} [meta] (description)
     * @returns {Generator.<Token>} (description)
     */
    *createToken (meta) {
        const token = yield Token.create(meta);

        yield this._tokenStorage.saveToken(token);

        return token;
    },

    /**
     * (description)
     *
     * @param token (description)
     * @returns {Generator.<Token>} (description)
     */
    *getToken (token) {
        const obj = yield this._tokenStorage.getToken(token);

        return new Token(obj);
    }

};
