/**
 * Created by davidmenger on 08/06/15.
 */
'use strict';

const log = require('../log');
const co = require('co');

class Ensure {

    /**
     * Creates an instance of Ensure.
     *
     * @param {string|Collection} collection (description)
     * @param {Database} database (description)
     */
    constructor (collection, database) {

        if (typeof collection === 'string') {
            collection = database.collection(collection);
        }

        this._ensures = new Map();

        this._collection = collection;

        this._db = database;
    }

    /**
     * (description)
     *
     * @static
     * @param {string|Collection} collection (description)
     * @param {Database} database (description)
     * @returns {Ensure} (description)
     */
    static ensure (collection, database) {
        return new Ensure(collection, database);
    }


    /**
     *
     * @param {object|string} indexDefinition
     * @param {object} [options]
     * @returns {Ensure}
     */
    index (indexDefinition, options) {

        if (typeof options !== 'object') {
            options = {};
        }

        options.name = this._indexName(indexDefinition, options);

        this._ensures.set(options.name, {
            indexDefinition,
            options
        });

        return this;
    }

    /**
     * (description)
     *
     * @returns {Promise} (description)
     */
    writeIndexes () {
        return co(function *() {
            let indexes;
            try {
                indexes = yield this._collection.indexes();
            } catch (err) {
                if (err.code !== 26) { // 26 = no collection
                    log.w(`Can\'t fetch indexes: ${this._collection}`, err);
                    return;
                }
            }

            const map = this._mapExistingIndexesAndDropUnwanted(indexes || []);
            const defs = [];

            for (const name in this._ensures.keys()) {
                if (map.indexOf(name) === -1) {
                    const singleIndexDef = self._createIndexWithDefinition(this._ensures.get(name));
                    defs.push(singleIndexDef);
                }
            }

            yield defs;
            return;
        }.bind(this));
    }

    _createIndexWithDefinition (definition) {
        log.i(`Creating index: ${definition.options.name}`);

        return this._db.createIndex(
            this._collection.collectionName,
            definition.indexDefinition,
            definition.options
        );
    }

    _mapExistingIndexesAndDropUnwanted (res) {
        return res.map((index) => {
            if (!index.name.match(/^_id_?$/) && !this._ensures.has(index.name)) {

                log.i(`Dropping index: ${index.name}`);

                this.db._collection.dropIndex(index.name, (err) => {
                    if (err && !err.message.match(/^index not found/)) {
                        log.e(`Can't drop index: ${index.name}`, err);
                    }
                });
            }
            return index.name;
        });
    }

    /**
     *
     * @param {string|object} fieldOrSpec
     * @param {object} [options]
     * @returns {string}
     * @private
     */
    _indexName (fieldOrSpec, options) {

        if (typeof options === 'object' && options.name) {
            return options.name;
        }

        const indexes = [];
        let keys;

        // Get all the fields accordingly
        if (typeof fieldOrSpec === 'string') {
            // 'type'
            indexes.push(`${fieldOrSpec}_1`);
        } else if (Array.isArray(fieldOrSpec)) {
            fieldOrSpec.forEach((f) => {
                if (typeof f === 'string') {
                    // [{location:'2d'}, 'type']
                    indexes.push(`${f}_1`);
                } else if (Array.isArray(f)) {
                    // [['location', '2d'],['type', 1]]
                    indexes.push(`${f[0]}_${(f[1] || 1)}`);
                } else if (typeof f === 'object') {
                    // [{location:'2d'}, {type:1}]
                    keys = Object.keys(f);
                    keys.forEach((k) => {
                        indexes.push(`${k}_${f[k]}`);
                    });
                }
            });
        } else if (typeof fieldOrSpec === 'object') {
            // {location:'2d', type:1}
            keys = Object.keys(fieldOrSpec);
            keys.forEach((key) => {
                indexes.push(`${key}_${fieldOrSpec[key]}`);
            });
        }

        let name = indexes.join('_');

        if (typeof options !== 'object') {
            return name;
        } else if (options.unique) {
            name += '_uq';
        }
        if (options.sparse) {
            name += '_sp';
        }
        if (options.expireAfterSeconds) {
            name += '_exp';
        }

        return name;
    }
}

module.exports = Ensure;
