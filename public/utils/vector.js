'use strict';

const DAY_MICROSECONDS = 86400000;

module.exports = {

    /**
     * Returns configuration
     * @param {Date} from
     * @param {Till} till
     * @param {Number} scale
     * @param {Boolean} [round]
     * @return {[type]}
     */
    makeMatrix (from, till, dayPix, round) {
        const begin = from.getTime();
        const end = till.getTime();
        const diff = Math.abs(begin - end);
        const scale = diff / DAY_MICROSECONDS * (dayPix || 10);
        return {
            offset: Math.min(begin, end),
            koef: scale / diff,
            round: round || round === void 0
        };
    },

    /**
     * [position description]
     * @param {Date} date
     * @param {Object} matrix
     * @return {Number}
     */
    position (date, matrix) {
        const res = (date.getTime() - matrix.offset) * matrix.koef;
        if (matrix.round) {
            return Math.round(res);
        }
        return res;
    },

    width (start, end, matrix) {
        const diff = Math.abs(start.getTime() - end.getTime());
        if (matrix.round) {
            return Math.round(diff * matrix.koef);
        }
        return diff * matrix.koef;
    }

};
