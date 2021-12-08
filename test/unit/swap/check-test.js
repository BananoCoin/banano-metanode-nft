'use strict';

// libraries
const chai = require('chai');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/check.js');
const swapUtil = require('../../../scripts/swap-util.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');
const mockBlockFactory = require('../../util/mock-block-factory.js');

// constants

// variables

// functions
const getTestData = async () => {
  const senderAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.SENDER_SEED, 0);
  // console.log('check-test', 'senderAccount', senderAccount);

  const receiverAccount = await bananojs.getBananoAccountFromSeed(mockBlockFactory.RECEIVER_SEED, 0);
  // console.log('check-test', 'receiverAccount', receiverAccount);

  const senderPublicKey = await bananojs.getAccountPublicKey(senderAccount);
  // console.log('check-test', 'senderPublicKey', senderPublicKey);

  const receiverPublicKey = await bananojs.getAccountPublicKey(receiverAccount);
  // console.log('check-test', 'receiverPublicKey', receiverPublicKey);

  const senderAccountInfo = await bananojs.getAccountInfo(senderAccount);
  // console.log('check-test', 'senderAccountInfo', senderAccountInfo);

  const receiverAccountInfo = await bananojs.getAccountInfo(receiverAccount);
  // console.log('check-test', 'receiverAccountInfo', receiverAccountInfo);

  const nonce = await swapUtil.start(senderAccount, receiverAccount);
  // console.log('check-test', 'nonce', nonce);

  const sendAtomicSwapBlock = await mockBlockFactory.getSendBlock(mockBlockFactory.SENDER_SEED, 0, receiverAccount);
  // console.log('check-test', 'sendAtomicSwapBlock', sendAtomicSwapBlock);

  const receiveAtomicSwapBlock = await mockBlockFactory.getReceiveBlock(mockBlockFactory.RECEIVER_SEED, 0, sendAtomicSwapBlock.contents);
  // console.log('check-test', 'receiveAtomicSwapBlock', receiveAtomicSwapBlock);

  const changeAbortReceiveAtomicSwapBlock = await mockBlockFactory.getAbortChangeBlock(mockBlockFactory.RECEIVER_SEED, 0);
  // console.log('check-test', 'changeAbortReceiveAtomicSwapBlock', changeAbortReceiveAtomicSwapBlock);

  const sendPaymentBlock = await mockBlockFactory.getSendBlock(mockBlockFactory.RECEIVER_SEED, 0, senderAccount);
  // console.log('check-test', 'sendPaymentBlock', sendPaymentBlock);

  const changeAbortPaymentBlock = await mockBlockFactory.getAbortChangeBlock(mockBlockFactory.SENDER_SEED, 0);
  // console.log('check-test', 'changeAbortPaymentBlock', changeAbortPaymentBlock);

  const receivePaymentBlock = await mockBlockFactory.getReceiveBlock(mockBlockFactory.SENDER_SEED, 0, sendPaymentBlock.contents);
  // console.log('check-test', 'receivePaymentBlock', receivePaymentBlock);

  return {
    senderAccount: senderAccount,
    receiverAccount: receiverAccount,
    senderPublicKey: senderPublicKey,
    receiverPublicKey: receiverPublicKey,
    nonce: nonce,
    sendAtomicSwapBlock: sendAtomicSwapBlock,
    receiveAtomicSwapBlock: receiveAtomicSwapBlock,
    changeAbortReceiveAtomicSwapBlock: changeAbortReceiveAtomicSwapBlock,
    sendPaymentBlock: sendPaymentBlock,
    changeAbortPaymentBlock: changeAbortPaymentBlock,
    receivePaymentBlock: receivePaymentBlock,
    senderAccountInfo: senderAccountInfo,
    receiverAccountInfo: receiverAccountInfo,
  };
};


