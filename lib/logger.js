"use strict";

/**
 * @module
 * @name Logger
 * @description Module which returns a singleton object of our custom logger class.
 */

const moment = require('moment');
const util = require('util');
const Console = require('console').Console;

/**
 * @class
 * @extends Console
 */
class Logger extends Console {
    /**
     * 
     * Constructor for our Logger class. It is meant to act as a custom logger extended from node's built-in Console class which provides logging functions like console.log(), console.warn(), console.error(), etc. 
     * 
     * Since util.log() method has been deprecated as of Node's version 8.x, and the Console class, by default, doesn't append the timestamp, the logger overrides the existing functions and provides its custom logging function with current timestamp support. This class may be further extended to include various logging levels, etc.
     * 
     * It expects following input parameters:
     * 
     * @param {*} stdout - The default output stream where our logs would be piped to. Ex : A file stream, or process.stdout.
     * @param {*} stderr - The error stream where our error logs logged by console.error, etc would get piped to. If not passed, by default stdout would be used. Ex : A file stream, or process.stderr.
     * @param  {...any} otherArgs - Any other args which needs to be passed to parent class' constructor
     */
    constructor(stdout, stderr, ...otherArgs) {
        super(stdout, stderr, ...otherArgs);
    }

    /**
     * Function which overrides the existing .log() function to include the current timestamp in util.log() format. It expects following parameters :
     * @param  {...any} args - Any number of arguments which may be passed for logging purposes, and are passed through util.format
     */
    log(...args) {
        super.log(moment().format('D MMM HH:mm:ss'), '-', util.format(...args));
    }

    /**
     * Function which overrides the existing .error() function to include the current timestamp in util.error format. It expects following parameters :
     * @param  {...any} args - Any number of arguments which may be passed for logging purposes, and are passed through util.format()
     */
    error(...args) {
        super.error(moment().format('D MMM HH:mm:ss'), '-', util.format(...args));
    }
}

module.exports = (function () {
    //Currently returning a singleton object of this class with piping to process.stdout and process.stderr streams. This behaviour can be changed in case the logs needs to be piped to a specific file or folder thus providing better segregating and logging capablitites.
    return new Logger(process.stdout, process.stderr);
}());