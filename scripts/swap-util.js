'use strict';
// libraries
const crypto = require('crypto');
const bananojs = require('@bananocoin/bananojs');

// modules

// constants
const START_BLOCK_TYPES = [
  'send_atomic_swap',
  'receive_atomic_swap',
  'change_abort_receive_atomic_swap',
  'send_payment',
  'change_abort_payment',
  'receive_payment',
];

const ABORT_BLOCK_TYPES = [
  'change_abort_receive_atomic_swap',
  'change_abort_payment',
];

// variables
const swaps = new Map();
/* eslint-disable no-unused-vars */
let config;
let loggingUtil;
/* eslint-enable no-unused-vars */

// functions
const init = (_config, _loggingUtil) => {
  /* istanbul ignore if */
  if (_config === undefined) {
    throw new Error('config is required.');
  }
  /* istanbul ignore if */
  if (_loggingUtil === undefined) {
    throw new Error('loggingUtil is required.');
  }
  config = _config;
  loggingUtil = _loggingUtil;
};

const deactivate = () => {
  /* eslint-disable no-unused-vars */
  config = undefined;
  loggingUtil = undefined;
  /* eslint-enable no-unused-vars */
  swaps.clear();
};

const start = (sender, receiver) => {
  const senderAcccountValid = bananojs.getBananoAccountValidationInfo(sender);
  if (!senderAcccountValid.valid) {
    throw Error('sender account error:' + senderAcccountValid.message);
  }
  const receiverAcccountValid = bananojs.getBananoAccountValidationInfo(receiver);
  if (!receiverAcccountValid.valid) {
    throw Error('receiver account error:' + receiverAcccountValid.message);
  }

  const nonce = crypto.randomBytes(32).toString('hex').toUpperCase();
  const swap = {
    sender: sender,
    receiver: receiver,
    nonce: nonce,
    blocks: new Map(),
  };
  START_BLOCK_TYPES.forEach((blockType) => {
    swap.blocks.set(blockType, null);
  });

  swaps.set(nonce, swap);
  return nonce;
};

const setBlock = (nonce, blockType, block) => {
  loggingUtil.debug('setBlock', 'nonce', nonce, 'blockType', blockType, 'block', block);
  if (!swaps.has(nonce)) {
    throw Error(`no swap found with nonce '${nonce}'.`);
  }
  const swap = swaps.get(nonce);
  loggingUtil.debug('setBlock', 'nonce', nonce, 'swap', swap, 'block', block);
  /* istanbul ignore if */
  if (!swap.blocks.has(blockType)) {
    throw Error(`no block type '${blockType}' found with nonce '${nonce}'.`);
  }
  swap.blocks.set(blockType, block);
};

const signBlock = (nonce, blockType, signature) => {
  if (!swaps.has(nonce)) {
    throw Error(`no swap found with nonce '${nonce}'.`);
  }
  const swap = swaps.get(nonce);
  loggingUtil.debug('signBlock', 'nonce', nonce, 'swap', swap);
  /* istanbul ignore if */
  if (!swap.blocks.has(blockType)) {
    throw Error(`no block type '${blockType}' found with nonce '${nonce}'.`);
  }
  const block = swap.blocks.get(blockType);
  if (block == null) {
    throw Error(`no block of type '${blockType}' found with nonce '${nonce}', call setBlock first.`);
  }
  block.signature = signature;
};


const checkSwapAndReturnBlocks = (nonce, stageEnum, blocksFlag, resp) => {
  if (!swaps.has(nonce)) {
    throw Error(`no swap found with nonce '${nonce}'.`);
  }
  const swap = swaps.get(nonce);
  loggingUtil.debug('checkSwap', 'nonce', nonce, 'swap', swap);

  const blocks = [];
  let blockTypes;

  switch (stageEnum) {
    case 'abort':
      blockTypes = ABORT_BLOCK_TYPES;
      break;
    case 'start':
      blockTypes = START_BLOCK_TYPES;
      break;
    default:
      throw Error(`req.body.stage is required to be 'start' or 'abort' and was '${stageEnum}'.`);
  }

  for (let blockTypeIx = 0; blockTypeIx < blockTypes.length; blockTypeIx++) {
    const blockType = blockTypes[blockTypeIx];
    /* istanbul ignore if */
    if (!swap.blocks.has(blockType)) {
      throw Error(`no block type '${blockType}' found with nonce '${nonce}'.`);
    }
    const block = swap.blocks.get(blockType);
    if (block == null) {
      throw Error(`no block of type '${blockType}' found with nonce '${nonce}', call setBlock first.`);
    }
    switch (blocksFlag) {
      case 'true':
        blocks.push({type: blockType, block: block});
        break;
      case 'false':
        break;
      default:
        throw Error(`req.body.blocks is required to be 'true' or 'false' and was '${blocksFlag}'.`);
    }
  }

  if (blocksFlag === 'true') {
    resp.blocks = blocks;
  }
};

exports.init = init;
exports.deactivate = deactivate;
exports.start = start;
exports.setBlock = setBlock;
exports.signBlock = signBlock;
exports.checkSwapAndReturnBlocks = checkSwapAndReturnBlocks;