describe(actionUtil.ACTION, async () => {
  it('get status 200', async () => {
    const {nonce, sendAtomicSwapBlock, receiveAtomicSwapBlock,
      changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
      receivePaymentBlock} = await getTestData();
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
    describe('general', async () => {
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
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
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
        const {senderAccount, receiverAccount,
          changeAbortReceiveAtomicSwapBlock, changeAbortPaymentBlock} =
        await getTestData();
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
        swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', changeAbortReceiveAtomicSwapBlock);
        swapUtil.setBlock(nonce, 'change_abort_payment', changeAbortPaymentBlock);
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
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
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
      it(`blockData.subtype is required to be 'send', 'receive', or 'change' and was 'epoch'.`, async () => {
        const {senderAccount, receiverAccount} =
        await getTestData();
        const epochBlock = {
          contents: {
            type: 'state',
          },
          subtype: 'epoch',
        };
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
        swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', epochBlock);
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
        const expectedError = `blockData.subtype is required to be 'send', 'receive', or 'change' and was 'epoch'.`;
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
    describe('abort', async () => {
      it(`blockData.subtype is required to be 'send_atomic_swap', or 'send_payment' and was 'change_abort_receive_atomic_swap'.`, async () => {
        const {senderAccount, receiverAccount, sendAtomicSwapBlock} =
        await getTestData();
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
        swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', sendAtomicSwapBlock);
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
        const expectedError = `blockData.subtype is required to be 'send_atomic_swap', or 'send_payment' and was 'change_abort_receive_atomic_swap'.`;
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
    describe('start', async () => {
      it(`blockData.subtype is required to be 'receive_atomic_swap', or 'receive_payment' and was 'send_atomic_swap'.`, async () => {
        const {senderAccount, receiverAccount, receiveAtomicSwapBlock} =
        await getTestData();
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
        swapUtil.setBlock(nonce, 'send_atomic_swap', receiveAtomicSwapBlock);
        const context = {
        };
        let actualResponse;
        try {
          const request = {
            nonce: nonce,
            stage: 'start',
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `blockData.subtype is required to be 'receive_atomic_swap', or 'receive_payment' and was 'send_atomic_swap'.`;
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
      it(`blockData.subtype is required to be 'change_abort_receive_atomic_swap', or 'change_abort_payment' and was 'send_atomic_swap'.`, async () => {
        const {senderAccount, receiverAccount, changeAbortReceiveAtomicSwapBlock} =
        await getTestData();
        const nonce = await swapUtil.start(senderAccount, receiverAccount);
        swapUtil.setBlock(nonce, 'send_atomic_swap', changeAbortReceiveAtomicSwapBlock);
        const context = {
        };
        let actualResponse;
        try {
          const request = {
            nonce: nonce,
            stage: 'start',
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `blockData.subtype is required to be 'change_abort_receive_atomic_swap', or 'change_abort_payment' and was 'send_atomic_swap'.`;
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
    describe('send_atomic_swap', async () => {
      it(`send_atomic_swap block is required to have 'previous' be the frontier, and was not.`, async () => {
        const {nonce, sendAtomicSwapBlock, receiveAtomicSwapBlock,
          changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
          receivePaymentBlock, senderAccountInfo} = await getTestData();
        sendAtomicSwapBlock.contents.previous = 'BAD_HASH';
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
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `send_atomic_swap block is required to have 'previous' be the frontier,'${senderAccountInfo.frontier}', and was 'BAD_HASH'.`;
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
      it(`send_atomic_swap block is required to have 'account' be the sender, and was not.`, async () => {
        const {nonce, senderAccount, sendAtomicSwapBlock, receiveAtomicSwapBlock,
          changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
          receivePaymentBlock} = await getTestData();
        sendAtomicSwapBlock.contents.account = 'BAD_ACCOUNT';
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
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `send_atomic_swap block is required to have 'account' be the sender,'${senderAccount}', and was 'BAD_ACCOUNT'.`;
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
      it(`send_atomic_swap block is required to have 'link' be the receiver_public_key, and was not.`, async () => {
        const {nonce, receiverPublicKey, sendAtomicSwapBlock, receiveAtomicSwapBlock,
          changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
          receivePaymentBlock} = await getTestData();
        sendAtomicSwapBlock.contents.link = 'BAD_LINK';
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
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `send_atomic_swap block is required to have 'link' be the receiver_public_key,'${receiverPublicKey}', and was 'BAD_LINK'.`;
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
    describe('send_payment', async () => {
      it(`send_payment block is required to have 'previous' be the receive_atomic_swap hash, and was not.`, async () => {
        const {nonce, sendAtomicSwapBlock, receiveAtomicSwapBlock,
          changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
          receivePaymentBlock} = await getTestData();
        sendPaymentBlock.contents.previous = 'BAD_HASH';
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
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `send_payment block is required to have 'previous' be the receive_atomic_swap,'${receiveAtomicSwapBlock.hash}', and was 'BAD_HASH'.`;
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
      it(`send_payment block is required to have 'account' be the receiver, and was not.`, async () => {
        const {nonce, receiverAccount, sendAtomicSwapBlock, receiveAtomicSwapBlock,
          changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
          receivePaymentBlock} = await getTestData();
        sendPaymentBlock.contents.account = 'BAD_ACCOUNT';
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
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `send_payment block is required to have 'account' be the receiver, '${receiverAccount}', and was 'BAD_ACCOUNT'.`;
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
      it(`send_payment block is required to have 'link' be the sender_public_key, and was not.`, async () => {
        const {nonce, senderPublicKey, sendAtomicSwapBlock, receiveAtomicSwapBlock,
          changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
          receivePaymentBlock} = await getTestData();
        sendPaymentBlock.contents.link = 'BAD_LINK';
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
            blocks: 'false',
          };
          actualResponse = await getResponse(actionUtil, context, request);
        } catch (error) {
          loggingUtil.trace(error);
        }
        const expectedError = `send_payment block is required to have 'link' be the sender_public_key,'${senderPublicKey}', and was 'BAD_LINK'.`;
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
    describe('other', async () => {
    });
  });
  it('abort blocks, check abort', async () => {
    const {senderAccount, receiverAccount,
      changeAbortReceiveAtomicSwapBlock, changeAbortPaymentBlock} =
      await getTestData();
    const nonce = await swapUtil.start(senderAccount, receiverAccount);
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', changeAbortReceiveAtomicSwapBlock);
    swapUtil.setBlock(nonce, 'change_abort_payment', changeAbortPaymentBlock);
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
    const {nonce, sendAtomicSwapBlock, receiveAtomicSwapBlock,
      changeAbortReceiveAtomicSwapBlock, sendPaymentBlock, changeAbortPaymentBlock,
      receivePaymentBlock} = await getTestData();
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
