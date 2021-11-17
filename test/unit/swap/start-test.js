'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/start.js');
const swapUtil = require('../../../scripts/swap-util.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const context = {
    };
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {'sender': 'a', 'receiver': 'b'});
    } catch (error) {
      loggingUtil.trace(error);
    }
    if (actualResponse.nonce !== undefined) {
      delete actualResponse.nonce;
    }
    const expectedResponse = {
      success: true,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    swapUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    swapUtil.deactivate();
    actionUtil.deactivate();
  });
});