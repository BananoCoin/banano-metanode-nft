'use strict';
// libraries
const crypto = require('crypto');

// modules

// constants
const BLOCK_TYPES = [
  'send_atomic_swap',
  'receive_atomic_swap',
  'change_abort_receive_atomic_swap',
  'send_payment',
  'change_abort_payment',
  'receive_payment',
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
  const nonce = crypto.randomBytes(32).toString('hex').toUpperCase();
  const swap = {
    sender: sender,
    receiver: receiver,
    nonce: nonce,
    blocks: new Map(),
  };
  BLOCK_TYPES.forEach((blockType) => {
    swap.blocks.set(blockType, null);
  });

  swaps.set(nonce, swap);
  return nonce;
};

const setBlock = (nonce, blockType, block) => {
  if (!swaps.has(nonce)) {
    throw Error(`no swap found with nonce '${nonce}'`);
  }
  const swap = swaps.get(nonce);
  loggingUtil.debug('setBlock', 'nonce', nonce, 'swap', swap, 'block', block);
  if (!swap.blocks.has(blockType)) {
    throw Error(`no block type '${blockType}' found with nonce '${nonce}'`);
  }
  swap.blocks.set(blockType, block);
};

const signBlock = (nonce, blockType, signature) => {
  if (!swaps.has(nonce)) {
    throw Error(`no swap found with nonce '${nonce}'`);
  }
  const swap = swaps.get(nonce);
  loggingUtil.debug('signBlock', 'nonce', nonce, 'swap', swap);
  if (!swap.blocks.has(blockType)) {
    throw Error(`no block type '${blockType}' found with nonce '${nonce}'`);
  }
  const block = swap.blocks.get(blockType);
  if (block == null) {
    throw Error(`no block of type '${blockType}' found with nonce '${nonce}', call setBlock first.`);
  }
  block.signature = signature;
};

exports.init = init;
exports.deactivate = deactivate;
exports.start = start;
exports.setBlock = setBlock;
exports.signBlock = signBlock;
