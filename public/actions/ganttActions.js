'use strict';

const consts = require('../consts');

module.exports = {
    trelloResponse (data) {
        return { type: consts.TRELLO_RESPONSE, data };
    }
};
