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

  describe('errors', async () => {
    it('call setBlock first', async () => {
      const nonce = swapUtil.start('s', 'r');
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
      const expectedErrorMessage = `no block of type 'change_abort_receive_atomic_swap' found with nonce '${nonce}', call setBlock first.`;
      const expectedResponse = {
        success: false,
        errors: [
          expectedErrorMessage,
        ],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
    it('no nonce', async () => {
      const nonce = '';
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
      const expectedErrorMessage = `no swap found with nonce '${nonce}'.`;
      const expectedResponse = {
        success: false,
        errors: [
          expectedErrorMessage,
        ],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
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
