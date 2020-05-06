"use strict";

/**
 * @class
 * @description - A standard utility class to expose functions similar to the lodash library
 */
class Utils {
    /**
     * 
     * Function which checks whether a given value is a valid string or not.
     * 
     * @param {*} value - Input value which needs to be checked for string validity.
     * 
     * @returns {Boolean} Returns a boolean value based on whether the input value is a string or not.
     */
    static isValidString(value) {
        return (typeof (value) === 'string' || value instanceof String);
    }

    /**
     * 
     * Function which checks whether a given value is null or undefined.
     * 
     * @param {*} value - Input value which needs to be checked
     * 
     * @returns {Boolean} Returns a boolean value based on whether the input value is null/undefined or not.
     */
    static isNil(value) {
        return (value === null || value === undefined);
    }
}

module.exports = Utils;