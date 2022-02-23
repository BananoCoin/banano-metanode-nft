'use strict';

// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/put-block.js');
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
    const context = {};
    let actualResponse;
    try {
      const request = {
        nonce: nonce,
        type: 'send_atomic_swap',
        block: {},
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
    it(`no nonce`, async () => {
      const nonce = '';
      const context = {};
      let actualResponse;
      try {
        const request = {
          nonce: nonce,
          type: '',
          block: {},
        };
        actualResponse = await getResponse(actionUtil, context, request);
      } catch (error) {
        loggingUtil.trace(error);
      }
      const expectedError = `no swap found with nonce '${nonce}'.`;
      const expectedResponse = {
        success: false,
        errors: [expectedError],
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
