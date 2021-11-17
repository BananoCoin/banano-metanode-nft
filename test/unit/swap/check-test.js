'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../../scripts/actions/swap/check.js');
const swapUtil = require('../../../scripts/swap-util.js');
const {config, loggingUtil, getResponse} = require('../../util/get-response.js');

// constants

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const nonce = swapUtil.start('s', 'r');
    swapUtil.setBlock(nonce, 'send_atomic_swap', {});
    swapUtil.setBlock(nonce, 'receive_atomic_swap', {});
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
    swapUtil.setBlock(nonce, 'send_payment', {});
    swapUtil.setBlock(nonce, 'change_abort_payment', {});
    swapUtil.setBlock(nonce, 'receive_payment', {});
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
  it('abort blocks, check abort', async () => {
    const nonce = swapUtil.start('s', 'r');
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
    const nonce = swapUtil.start('s', 'r');
    swapUtil.setBlock(nonce, 'send_atomic_swap', {});
    swapUtil.setBlock(nonce, 'receive_atomic_swap', {});
    swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
    swapUtil.setBlock(nonce, 'send_payment', {});
    swapUtil.setBlock(nonce, 'change_abort_payment', {});
    swapUtil.setBlock(nonce, 'receive_payment', {});
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
          block: {},
          type: 'send_atomic_swap',
        },
        {
          block: {},
          type: 'receive_atomic_swap',
        },
        {
          block: {},
          type: 'change_abort_receive_atomic_swap',
        },
        {
          block: {},
          type: 'send_payment',
        },
        {
          block: {},
          type: 'change_abort_payment',
        },
        {
          block: {},
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
