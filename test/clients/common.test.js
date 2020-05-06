"use strict";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const nock = require('nock');
const expect = chai.expect;
const BaseClient = require('../../clients/base');
const CommonClient = require('../../clients').common;

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
        clientId: "abcdefgh"
    };
}

describe("Test cases for miniapps common client", function () {
    describe("Test cases for class constructor", function () {
        it("Should throw error when initialized without mandatory arguments", function () {
            expect(() => new CommonClient()).to.throw();
            expect(() => new CommonClient({})).to.throw();
        });

        it("Should throw error when initialized with clientId of invalid type", function () {
            const mockHttpOpts = getMockHttpOpts();
            expect(() => new CommonClient({}, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new CommonClient({ clientId: 1234 }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new CommonClient({ clientId: null }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new CommonClient({ clientId: {} }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
            expect(() => new CommonClient({ clientId: function () { } }, mockHttpOpts)).to.throw(TypeError, 'Provided clientId is not of valid type');
        });

        it("Should not throw error when initialized with clientId of valid type", function () {
            const mockHttpOpts = getMockHttpOpts();
            expect(() => new CommonClient({ clientId: "abcdefgh" }, mockHttpOpts)).to.not.throw();
            expect(() => new CommonClient({ clientId: new String("abcdefgh") }, mockHttpOpts)).to.not.throw();
        });

        it("Should get initialized with mandatory parameters", function () {
            const mockHttpOpts = getMockHttpOpts();
            const mockAuthOpts = getMockAuthOpts();
            expect(() => new CommonClient(mockAuthOpts, mockHttpOpts)).to.not.throw();

            const commonClientObject = new CommonClient(mockAuthOpts, mockHttpOpts);
            expect(commonClientObject.clientId).to.equal(mockAuthOpts.clientId);
        });
    });

    describe("Test cases for .getPartnerOpenId() function", function () {
        afterEach(function () {
            sinon.restore();
        });

        it("Should resolve with response body in case request is successful", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();

            const commonClientObject = new CommonClient(mockAuthOpts, mockHttpOpts);

            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .get(`/h5/auth/v1/partner/getOpenId`)
                .reply(200, dummyResponse);

            const mockSsoToken = "somedummyssotoken";

            await expect(commonClientObject.getPartnerOpenId(mockSsoToken)).to.eventually.deep.equal(dummyResponse);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            mockServerScope.done();
        });

        it("Should throw error when sso_token of invalid type is passed", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();

            const commonClientObject = new CommonClient(mockAuthOpts, mockHttpOpts);

            await expect(commonClientObject.getPartnerOpenId(123)).to.eventually.be.rejectedWith(TypeError, 'Provided sso_token is not of valid type');
            await expect(commonClientObject.getPartnerOpenId(null)).to.eventually.be.rejectedWith(TypeError, 'Provided sso_token is not of valid type');
            await expect(commonClientObject.getPartnerOpenId()).to.eventually.be.rejectedWith(TypeError, 'Provided sso_token is not of valid type');
            await expect(commonClientObject.getPartnerOpenId({})).to.eventually.be.rejectedWith(TypeError, 'Provided sso_token is not of valid type');
            await expect(commonClientObject.getPartnerOpenId(function () { })).to.eventually.be.rejectedWith(TypeError, 'Provided sso_token is not of valid type');
            expect(baseClientWithSpy.notCalled).to.be.true;
        });

        it("Should reject with error in case request fails", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();

            const commonClientObject = new CommonClient(mockAuthOpts, mockHttpOpts);

            const dummyResponse = {
                error: "some error occurred"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .get(`/h5/auth/v1/partner/getOpenId`)
                .reply(500, dummyResponse);

            const mockSsoToken = "somedummyssotoken";

            const error = await expect(commonClientObject.getPartnerOpenId(mockSsoToken)).to.eventually.be.rejected;
            expect(error).to.deep.equal(dummyResponse);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            mockServerScope.done();
        });
    });

    describe("Test cases for .sendPartnerNotification() function", function () {
        afterEach(function () {
            sinon.restore();
        });

        it("Should resolve with response body in case request is successful", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();

            const commonClientObject = new CommonClient(mockAuthOpts, mockHttpOpts);

            const dummyRequestBody = {
                clientId: mockAuthOpts.clientId,
                openId: "somedummyopenid",
                orderId: 123456789,
                templateName: "somedummytemplatename",
                mid: 456,
                notificationPayload: {
                    name: "some dummy name",
                    vertical: "some dummy vertical",
                    url: "https://some.dummy.url"
                }
            };

            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .post(`/h5/notify/v1/sendPartnerNotification`, dummyRequestBody)
                .reply(200, dummyResponse);

            await expect(commonClientObject.sendPartnerNotification({ access_token: "somedummyaccesstoken", ...dummyRequestBody })).to.eventually.deep.equal(dummyResponse);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            mockServerScope.done();
        });

        it("Should reject with error in case request fails", async function () {
            const baseClientWithSpy = sinon.spy(BaseClient.prototype, '_with');

            const mockAuthOpts = getMockAuthOpts();
            const mockHttpOpts = getMockHttpOpts();

            const commonClientObject = new CommonClient(mockAuthOpts, mockHttpOpts);

            const dummyRequestBody = {
                clientId: mockAuthOpts.clientId,
                openId: "somedummyopenid",
                orderId: 123456789,
                templateName: "somedummytemplatename",
                mid: 456,
                notificationPayload: {
                    name: "some dummy name",
                    vertical: "some dummy vertical",
                    url: "https://some.dummy.url"
                }
            };

            const dummyError = {
                error: "some error occurred"
            };

            const mockServerScope = nock(mockHttpOpts.ENDPOINT)
                .post(`/h5/notify/v1/sendPartnerNotification`, dummyRequestBody)
                .replyWithError(dummyError);

            const error = await expect(commonClientObject.sendPartnerNotification({ access_token: "somedummyaccesstoken", ...dummyRequestBody })).to.eventually.be.rejected;
            expect(error).to.deep.equal(dummyError);
            expect(baseClientWithSpy.calledOnce).to.be.true;
            mockServerScope.done();
        });
    });
});