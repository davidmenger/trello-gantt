'use strict';

const DEFAULT_OPTIONS = {
    hours: 6,
    weekDays: 3,
    begin: 11
};

module.exports = {

    DEFAULT_WORK_HOURS: DEFAULT_OPTIONS.hours,

    /**
     * @param {Date} date
     * @param {Number} hours
     * @param {Object} [opts]
     * @return {Date}
     */
    addWorkHours (date, hours, opts) {
        let options = DEFAULT_OPTIONS;

        if (opts) {
            options = Object.assign({}, DEFAULT_OPTIONS, opts);
        }

        const day = date.getDay() || 7;
        let addDays = Math.floor(hours / options.hours);

        const hour = date.getHours() + (date.getMinutes() / 60);
        let addHours = hours % options.hours;
        const dayEnd = options.begin + options.hours;
        let addedHourCorrection = false;

        if (addHours + hour > dayEnd) {
            addDays += 1;
            addHours -= options.hours;
            // addHours -= hour - dayEnd;
            addedHourCorrection = true;
        }

        const weeks = Math.floor(addDays / options.weekDays);
        const missDays = addDays % options.weekDays;
        const weekend = (7 - options.weekDays);

        if (missDays + day > options.weekDays) {
            if (day > options.weekDays && addedHourCorrection) {
                addDays += 7 - day;
            } else {
                addDays += weekend;
            }
        }

        addDays += weeks * weekend;
        addHours += addDays * 24;

        return new Date(date.getTime() + (addHours * 3600000));
    }

};
