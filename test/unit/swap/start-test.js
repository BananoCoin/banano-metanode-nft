'use strict';

// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/start.js');
const swapUtil = require('../../../scripts/swap-util.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');
const mockBlockFactory = require('../../util/mock-block-factory.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const senderAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.SENDER_SEED, 0);
    const receiverAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.RECEIVER_SEED, 0);
    const context = {
    };
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {'sender': senderAccount, 'receiver': receiverAccount});
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
  describe('errors', () => {
    it('bad sender', async () => {
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
        errors: [
          'sender account error:Invalid BANANO Account (not 64 characters)',
        ],
        success: false,
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
    it('bad receiver', async () => {
      const senderAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.SENDER_SEED, 0);
      const context = {
      };
      let actualResponse;
      try {
        actualResponse = await getResponse(actionUtil, context, {'sender': senderAccount, 'receiver': 'b'});
      } catch (error) {
        loggingUtil.trace(error);
      }
      if (actualResponse.nonce !== undefined) {
        delete actualResponse.nonce;
      }
      const expectedResponse = {
        errors: [
          'receiver account error:Invalid BANANO Account (not 64 characters)',
        ],
        success: false,
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
  });

  beforeEach(async () => {
    bananojs.setBananodeApi(mockBlockFactory.getBananodeApi(()=>{}));
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
