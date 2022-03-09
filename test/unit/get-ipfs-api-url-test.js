'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-ipfs-api-url.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const context = {};
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      ipfs_api_url: config.ipfsApiUrl,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  beforeEach(async () => {
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
  });
});
