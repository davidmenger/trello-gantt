'use strict';

const mongodb = require('mongodb');

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

    connect () {
        mongodb.MongoClient
            .connect(this._url, this._config)
            .then((db) => {
                this._db = db;
            });
    }

    get db () {
        return this._db;
    }

}

module.exports = Db;
