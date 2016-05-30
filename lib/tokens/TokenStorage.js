'use strict';

const COLLECTION_NAME = 'tokens';

class TokenStorage {

    /**
     * Creates an instance of TokenStorage.
     *
     * @param {Db} db (description)
     */
    constructor (db) {

        this.db = db;

        this.collection = null;
    }

    /**
     * (description)
     *
     * @returns {Promise} (description)
     */
    init () {
        this.collection = this.db.db.collection(COLLECTION_NAME);

        return this.db.ensure(this.collection, this.db)
            .index({ token: 1 }, { unique: true })
            .writeIndexes();
    }

    /**
     * (description)
     *
     * @param {Object} token (description)
     * @returns {Promise} (description)
     */
    saveToken (token) {
        return this.collection.insertOne(token);
    }

    /**
     * (description)
     *
     * @param token (description)
     * @returns {Promise} (description)
     */
    getToken (token) {
        return this.collection.find({ token })
            .limit(1)
            .next();
    }

}

module.exports = TokenStorage;
