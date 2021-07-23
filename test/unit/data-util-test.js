'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const dataUtil = require('../../scripts/data-util.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants

// variables

// functions
const checkForError = (str, expectedResponse) => {
  let actualResponse = '';
  try {
    dataUtil.checkValidFileStr(str);
  } catch (error) {
    actualResponse = error.message;
  }
  expect(actualResponse).to.deep.equal(expectedResponse);
};

describe('data-util', () => {
  it('checkValidFileStr /', async () => {
    checkForError('/', `value '/' does not match regex '^[a-zA-Z0-9_]+$'`);
  });
  it('checkValidFileStr ..', async () => {
    checkForError('..', `value '..' does not match regex '^[a-zA-Z0-9_]+$'`);
  });
  it('checkValidFileStr .', async () => {
    checkForError('.', `value '.' does not match regex '^[a-zA-Z0-9_]+$'`);
  });
  it('checkValidFileStr \\', async () => {
    checkForError('\\', `value '\\' does not match regex '^[a-zA-Z0-9_]+$'`);
  });

  beforeEach(async () => {
    dataUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    dataUtil.deactivate();
  });
});
