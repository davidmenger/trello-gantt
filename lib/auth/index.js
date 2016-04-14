'use strict';

const OauthOne = require('./OauthOne.js');
const config = require('../../config');

module.exports = new OauthOne(config.oauth);
