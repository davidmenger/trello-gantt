'use strict';

const ESTIMATE_REGEX = /\[([0-9]+([.,][0-9]+)?)([mhd])\]/i;
const DEFAULT_HOURS_PER_DAY = 8;

/**
 * parses [1.5d], [5,7h], [1m] (days, hours minutes)
 * @return {number} hours
 */
module.exports = function parseEstimate (string, hoursPerDay) {
    const matched = string.match(ESTIMATE_REGEX);
    if (matched === null) {
        return 0;
    }
    const num = parseFloat(matched[1].replace(/,/, '.'));
    switch (matched[3].toLowerCase()) {
    case 'm':
        return Math.round(num / 6) / 10;
    case 'd':
        return num * (hoursPerDay || DEFAULT_HOURS_PER_DAY);
    case 'h':
    default:
        return num;
    }
};

