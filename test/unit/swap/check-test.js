'use strict';

// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/check.js');
const swapUtil = require('../../../scripts/swap-util.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');
const {getSendBlock, getReceiveBlock, getChangeBlock, SENDER_SEED, RECEIVER_SEED} = require('../../util/mock-block-factory.js');

// constants

// variables

// functions
const getTestData = async () => {
  const senderAccount = await bananojs.getBananoAccountFromSeed(SENDER_SEED, 0);
  // console.log('check-test', 'senderAccount', senderAccount);

  const receiverAccount = await bananojs.getBananoAccountFromSeed(RECEIVER_SEED, 0);
  // console.log('check-test', 'receiverAccount', receiverAccount);

  const sendAtomicSwapBlock = await getSendBlock(SENDER_SEED, 0, receiverAccount);
  // console.log('check-test', 'sendAtomicSwapBlock', sendAtomicSwapBlock);

  const receiveAtomicSwapBlock = await getReceiveBlock(RECEIVER_SEED, 0, sendAtomicSwapBlock);
  // console.log('check-test', 'receiveAtomicSwapBlock', receiveAtomicSwapBlock);

  const changeAbortReceiveAtomicSwapBlock = await getChangeBlock(RECEIVER_SEED, 0);
  // console.log('check-test', 'changeAbortReceiveAtomicSwapBlock', changeAbortReceiveAtomicSwapBlock);

  const sendPaymentBlock = await getSendBlock(RECEIVER_SEED, 0, senderAccount);
  // console.log('check-test', 'sendPaymentBlock', sendPaymentBlock);

  const changeAbortPaymentBlock = await getChangeBlock(SENDER_SEED, 0);
  // console.log('check-test', 'changeAbortPaymentBlock', changeAbortPaymentBlock);

  const receivePaymentBlock = await getReceiveBlock(SENDER_SEED, 0, sendPaymentBlock);
  // console.log('check-test', 'receivePaymentBlock', receivePaymentBlock);
  return {
    senderAccount: senderAccount,
    receiverAccount: receiverAccount,
    sendAtomicSwapBlock: sendAtomicSwapBlock,
    receiveAtomicSwapBlock: receiveAtomicSwapBlock,
    changeAbortReceiveAtomicSwapBlock: changeAbortReceiveAtomicSwapBlock,
    sendPaymentBlock: sendPaymentBlock,
    changeAbortPaymentBlock: changeAbortPaymentBlock,
    receivePaymentBlock: receivePaymentBlock,
  };
};


