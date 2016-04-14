'use strict';

const Db = require('Db');
const config = require('../../config');

module.export = new Db(config.db);
