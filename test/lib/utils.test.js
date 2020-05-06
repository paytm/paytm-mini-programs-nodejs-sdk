const chai = require('chai');
const expect = chai.expect;
const LibUtils = require('../../lib').utils;

describe("Test cases for utils class", function () {
    describe("Test cases for isValidString function", function () {
        it("Should return true when valid string is passed", function () {
            expect(LibUtils.isValidString("some valid string")).to.be.true;
            expect(LibUtils.isValidString(new String("some valid string"))).to.be.true;
        });

        it("Should return false when invalid string is passed", function () {
            expect(LibUtils.isValidString()).to.be.false;
            expect(LibUtils.isValidString({})).to.be.false;
            expect(LibUtils.isValidString(function () { })).to.be.false;
            expect(LibUtils.isValidString(null)).to.be.false;
            expect(LibUtils.isValidString(123)).to.be.false;
            expect(LibUtils.isValidString(/^abc/)).to.be.false;
            expect(LibUtils.isValidString(true)).to.be.false;
        });
    });

    describe("Test cases for isNil function", function () {
        it("Should return false when non null/undefined value is passed", function () {
            expect(LibUtils.isNil("abcdefgh")).to.be.false;
            expect(LibUtils.isNil({})).to.be.false;
            expect(LibUtils.isNil(function () { })).to.be.false;
            expect(LibUtils.isNil(123)).to.be.false;
            expect(LibUtils.isNil(/^abc/)).to.be.false;
            expect(LibUtils.isNil(true)).to.be.false;
        });

        it("Should return true when null or undefined value is passed", function () {
            expect(LibUtils.isNil(undefined)).to.be.true;
            expect(LibUtils.isNil(null)).to.be.true;
        });
    });
});