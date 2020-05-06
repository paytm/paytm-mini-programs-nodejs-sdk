"use strict";

const debug = require('debug')('miniapps.node.clients.oauth');
const Base = require('./base');
const constants = require('../config').constants;
const LibUtils = require('../lib').utils;
const L = require('../lib').logger;

/**
 * @class
 * @extends Base
 */
class Oauth extends Base {
    /**
     * 
     * Constructor for our Oauth client class. It expects following parameters :
     * 
     * @param {Object} authOpts - Following are supported and may be passed as auth options :
     * @param {String} authOpts.clientId - oauth clientId provided on onboarding.
     * @param {String} authOpts.clientSecret - oauth clientSecret provided on onboarding.
     * 
     * @param {Object} httpOpts - Following are supported and may be passed as http options :
     * @param {String} httpOpts.ENDPOINT - Hostname / Endpoint for all our client requests
     * @param {...any} [httpOpts.args] - Any arguments which needs to be passed as options to the parent class' constructor. For more details, refer to Base class' documentation.
     *
     * @see Base
     */
    constructor({
        clientId,
        clientSecret
    }, {
        ENDPOINT,
        ...args //jshint ignore:line
    }) {
        super({
            ENDPOINT,
            TIMEOUT: 5 * 1000,
            CLIENT_NAME: "MINIAPPS-OAUTH-CLIENT",
            LOGTAG: "[clients/oauth]",
            ...args //jshint ignore:line
        });

        if (!LibUtils.isValidString(clientId)) {
            throw new TypeError(`Provided clientId is not of valid type`);
        }

        if (!LibUtils.isValidString(clientSecret)) {
            throw new TypeError(`Provided clientSecret is not of valid type`);
        }

        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Function which calls API to generate access token
     * 
     * It expects following parameters :
     * 
     * @param {Object} options - Following are supported and must be passed as options :
     * 
     * @param {String} options.code - Auth code received from trust login
     * @param {Number} [options.scope='paytm'] - Scope 
     * 
     * @returns {Promise.<Object|Error>} Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     */
    async oauthToken({
        code,
        scope = constants.OTHER.OAUTH.SCOPE
    }) {
        try {
            const authorizationHeader = this._getAuthorizationHeader();

            debug(`${this.LOGTAG} : authorization header : ${authorizationHeader}`);

            const response = await super._with(constants.API.OAUTH.OAUTH_TOKEN_API, {
                method: constants.HTTP_METHODS.POST,
                json: true,
                headers: {
                    'Content-Type': constants.HEADER_VALUES.FORM_URL_ENCODED,
                    'Authorization': authorizationHeader
                },
                form: {
                    client_id: this.clientId,
                    grant_type: constants.OTHER.OAUTH.GRANT_TYPE,
                    code: code,
                    scope: scope
                }
            });

            debug(`${this.LOGTAG} : oauthToken Response :`, JSON.stringify(response));
            return response;
        } catch (err) {
            L.log(`${this.LOGTAG} : Error occurred while getting oauth token :`, err);
            throw err;
        }
    }

    /**
     * Function which calls API to get user profile data
     * 
     * It expects following parameters :
     * 
     * @param {Object} options - Following are supported and must be passed as options :
     * 
     * @param {String} options.scopeCode - Scope code
     * 
     * @returns {Promise.<Object|Error>} Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     */
    async userProfile({
        scopeCode
    }) {
        try {
            const authorizationHeader = this._getAuthorizationHeader();

            const response = await super._with(constants.API.OAUTH.V2_USER, {
                method: constants.HTTP_METHODS.GET,
                json: true,
                headers: {
                    'Content-Type': constants.HEADER_VALUES.PROTOCOL_JSON,
                    'data': scopeCode,
                    'verification_type': constants.OTHER.OAUTH.VERIFICATION_TYPE,
                    'Authorization': authorizationHeader
                },
                qs: {
                    'fetch_strategy': constants.OTHER.OAUTH.FETCH_STRATEGY
                }
            });

            debug(`${this.LOGTAG} : userProfile Response :`, JSON.stringify(response));
            return response;
        } catch (err) {
            L.log(`${this.LOGTAG} : Error occurred while getting user profile :`, err);
            throw err;
        }
    }

    /**
     * Function to get authorization header for oauth token generate request
     * 
     * @returns {String} Returns base64 encoded authorization header value
     */
    _getAuthorizationHeader() {
        debug(`${this.LOGTAG} : Client Id : ${this.clientId}`);
        debug(`${this.LOGTAG} : Client Secret : ${this.clientSecret}`);
        const encodedString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        debug(`${this.LOGTAG} : Base64 Encoded value : ${encodedString}`);
        return `Basic ${encodedString}`;
    }
}

module.exports = Oauth;