"use strict";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const nock = require('nock');
const expect = chai.expect;
const BaseClient = require('../../clients/base');
const OauthClient = require('../../clients').oauth;

function getMockHttpOpts() {
    return {
        ENDPOINT: "http://some.dummy.endpoint",
        TIMEOUT: 4000,
        CLIENT_NAME: "SOME-DUMMY-CLIENT",
        LOGTAG: "[some/dummy/logtag]"
    };
}

function getMockAuthOpts() {
    return {
        clientId: "abcdefgh",
        clientSecret: "ijklmnop"
    };
}

describe("Test cases for miniapps oauth client", function () {
    describe("Test cases for class constructor", function () {
        it("Should throw error when initialized without mandatory arguments", function () {
            expect(() => new OauthClient()).to.throw();
            expect(() => new OauthClient({})).to.throw();
        });

        it("Should throw error when initialized with clientId of invalid type", function () {
            const mockHttpOpts = getMockHttpOpts();
            expect(() => new OauthClient({ clientSecret: "abcd" }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new OauthClient({ clientId: 1234, clientSecret: "abcd" }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new OauthClient({ clientId: null, clientSecret: "abcd" }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new OauthClient({ clientId: {}, clientSecret: "abcd" }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new OauthClient({ clientId: function () { }, clientSecret: "abcd" }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
        });

        it("Should throw error when initialized with clientSecret of invalid type", function () {
            const mockHttpOpts = getMockHttpOpts();
            expect(() => new OauthClient({ clientId: "abcd" }, mockHttpOpts)).to.throw(TypeError, 'Provided clientSecret is not of valid type');
            expect(() => new OauthClient({ clientId: "abcd", clientSecret: 1234 }, mockHttpOpts)).to.throw(TypeError, 'Provided clientSecret is not of valid type');
            expect(() => new OauthClient({ clientId: "abcd", clientSecret: null }, mockHttpOpts)).to.throw(TypeError, 'Provided clientSecret is not of valid type');
            expect(() => new OauthClient({ clientId: "abcd", clientSecret: {} }, mockHttpOpts)).to.throw(TypeError, 'Provided clientSecret is not of valid type');
            expect(() => new OauthClient({ clientId: "abcd", clientSecret: function () { } }, mockHttpOpts)).to.throw(TypeError, 'Provided clientSecret is not of valid type');
        });

        it("Should not throw error when initialized with clientId and clientSecret of valid type", function () {
            const mockHttpOpts = getMockHttpOpts();
            expect(() => new OauthClient({ clientId: "abcdefgh", clientSecret: "ijklmnop" }, mockHttpOpts)).to.not.throw();
            expect(() => new OauthClient({ clientId: new String("abcdefgh"), clientSecret: new String("ijklmnop") }, mockHttpOpts)).to.not.throw();
        });

        it("Should get initialized with mandatory parameters", function () {
            const mockHttpOpts = getMockHttpOpts();
            const mockAuthOpts = getMockAuthOpts();
            expect(() => new OauthClient(mockAuthOpts, mockHttpOpts)).to.not.throw();

            const oauthClientObject = new OauthClient(mockAuthOpts, mockHttpOpts);
            expect(oauthClientObject.clientId).to.equal(mockAuthOpts.clientId);
            expect(oauthClientObject.clientSecret).to.equal(mockAuthOpts.clientSecret);
        });
    });

    describe("Test cases for .oauthToken() function", function () {
        afterEach(function () {
            sinon.restore();
        });

        it("Should resolve with response body in case request is successful", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();
            const expectedAuthHeader = 'Basic YWJjZGVmZ2g6aWprbG1ub3A=';

            const oauthClientObject = new OauthClient(mockAuthOpts, mockHttpOpts);

            const getAuthorizationHeaderSpy = sinon.spy(oauthClientObject, '_getAuthorizationHeader');

            const dummyCode = "dummyCode";

            const dummyRequestBody = {
                client_id: mockAuthOpts.clientId,
                grant_type: "authorization_code",
                code: dummyCode,
                scope: "paytm"
            };

            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .post(`/oauth2/v2/token`, dummyRequestBody)
                .reply(200, dummyResponse);

            await expect(oauthClientObject.oauthToken({ code: dummyCode })).to.eventually.deep.equal(dummyResponse);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            expect(getAuthorizationHeaderSpy.calledOnce).to.be.true;
            expect(getAuthorizationHeaderSpy.calledImmediatelyBefore(baseClientWithSpy)).to.be.true;
            expect(getAuthorizationHeaderSpy.alwaysReturned(expectedAuthHeader)).to.be.true;
            mockServerScope.done();
        });

        it("Should reject with error in case request fails", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();
            const expectedAuthHeader = 'Basic YWJjZGVmZ2g6aWprbG1ub3A=';

            const oauthClientObject = new OauthClient(mockAuthOpts, mockHttpOpts);

            const getAuthorizationHeaderSpy = sinon.spy(oauthClientObject, '_getAuthorizationHeader');

            const dummyCode = "dummyCode";

            const dummyRequestBody = {
                client_id: mockAuthOpts.clientId,
                grant_type: "authorization_code",
                code: dummyCode,
                scope: "paytm"
            };

            const dummyError = {
                error: "some error occurred"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .post(`/oauth2/v2/token`, dummyRequestBody)
                .replyWithError(dummyError);

            const error = await expect(oauthClientObject.oauthToken({ code: dummyCode })).to.eventually.be.rejected;
            expect(error).to.deep.equal(dummyError);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            expect(getAuthorizationHeaderSpy.calledOnce).to.be.true;
            expect(getAuthorizationHeaderSpy.calledImmediatelyBefore(baseClientWithSpy)).to.be.true;
            expect(getAuthorizationHeaderSpy.alwaysReturned(expectedAuthHeader)).to.be.true;
            mockServerScope.done();
        });
    });

    describe("Test cases for .userProfile() function", function () {
        afterEach(function () {
            sinon.restore();
        });

        it("Should resolve with response body in case request is successful", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();
            const expectedAuthHeader = 'Basic YWJjZGVmZ2g6aWprbG1ub3A=';

            const oauthClientObject = new OauthClient(mockAuthOpts, mockHttpOpts);

            const getAuthorizationHeaderSpy = sinon.spy(oauthClientObject, '_getAuthorizationHeader');

            const dummyScopeCode = "dummyScopeCode";

            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .get(`/v2/user`)
                .query({ fetch_strategy: "profile_info,phone_number,email" })
                .reply(200, dummyResponse);

            await expect(oauthClientObject.userProfile({ scopeCode: dummyScopeCode })).to.eventually.deep.equal(dummyResponse);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            expect(getAuthorizationHeaderSpy.calledImmediatelyBefore(baseClientWithSpy)).to.be.true;
            expect(getAuthorizationHeaderSpy.alwaysReturned(expectedAuthHeader)).to.be.true;
            mockServerScope.done();
        });

        it("Should reject with error in case request fails", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();
            const expectedAuthHeader = 'Basic YWJjZGVmZ2g6aWprbG1ub3A=';

            const oauthClientObject = new OauthClient(mockAuthOpts, mockHttpOpts);

            const getAuthorizationHeaderSpy = sinon.spy(oauthClientObject, '_getAuthorizationHeader');

            const dummyScopeCode = "dummyScopeCode";

            const dummyResponse = {
                error: "some error occurred"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .get(`/v2/user`)
                .query({ fetch_strategy: "profile_info,phone_number,email" })
                .reply(500, dummyResponse);

            const error = await expect(oauthClientObject.userProfile({ scopeCode: dummyScopeCode })).to.eventually.be.rejected;
            expect(error).to.deep.equal(dummyResponse);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            expect(getAuthorizationHeaderSpy.calledImmediatelyBefore(baseClientWithSpy)).to.be.true;
            expect(getAuthorizationHeaderSpy.alwaysReturned(expectedAuthHeader)).to.be.true;
            mockServerScope.done();
        });
    });

    describe("Test cases for _getAuthorizationHeader() function", function() {
        it("Should return a string with auth code header", function() {
            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();
            const expectedAuthHeader = 'Basic YWJjZGVmZ2g6aWprbG1ub3A=';

            const oauthClientObject = new OauthClient(mockAuthOpts, mockHttpOpts);
            expect(oauthClientObject._getAuthorizationHeader()).to.be.a("string");
            expect(oauthClientObject._getAuthorizationHeader()).to.equal(expectedAuthHeader);
        });
    });
});