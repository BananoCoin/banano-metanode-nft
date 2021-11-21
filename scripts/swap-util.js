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

const start = async (sender, receiver) => {
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
    senderAccountInfo: await bananojs.getAccountInfo(sender),
    receiverAccountInfo: await bananojs.getAccountInfo(receiver),
    nonce: nonce,
    blocks: new Map(),
  };
  START_BLOCK_TYPES.forEach((blockType) => {
    swap.blocks.set(blockType, null);
  });
  // console.log('swap-util', 'start', swap);

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
  block.contents.signature = signature;
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
    checkBlock(block, blockType, swap);
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

const checkSendBlock = (block, blockType, swap) => {
  // check
  // account: 'ban_3rzxi6sc4rng6ebit1e6cf1cidn8kp3ckiwgqxmsmrgmy6ajbzumbk5wd331',
  // previous: '2222222222222222222222222222222222222222222222222222222222222222',
  // representative: 'ban_16aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46ajbtsyew7c',
  // balance: '1',
  // link: '0000000000000000000000000000000000000000000000000000000000000000',
  // signature: ''
  switch (blockType) {
    case
      'send_atomic_swap':
      if (block.account != swap.sender) {
        throw Error(`${blockType} block is required to have 'account' be the sender,` +
        `'${swap.sender}', and was '${block.account}'.`);
      }
      if (block.previous != swap.senderAccountInfo.frontier) {
        throw Error(`${blockType} block is required to have 'previous' be the frontier,` +
        `'${swap.senderAccountInfo.frontier}', and was '${block.previous}'.`);
      }
      break;
    case
      'send_payment':
      if (block.account != swap.receiver) {
        throw Error(`${blockType} block is required to have 'account' be the receiver, '${swap.receiver}', and was '${block.account}'.`);
      }
      const receiveAtomicSwapBlock = swap.blocks.get('receive_atomic_swap');
      // console.log('checkSendBlock receiveAtomicSwapBlock', receiveAtomicSwapBlock);
      if (block.previous != receiveAtomicSwapBlock.hash) {
        throw Error(`${blockType} block is required to have 'previous' be the receive_atomic_swap,` +
        `'${receiveAtomicSwapBlock.hash}', and was '${block.previous}'.`);
      }
      break;
    default:
      throw Error(`blockData.subtype is required to be 'send_atomic_swap', or 'send_payment' and was '${blockType}'.`);
  }
};

const checkReceiveBlock = (block, blockType, swap) => {
  // check
  // account: 'ban_3rzxi6sc4rng6ebit1e6cf1cidn8kp3ckiwgqxmsmrgmy6ajbzumbk5wd331',
  // previous: '2222222222222222222222222222222222222222222222222222222222222222',
  // representative: 'ban_16aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46ajbtsyew7c',
  // balance: '1',
  // link: '0000000000000000000000000000000000000000000000000000000000000000',
  // signature: ''
  switch (blockType) {
    case
      'receive_atomic_swap':
      break;
    case
      'receive_payment':
      break;
    default:
      throw Error(`blockData.subtype is required to be 'receive_atomic_swap', or 'receive_payment' and was '${blockType}'.`);
  }
};

const checkChangeBlock = (block, blockType, swap) => {
  // check
  // account: 'ban_3rzxi6sc4rng6ebit1e6cf1cidn8kp3ckiwgqxmsmrgmy6ajbzumbk5wd331',
  // previous: '2222222222222222222222222222222222222222222222222222222222222222',
  // representative: 'ban_16aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46ajbtsyew7c',
  // balance: '1',
  // link: '0000000000000000000000000000000000000000000000000000000000000000',
  // signature: ''
  switch (blockType) {
    case
      'change_abort_receive_atomic_swap':
      break;
    case
      'change_abort_payment':
      break;
    default:
      throw Error(`blockData.subtype is required to be 'change_abort_receive_atomic_swap', or 'change_abort_payment' and was '${blockType}'.`);
  }
};

const checkBlock = (blockData, blockType, swap) => {
  // console.log('checkBlock', 'blockData', blockData);
  // console.log('checkBlock', 'blockType', blockType);
  // console.log('checkBlock', 'swap', swap);
  /* istanbul ignore if */
  if (blockData === undefined) {
    throw Error(`blockData is required.`);
  }
  /* istanbul ignore if */
  if (blockData.contents === undefined) {
    throw Error(`blockData.contents is required.`);
  }
  /* istanbul ignore if */
  if (blockData.subtype === undefined) {
    throw Error(`blockData.contents is required.`);
  }
  /* istanbul ignore if */
  if (blockData.contents.type != 'state') {
    throw Error(`blockData.contents.type is required to be 'state' and was '${blockData.contents.type}'.`);
  }
  /* istanbul ignore if */
  if (blockType === undefined) {
    throw Error(`blockType is required.`);
  }
  /* istanbul ignore if */
  if (swap === undefined) {
    throw Error(`swap is required.`);
  }
  switch (blockData.subtype) {
    case 'send':
      checkSendBlock(blockData.contents, blockType, swap);
      break;
    case 'receive':
      checkReceiveBlock(blockData.contents, blockType, swap);
      break;
    case 'change':
      checkChangeBlock(blockData.contents, blockType, swap);
      break;
    default:
      throw Error(`blockData.subtype is required to be 'send', 'receive', or 'change' and was '${blockData.subtype}'.`);
  }
};

exports.init = init;
exports.deactivate = deactivate;
exports.start = start;
exports.setBlock = setBlock;
exports.signBlock = signBlock;
exports.checkSwapAndReturnBlocks = checkSwapAndReturnBlocks;
