'use strict';

// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/put-abort-signatures.js');
const swapUtil = require('../../../scripts/swap-util.js');
const { config, loggingUtil, getResponse } = require('../../util/get-response.js');
const mockBlockFactory = require('../../util/mock-block-factory.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const senderAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.SENDER_SEED, 0);
    const receiverAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.RECEIVER_SEED, 0);
    const nonce = await swapUtil.start(senderAccount, receiverAccount);
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', { contents: {} });
    swapUtil.setBlock(nonce, 'change_abort_payment', { contents: {} });
    const context = {};
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
      const senderAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.SENDER_SEED, 0);
      const receiverAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.RECEIVER_SEED, 0);
      const nonce = await swapUtil.start(senderAccount, receiverAccount);
      const context = {};
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
        errors: [expectedErrorMessage],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
    it('no nonce', async () => {
      const nonce = '';
      const context = {};
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
        errors: [expectedErrorMessage],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
  });

  beforeEach(async () => {
    bananojs.setBananodeApi(mockBlockFactory.getBananodeApi(() => {}));
    mockBlockFactory.init(config, loggingUtil);
    swapUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    swapUtil.deactivate();
    mockBlockFactory.deactivate();
    bananojs.setBananodeApi(undefined);
  });
});
