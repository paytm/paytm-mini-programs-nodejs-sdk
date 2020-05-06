"use strict";

/**
 * @module
 * @name constants
 * @description List of constants used in miniapps node client
 */

/**
 * @namespace
 * @property {Object} API - List of APIs
 * @property {Object} API.OAUTH - Auth service APIs
 * @property {Object} API.COMMON - APIs pertaining to the common client for miniapps
 * 
 * @property {Object} HEADERS_VALUES - API header values
 * 
 * @property {Object} HTTP_METHODS - List of HTTP methods
 * 
 * @property {Object} OTHER - Other miscllaneous constants
 * @property {Object} OTHER.OAUTH - Constants pertaining to oauth client
 */
const constants = Object.freeze({
    API: {
        OAUTH: {
            OAUTH_TOKEN_API: "/oauth2/v2/token",
            V2_USER: "/v2/user"
        },
        COMMON: {
            PARTNER_OPENID: "/h5/auth/v1/partner/getOpenId",
            PARTNER_NOTIFICATION: "/h5/notify/v1/sendPartnerNotification"
        }
    },
    HEADER_VALUES: {
        PROTOCOL_JSON: "application/json",
        FORM_URL_ENCODED: "application/x-www-form-urlencoded"
    },
    HTTP_METHODS: {
        GET: "GET",
        POST: "POST"
    },
    OTHER: {
        OAUTH: {
            GRANT_TYPE: "authorization_code",
            VERIFICATION_TYPE: 'oauth_token',
            FETCH_STRATEGY: 'profile_info,phone_number,email',
            SCOPE: "paytm"
        }
    }
});

module.exports = constants;