'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/put-abort-signatures.js');
const swapUtil = require('../../../scripts/swap-util.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const nonce = swapUtil.start('s', 'r');
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
    swapUtil.setBlock(nonce, 'change_abort_payment', {});
    const context = {
    };
    let actualResponse;
    try {
      const request = {
        nonce: nonce,
        change_abort_receive_atomic_swap_signature: '',
        change_abort_payment_signature: '',
      };
      actualResponse = await getResponse(actionUtil, context, request);
    } catch (error) {
      loggingUtil.trace(error);
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