describe(actionUtil.ACTION, async () => {
  it('get status 200', async () => {
    const {senderAccount, receiverAccount, sendAtomicSwapBlock, receiveAtomicSwapBlock,
      changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
      receivePaymentBlock} = await getTestData();
    const nonce = swapUtil.start(senderAccount, receiverAccount);
    swapUtil.setBlock(nonce, 'send_atomic_swap', sendAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'receive_atomic_swap', receiveAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', changeAbortReceiveAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'send_payment', sendPaymentBlock);
    swapUtil.setBlock(nonce, 'change_abort_payment', changeAbortPaymentBlock);
    swapUtil.setBlock(nonce, 'receive_payment', receivePaymentBlock);
    const context = {
    };
    let actualResponse;
    try {
      const request = {
        nonce: nonce,
        stage: 'abort',
        blocks: 'false',
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
    it('no nonce', async () => {
      const nonce = '';
      const context = {
      };
      let actualResponse;
      try {
        const request = {
          nonce: nonce,
          stage: 'abort',
          blocks: 'false',
        };
        actualResponse = await getResponse(actionUtil, context, request);
      } catch (error) {
        loggingUtil.trace(error);
      }
      const expectedError = `no swap found with nonce '${nonce}'.`;
      const expectedResponse = {
        success: false,
        errors: [
          expectedError,
        ],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
    it(`no block of type 'change_abort_receive_atomic_swap' found with nonce`, async () => {
      const {senderAccount, receiverAccount} = await getTestData();
      const nonce = swapUtil.start(senderAccount, receiverAccount);
      const context = {
      };
      let actualResponse;
      try {
        const request = {
          nonce: nonce,
          stage: 'abort',
          blocks: 'false',
        };
        actualResponse = await getResponse(actionUtil, context, request);
      } catch (error) {
        loggingUtil.trace(error);
      }
      const expectedError = `no block of type 'change_abort_receive_atomic_swap' found with nonce '${nonce}', call setBlock first.`;
      const expectedResponse = {
        success: false,
        errors: [
          expectedError,
        ],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
    it(`req.body.blocks is required to be 'true' or 'false'`, async () => {
      const {senderAccount, receiverAccount} = await getTestData();
      const nonce = swapUtil.start(senderAccount, receiverAccount);
      swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
      swapUtil.setBlock(nonce, 'change_abort_payment', {});
      const context = {
      };
      let actualResponse;
      try {
        const request = {
          nonce: nonce,
          stage: 'abort',
          blocks: 'error',
        };
        actualResponse = await getResponse(actionUtil, context, request);
      } catch (error) {
        loggingUtil.trace(error);
      }
      const expectedError = `req.body.blocks is required to be 'true' or 'false' and was 'error'.`;
      const expectedResponse = {
        success: false,
        errors: [
          expectedError,
        ],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
    it(`req.body.stage is required to be 'start' or 'abort' and was 'error'`, async () => {
      const {senderAccount, receiverAccount} = await getTestData();
      const nonce = swapUtil.start(senderAccount, receiverAccount);
      swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
      swapUtil.setBlock(nonce, 'change_abort_payment', {});
      const context = {
      };
      let actualResponse;
      try {
        const request = {
          nonce: nonce,
          stage: 'error',
          blocks: 'error',
        };
        actualResponse = await getResponse(actionUtil, context, request);
      } catch (error) {
        loggingUtil.trace(error);
      }
      const expectedError = `req.body.stage is required to be 'start' or 'abort' and was 'error'.`;
      const expectedResponse = {
        success: false,
        errors: [
          expectedError,
        ],
      };
      loggingUtil.debug('actualResponse', actualResponse);
      loggingUtil.debug('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    });
  });
  it('abort blocks, check abort', async () => {
    const {senderAccount, receiverAccount} = await getTestData();
    const nonce = swapUtil.start(senderAccount, receiverAccount);
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
    swapUtil.setBlock(nonce, 'change_abort_payment', {});
    const context = {
    };
    let actualResponse;
    try {
      const request = {
        nonce: nonce,
        stage: 'abort',
        blocks: 'false',
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
  it('all blocks, check start', async () => {
    const {senderAccount, receiverAccount, sendAtomicSwapBlock, receiveAtomicSwapBlock,
      changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
      receivePaymentBlock} = await getTestData();
    const nonce = swapUtil.start(senderAccount, receiverAccount);
    swapUtil.setBlock(nonce, 'send_atomic_swap', sendAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'receive_atomic_swap', receiveAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', changeAbortReceiveAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'send_payment', sendPaymentBlock);
    swapUtil.setBlock(nonce, 'change_abort_payment', changeAbortPaymentBlock);
    swapUtil.setBlock(nonce, 'receive_payment', receivePaymentBlock);
    const context = {
    };
    let actualResponse;
    try {
      const request = {
        nonce: nonce,
        stage: 'start',
        blocks: 'true',
      };
      actualResponse = await getResponse(actionUtil, context, request);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      blocks: [
        {
          block: sendAtomicSwapBlock,
          type: 'send_atomic_swap',
        },
        {
          block: receiveAtomicSwapBlock,
          type: 'receive_atomic_swap',
        },
        {
          block: changeAbortReceiveAtomicSwapBlock,
          type: 'change_abort_receive_atomic_swap',
        },
        {
          block: sendPaymentBlock,
          type: 'send_payment',
        },
        {
          block: changeAbortPaymentBlock,
          type: 'change_abort_payment',
        },
        {
          block: receivePaymentBlock,
          type: 'receive_payment',
        },
      ],
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
