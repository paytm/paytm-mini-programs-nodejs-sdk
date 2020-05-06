"use strict";

const requestPromise = require('request-promise');
const debug = require('debug')('miniapps.node.clients.base');
const uuid = require('uuid');
const L = require('../lib').logger;
const LibUtils = require('../lib').utils;

/**
 * @class
 */
class Base {
    /**
     * 
     * Constructor for our base client class. This class is used to act as a base layer for all HTTP calls. It uses the request promise module to achieve the same. This class is primaraly meant to act as a base class which can be further extended to build clients for third party APIs.
     * 
     * @param {Object} options - Following parameters are supported and can be passed as options :
     * @param {String} options.ENDPOINT - Hostname / Endpoint for all our client requests
     * @param {Number} [options.TIMEOUT = 20000] - Request timeout (in milliseconds)
     * @param {String} [options.CLIENT_NAME = 'BASE-CLIENT'] - Name of our client
     * @param {String} [options.LOGTAG = '[clients/base]'] - Tag for logging purposes
     * 
     * @throws {Error} Please note that some input parameters for this class are mandatory and hence 
     * is being validated within the constructor. Hence it is advised to wrap the object creation for 
     * this class in a try catch block to catch any synchronous errors being thrown from while creating 
     * this object.
     * 
     */
    constructor({
        ENDPOINT,
        TIMEOUT = 20 * 1000,
        CLIENT_NAME = 'BASE-CLIENT',
        LOGTAG = '[clients/base]',
    } = {}) {
        this.LOGTAG = LOGTAG;
        if (!LibUtils.isValidString(ENDPOINT)) {
            const err = new TypeError(`Provided endpoint : ${ENDPOINT} is of invalid type`);
            debug(`${this.LOGTAG} : Error :`, err);
            throw err;
        }

        this.ENDPOINT = ENDPOINT;
        this.TIMEOUT = TIMEOUT;
        this.CLIENT_NAME = CLIENT_NAME;
    }

    /**
     * 
     * Function which taken in request options and hits HTTP request via requestPromise module. It expects following parameters
     * 
     * @param {Object} requestOpts - the HTTP request opts which is needed to hit the request.
     * 
     * @returns {Promise.<Object|Error>} - Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     * 
     * @private
     */
    async _hitHttpRequest(requestOpts) {
        debug(`${this.LOGTAG} : Going to hit HTTP request with options : ${JSON.stringify(requestOpts)}`);

        try {
            const response = await requestPromise(requestOpts);
            debug(`${this.LOGTAG} : Success Response Body :`, requestOpts && requestOpts.resolveWithFullResponse ? JSON.stringify(response.body) : JSON.stringify(response));
            return response;
        } catch (err) {
            debug(`${this.LOGTAG} : Error occurred while hitting HTTP request with options : ${JSON.stringify(requestOpts)}`, err);
            throw (err && err.error) || err;
        }
    }

    /**
     * 
     * Function which taken in apiPath and other parameters to generate the request options for hitting the API request. It expects following input parameters :
     * 
     * @param {String} apiPath - The API path for our client. Ex : /v1/some/sample/route
     * @param {Object} requestOpts - Following are supported as the parameters which are needed to hit the request.
     * @param {String} requestOpts.method - HTTP method, ex : GET, POST, PUT, DELETE, etc.
     * @param {Object} [requestOpts.headers] - Request headers for our HTTP request.
     * @param {Object} [requestOpts.body] - Request body for our HTTP request.
     * @param {Object} [requestOpts.qs] - Query params for our HTTP request.
     * @param {Number} [requestOpts.timeout] - Timeout for our HTTP request.
     * @param {...any} [requestOpts.otherRequestOpts] - Any other properties which needs to be included in our HTTP request options.
     * 
     * @returns {Object} Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     * 
     * @throws {Error} Please note that some input parameters for this function are mandatory and 
     * hence is being validated. Hence it is advised to wrap this function call in a try catch block to 
     * catch any synchronous errors being thrown.
     * 
     * @private
     */
    _prepareRequestOpts(apiPath, {
        method,
        headers,
        body,
        form,
        qs,
        timeout,
        ...otherRequestOpts //jshint ignore:line
    } = {}) {
        if (!LibUtils.isValidString(apiPath)) {
            const err = new TypeError(`Provided API path : ${apiPath} is of invalid type`);
            debug(`${this.LOGTAG} : Error :`, err);
            throw err;
        }

        if (!LibUtils.isValidString(method)) {
            const err = new TypeError(`Provided HTTP method : ${method} is of invalid type`);
            debug(`${this.LOGTAG} : Error :`, err);
            throw err;
        }

        headers = headers || {};

        headers['x-http-mapps-client-req-id'] = `${uuid.v4()}`;
        headers['x-http-mapps-client-name'] = `${this.CLIENT_NAME.toLowerCase()}`;

        return {
            url: this.ENDPOINT + apiPath,
            method,
            headers,
            body,
            form,
            qs,
            timeout,
            ...otherRequestOpts, //jshint ignore:line
        };
    }

    /**
     * 
     * Function which taken in apiPath and httpOpts request options and hits HTTP request. This 
     * function is meant to be overriden in the child classes of this parent class to exhibit API 
     * specific input parameters and behaviour. It expects following parameters :
     * 
     * @param {String} apiPath - API path. Ex : /v2/some/sample/route
     * @param {Object} [httpOpts = {}] - the HTTP opts which is needed to hit the request.
     * 
     * @returns {Promise.<Object|Error>} Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     * 
     * @private
     */
    async _with(apiPath, httpOpts) {
        try {
            if (!LibUtils.isValidString(apiPath)) {
                throw new TypeError(`Provided apiPath is not of valid type`);
            }

            if (LibUtils.isNil(httpOpts)) {
                throw new TypeError(`Provided httpOpts is not of valid type`);
            }

            const requestOpts = this._prepareRequestOpts(apiPath, httpOpts);
            const response = await this._hitHttpRequest(requestOpts);
            return response;
        } catch (err) {
            L.error(`${this.LOGTAG} : Error occurred while calling API : ${apiPath} for client : ${this.CLIENT_NAME}`);
            L.error(`${this.LOGTAG} : HTTP Options : ${JSON.stringify(httpOpts)}`);
            L.error(`${this.LOGTAG} : Error :`, err);
            throw err;
        }
    }
}

module.exports = Base;