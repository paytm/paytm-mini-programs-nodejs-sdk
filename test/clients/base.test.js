"use strict";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');
const nock = require('nock');
const expect = chai.expect;
const BaseClient = require('../../clients/base');

function getMockClientOpts() {
    return {
        ENDPOINT: 'http://abc.xyz',
        TIMEOUT: 25 * 1000,
        LOGTAG: '[dummyLogtag]',
        CLIENT_NAME: 'DUMMY-CLIENT'
    };
}

function getMockHttpOpts() {
    return {
        method: "POST",
        timeout: 5000,
        body: {
            "hello": "world"
        },
        headers: {
            'Content-Type': 'application/json'
        },
        json: true
    };
}

const dummyApiPath = new String('/some/dummy/api/path');

describe("Test Cases for BaseClient class", function () {
    describe("Test cases for class constructor", function () {
        it("Should throw error when endpoint is not provided or is invalid", function () {
            expect(() => new BaseClient()).to.throw(TypeError, `Provided endpoint : ${undefined} is of invalid type`);
            expect(() => new BaseClient({ ENDPOINT: null })).to.throw(TypeError, `Provided endpoint : ${null} is of invalid type`);
            expect(() => new BaseClient({ ENDPOINT: 123 })).to.throw(TypeError, `Provided endpoint : ${123} is of invalid type`);
            expect(() => new BaseClient({ ENDPOINT: {} })).to.throw(TypeError, `Provided endpoint : ${{}} is of invalid type`);
        });

        it("Should not throw error when only mandatory params are provided", function () {
            const ENDPOINT = 'https://helloworld';
            expect(() => new BaseClient({ ENDPOINT })).to.not.throw();
            const baseClientObject = new BaseClient({ ENDPOINT });
            expect(baseClientObject).to.be.an.instanceOf(BaseClient);
            expect(baseClientObject.ENDPOINT).to.equal(ENDPOINT);
            expect(baseClientObject.LOGTAG).to.equal("[clients/base]");
            expect(baseClientObject.TIMEOUT).to.equal(20 * 1000);
            expect(baseClientObject.CLIENT_NAME).to.equal("BASE-CLIENT");
        });

        it("Should get initialized with optional parameters", function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            expect(baseClientObject).to.be.an.instanceOf(BaseClient);
            expect(baseClientObject.ENDPOINT).to.equal(mockOpts.ENDPOINT);
            expect(baseClientObject.LOGTAG).to.equal(mockOpts.LOGTAG);
            expect(baseClientObject.TIMEOUT).to.equal(mockOpts.TIMEOUT);
            expect(baseClientObject.CLIENT_NAME).to.equal(mockOpts.CLIENT_NAME);
        });
    });

    describe("Test cases for ._prepareRequestOpts() function", function () {
        it("Should throw error when apiPath is not provided or is of invalid type", function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            expect(() => baseClientObject._prepareRequestOpts()).to.throw(TypeError, `Provided API path : ${undefined} is of invalid type`);
            expect(() => baseClientObject._prepareRequestOpts({})).to.throw(TypeError, `Provided API path : ${{}} is of invalid type`);
            expect(() => baseClientObject._prepareRequestOpts(123)).to.throw(TypeError, `Provided API path : ${123} is of invalid type`);
        });

        it("Should throw error when http method is not provided or is of invalid type", function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            expect(() => baseClientObject._prepareRequestOpts(dummyApiPath)).to.throw(TypeError, `Provided HTTP method : ${undefined} is of invalid type`);
            expect(() => baseClientObject._prepareRequestOpts(dummyApiPath, {
                method: 123
            })).to.throw(TypeError, `Provided HTTP method : ${123} is of invalid type`);
            expect(() => baseClientObject._prepareRequestOpts(dummyApiPath, {
                method: {}
            })).to.throw(TypeError, `Provided HTTP method : ${{}} is of invalid type`);
        });

        it("Should not throw error when headers are not passed", function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const mockHttpOpts = getMockHttpOpts();
            mockHttpOpts.headers = undefined;
            expect(() => baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts)).to.not.throw();
            const requestOpts = baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts);
            expect(requestOpts.url).to.equal(mockOpts.ENDPOINT + dummyApiPath);
            expect(requestOpts.headers).to.have.property('x-http-mapps-client-req-id');
            expect(requestOpts.headers).to.have.property('x-http-mapps-client-name').which.equals(mockOpts.CLIENT_NAME.toLowerCase());
        });

        it("Should return requestOpts successfully when all required parameters are passed", function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const mockHttpOpts = getMockHttpOpts();
            expect(() => baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts)).to.not.throw();
            const requestOpts = baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts);
            expect(requestOpts.url).to.equal(mockOpts.ENDPOINT + dummyApiPath);
            expect(requestOpts).to.deep.include(mockHttpOpts);
            expect(requestOpts.headers).to.have.property('x-http-mapps-client-req-id');
            expect(requestOpts.headers).to.have.property('x-http-mapps-client-name').which.equals(mockOpts.CLIENT_NAME.toLowerCase());
        });
    });

    describe("Test cases for ._hitHttpRequest() function", function () {
        it("Should resolve with response body in case request is successful", async function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const mockHttpOpts = getMockHttpOpts();
            const requestOpts = baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts);

            const dummyRequestBody = JSON.parse(JSON.stringify(requestOpts.body));
            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockOpts.ENDPOINT)
                .post(`${dummyApiPath}`, dummyRequestBody)
                .reply(200, dummyResponse);

            await expect(baseClientObject._hitHttpRequest(requestOpts)).to.eventually.deep.equal(dummyResponse);
            mockServerScope.done();
        });

        it("Should resolve with complete response when resolveWithFullResponse is passed true", async function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const mockHttpOpts = getMockHttpOpts();
            mockHttpOpts.resolveWithFullResponse = true;
            const requestOpts = baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts);

            const dummyRequestBody = JSON.parse(JSON.stringify(requestOpts.body));
            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockOpts.ENDPOINT)
                .post(`${dummyApiPath}`, dummyRequestBody)
                .reply(200, dummyResponse);

            const response = await expect(baseClientObject._hitHttpRequest(requestOpts)).to.eventually.be.fulfilled;
            expect(response.body).to.deep.equal(dummyResponse);
            mockServerScope.done();
        });

        it("Should reject with error in case request fails", async function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const mockHttpOpts = getMockHttpOpts();
            const requestOpts = baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts);

            const dummyRequestBody = JSON.parse(JSON.stringify(requestOpts.body));
            const dummyResponse = {
                error: "Some error occurred"
            };

            const mockServerScope = nock(mockOpts.ENDPOINT)
                .post(`${dummyApiPath}`, dummyRequestBody)
                .reply(500, dummyResponse);

            const error = await expect(baseClientObject._hitHttpRequest(requestOpts)).to.eventually.be.rejected;
            expect(error).to.deep.equal(dummyResponse);
            mockServerScope.done();
        });

        it("Should reject with error in when response body is empty in case request fails", async function () {
            const mockOpts = getMockClientOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const mockHttpOpts = getMockHttpOpts();
            const requestOpts = baseClientObject._prepareRequestOpts(dummyApiPath, mockHttpOpts);

            const dummyRequestBody = JSON.parse(JSON.stringify(requestOpts.body));

            const mockServerScope = nock(mockOpts.ENDPOINT)
                .post(`${dummyApiPath}`, dummyRequestBody)
                .reply(500);

            await expect(baseClientObject._hitHttpRequest(requestOpts)).to.eventually.be.rejected;
            mockServerScope.done();
        });
    });

    describe("Test cases for ._with() function", function () {
        afterEach(function () {
            sinon.restore();
        });

        it("Should throw error when invalid apiPath is provided", async function () {
            const mockOpts = getMockClientOpts();
            const mockHttpOpts = getMockHttpOpts();
            const baseClientObject = new BaseClient(mockOpts);

            await expect(baseClientObject._with(null, mockHttpOpts)).to.eventually.be.rejectedWith(TypeError, 'Provided apiPath is not of valid type');
            await expect(baseClientObject._with(123, mockHttpOpts)).to.eventually.be.rejectedWith(TypeError, 'Provided apiPath is not of valid type');
            await expect(baseClientObject._with({}, mockHttpOpts)).to.eventually.be.rejectedWith(TypeError, 'Provided apiPath is not of valid type');
            await expect(baseClientObject._with(undefined, mockHttpOpts)).to.eventually.be.rejectedWith(TypeError, 'Provided apiPath is not of valid type');
            await expect(baseClientObject._with(function () { }, mockHttpOpts)).to.eventually.be.rejectedWith(TypeError, 'Provided apiPath is not of valid type');
        });

        it("Should throw error when httpOpts is not provided or is null", async function () {
            const mockOpts = getMockClientOpts();
            const mockHttpOpts = getMockHttpOpts();
            const baseClientObject = new BaseClient(mockOpts);

            await expect(baseClientObject._with(dummyApiPath)).to.eventually.be.rejectedWith(TypeError, 'Provided httpOpts is not of valid type');
            await expect(baseClientObject._with(dummyApiPath, null)).to.eventually.be.rejectedWith(TypeError, 'Provided httpOpts is not of valid type');
        });

        it("Should resolve with response body in case request is successful", async function () {
            const mockOpts = getMockClientOpts();
            const mockHttpOpts = getMockHttpOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const _prepareRequestOptsSpy = sinon.spy(baseClientObject, "_prepareRequestOpts");
            const _hitHttpRequestSpy = sinon.spy(baseClientObject, "_hitHttpRequest");

            const dummyRequestBody = JSON.parse(JSON.stringify(mockHttpOpts.body));
            const dummyResponse = {
                response: "Success"
            };

            const mockServerScope = nock(mockOpts.ENDPOINT)
                .post(`${dummyApiPath}`, dummyRequestBody)
                .reply(200, dummyResponse);

            await expect(baseClientObject._with(dummyApiPath, mockHttpOpts)).to.eventually.deep.equal(dummyResponse);
            expect(_prepareRequestOptsSpy.calledOnceWith(dummyApiPath, mockHttpOpts)).to.be.true;
            expect(_hitHttpRequestSpy.calledOnce).to.be.true;
            expect(_prepareRequestOptsSpy.calledImmediatelyBefore(_hitHttpRequestSpy)).to.be.true;
            mockServerScope.done();
        });

        it("Should reject with error in case request fails", async function () {
            const mockOpts = getMockClientOpts();
            const mockHttpOpts = getMockHttpOpts();
            const baseClientObject = new BaseClient(mockOpts);
            const _prepareRequestOptsSpy = sinon.spy(baseClientObject, "_prepareRequestOpts");
            const _hitHttpRequestSpy = sinon.spy(baseClientObject, "_hitHttpRequest");

            const dummyRequestBody = JSON.parse(JSON.stringify(mockHttpOpts.body));
            const dummyResponse = {
                error: "Some error occurred"
            };

            const mockServerScope = nock(mockOpts.ENDPOINT)
                .post(`${dummyApiPath}`, dummyRequestBody)
                .reply(500, dummyResponse);

            const error = await expect(baseClientObject._with(dummyApiPath, mockHttpOpts)).to.eventually.be.rejected;
            expect(error).to.deep.equal(dummyResponse);
            expect(_prepareRequestOptsSpy.calledOnceWith(dummyApiPath, mockHttpOpts)).to.be.true;
            expect(_hitHttpRequestSpy.calledOnce).to.be.true;
            expect(_prepareRequestOptsSpy.calledImmediatelyBefore(_hitHttpRequestSpy)).to.be.true;
            mockServerScope.done();
        });
    });
});