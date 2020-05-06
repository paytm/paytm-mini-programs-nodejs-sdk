"use strict";

const debug = require('debug')('miniapps.node.clients.common');
const Base = require('./base');
const constants = require('../config').constants;
const LibUtils = require('../lib').utils;
const L = require('../lib').logger;

/**
 * @class
 * @extends Base
 */
class Common extends Base {
    /**
     * 
     * Constructor for our miniapps Common client class. It expects following parameters :
     * 
     * @param {Object} authOpts - Following are supported and may be passed as auth options :
     * @param {String} authOpts.clientId - oauth client_id provided on onboarding
     * 
     * @param {Object} httpOpts - Following are supported and may be passed as http options :
     * @param {String} httpOpts.ENDPOINT - Hostname / Endpoint for all our client requests
     * @param {...any} [httpOpts.args] - Any arguments which needs to be passed as options to the parent class' constructor. For more details, refer to Base class' documentation.
     *
     * @see Base
     */
    constructor({
        clientId
    }, {
        ENDPOINT,
        ...args //jshint ignore:line
    }) {
        super({
            ENDPOINT,
            TIMEOUT: 5 * 1000,
            CLIENT_NAME: "MINIAPPS-COMMON-CLIENT",
            LOGTAG: "[clients/common]",
            ...args //jshint ignore:line
        });

        if (!LibUtils.isValidString(clientId)) {
            throw new TypeError(`Provided clientId is not of valid type`);
        }

        this.clientId = clientId;
    }

    /**
     * Function which calls API to fetch partner open id.
     * 
     * It expects following parameters :
     * 
     * @param {String} sso_token - sso_token used for authentication.
     * 
     * @returns {Promise.<Object|Error>} Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     */
    async getPartnerOpenId(sso_token) {
        try {
            if (!LibUtils.isValidString(sso_token)) {
                throw new TypeError(`Provided sso_token is not of valid type`);
            }

            const response = await super._with(constants.API.COMMON.PARTNER_OPENID, {
                method: constants.HTTP_METHODS.GET,
                json: true,
                headers: {
                    'Content-Type': constants.HEADER_VALUES.PROTOCOL_JSON,
                    'client_id': this.clientId,
                    'sso_token': sso_token
                }
            });

            debug(`${this.LOGTAG} : getPartnerOpenId Response :`, JSON.stringify(response));
            return response;
        } catch (err) {
            L.log(`${this.LOGTAG} : Error occurred while getting partner open id :`, err);
            throw err;
        }
    }

    /**
     * Function which calls API to send partner notification
     * 
     * It expects following parameters :
     * 
     * @param {Object} options - Following are supported and must be passed as options :
     * 
     * @param {String} options.access_token - Value received from fetch access token of oauth client
     * @param {Number} options.mid - Merchant mid received on onboarding
     * @param {String} options.openId - Received from fetch partner open id function of this client
     * @param {Number} options.orderId - Paytm order id received after placing order
     * @param {String} options.templateName - Notification template name received on onboarding
     * @param {Object} options.notificationPayload - Following must be passed as notification payload :
     * @param {String} options.notificationPayload.name - Name
     * @param {String} options.notificationPayload.vertical - Vertical name
     * @param {String} options.notificationPayload.url - URL
     * 
     * @returns {Promise.<Object|Error>} Returns a promise which either resolves to the required 
     * response body or rejects with the corresponding error.
     */
    async sendPartnerNotification({
        access_token,
        mid,
        openId,
        orderId,
        templateName,
        notificationPayload: {
            name,
            vertical,
            url
        }
    }) {
        try {
            const response = await super._with(constants.API.COMMON.PARTNER_NOTIFICATION, {
                method: constants.HTTP_METHODS.POST,
                json: true,
                headers: {
                    'Content-Type': constants.HEADER_VALUES.PROTOCOL_JSON,
                    'access_token': access_token
                },
                body: {
                    clientId: this.clientId,
                    openId,
                    orderId,
                    templateName,
                    mid,
                    notificationPayload: {
                        name,
                        vertical,
                        url
                    }
                }
            });

            debug(`${this.LOGTAG} : sendPartnerNotification Response`, JSON.stringify(response));
            return response;
        } catch (err) {
            L.log(`${this.LOGTAG} : Error occurred while sending partner notification :`, err);
            throw err;
        }
    }
}

module.exports = Common;