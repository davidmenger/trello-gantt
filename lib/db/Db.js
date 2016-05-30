'use strict';

const mongodb = require('mongodb');
const Ensure = require('./Ensure');

class Db {

    /**
     * Creates an instance of Db.
     *
     * @param {object} config (description)
     */
    constructor (config) {
        const configCopy = Object.assign({}, config);

        this._url = config.url;

        delete configCopy.url;

        this._config = config;

        this._db = null;
    }

    /**
     * (description)
     *
     * @returns {Promise} (description)
     */
    connect () {
        return mongodb.MongoClient
            .connect(this._url, this._config)
            .then((db) => {
                this._db = db;
                return this;
            });
    }

    get db () {
        return this._db;
    }

    /**
     * (description)
     *
     * @param {string|Collection} collection (description)
     * @param {Database} [database] (description)
     * @returns {Ensure} for collection
     */
    ensure (collection, database) {
        return Ensure.ensure(collection, database || this.db);
    }
}

module.exports = Db;
