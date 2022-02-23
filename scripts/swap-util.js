'use strict';
// libraries
const crypto = require('crypto');
const bananojs = require('@bananocoin/bananojs');

// modules
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_client_protocol/atomic_swap.md
// https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md

// constants
const START_BLOCK_TYPES = ['send_atomic_swap', 'receive_atomic_swap', 'change_abort_receive_atomic_swap', 'send_payment', 'change_abort_payment', 'receive_payment'];

const ABORT_BLOCK_TYPES = ['change_abort_receive_atomic_swap', 'change_abort_payment'];

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
    senderPublicKey: await bananojs.getAccountPublicKey(sender),
    receiverPublicKey: await bananojs.getAccountPublicKey(receiver),
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

const checkSwapAndReturnBlocks = async (nonce, stageEnum, blocksFlag, resp) => {
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
    await checkBlock(block, blockType, swap);
    switch (blocksFlag) {
      case 'true':
        blocks.push({ type: blockType, block: block });
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

const hexToBigInt = (hex) => {
  return BigInt('0x' + hex);
};

const zeroPadToLength = (name, value, length) => {
  value = value.toString();
  if (value.length > length) {
    throw Error(`${name} '${value}' is required to have 'length' be ` + `'${length}', and was '${value.length}'.`);
  }
  value = value.padStart(length, '0');
  return value;
};

const createRepresentative = (assetHeight, receiveHeight, minRaw) => {
  /* istanbul ignore if */
  if (assetHeight === undefined) {
    throw Error(`assetHeight is required.`);
  }
  /* istanbul ignore if */
  if (receiveHeight === undefined) {
    throw Error(`receiveHeight is required.`);
  }
  /* istanbul ignore if */
  if (minRaw === undefined) {
    throw Error(`minRaw is required.`);
  }
  // Representative field can be represented as a 64-char hex. The hex is split into segments encoding requirements for the atomic swap.
  //
  // ban_1atomicswap is used as a header to detect send#atomic_swap blocks containing encoded requirements.
  //
  // asset height is the Banano block height for the frontier block of the asset to swap.
  // The asset height can also refer to a receive#atomic_swap_delegation block. For more details see atomic_swap_delegation.
  //
  // receive height is the recipient's current account block height + 1.
  //
  // min raw is the minimum amount of raw to send back for the swap to be valid.
  //
  //            header          asset height   receive height  min raw (inclusive)
  // hex length 13 chars        10 chars       10 chars        31 chars
  // hex        23559C159E22C   0000000001     00000001CA      0000017FB3B29F21F77C409E0000000
  // value      ban_1atomicswap block 1        block 458       19 BAN
  // Example: ban_1atomicswap11111111i111119711113hysu79s3yxy639i11111cquj6wdh
  const header = '23559C159E22C';
  let assetHeightHex = BigInt(assetHeight).toString(16);
  let receiveHeightHex = BigInt(receiveHeight).toString(16);
  let minRawHex = BigInt(minRaw).toString(16);
  assetHeightHex = zeroPadToLength('assetHeight', assetHeightHex, 10);
  receiveHeightHex = zeroPadToLength('receiveHeight', receiveHeightHex, 10);
  minRawHex = zeroPadToLength('minRaw', minRawHex, 31);
  // console.log('creatRepresentative', 'assetHeight', assetHeight);
  // console.log('creatRepresentative', 'assetHeightHex', assetHeightHex);
  // console.log('creatRepresentative', 'receiveHeightHex', receiveHeightHex);
  // console.log('creatRepresentative', 'minRaw', minRawHex);
  const publicKey = `${header}${assetHeightHex}${receiveHeightHex}${minRawHex}`;
  // console.log('creatRepresentative', 'publicKey', publicKey);
  const representative = bananojs.getBananoAccount(publicKey);
  // console.log('creatRepresentative', 'representative', representative);
  return representative;
};

const parseRepresentative = async (representative) => {
  // console.log('parseRepresentative', 'representative', representative);
  const representativePublicKey = await bananojs.getAccountPublicKey(representative);
  // console.log('parseRepresentative', 'publicKey', representativePublicKey);
  const header = representativePublicKey.substring(0, 13);
  if (header !== '23559C159E22C') {
    throw Error(`representative '${representative}' is required to have 'header' be` + `'23559C159E22C', and was '${header}'.`);
  }
  const assetHeight = hexToBigInt(representativePublicKey.substring(13, 23));
  const receiveHeight = hexToBigInt(representativePublicKey.substring(23, 33));
  const minRaw = hexToBigInt(representativePublicKey.substring(33));
  // console.log('parseRepresentative', 'minRaw', minRaw);
  return {
    assetHeight: assetHeight,
    receiveHeight: receiveHeight,
    minRaw: minRaw,
  };
};

const checkSendBlock = async (block, blockType, swap) => {
  // check
  // account: 'ban_3rzxi6sc4rng6ebit1e6cf1cidn8kp3ckiwgqxmsmrgmy6ajbzumbk5wd331',
  // previous: '2222222222222222222222222222222222222222222222222222222222222222',
  // representative: 'ban_16aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46aj46ajbtsyew7c',
  // balance: '1',
  // link: '0000000000000000000000000000000000000000000000000000000000000000',
  // signature: ''

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#sendatomic_swap

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#sendpayment

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#atomic_swap_representative
  switch (blockType) {
    case 'send_atomic_swap':
      if (block.account != swap.sender) {
        throw Error(`${blockType} block is required to have 'account' be the sender` + ` '${swap.sender}', and was '${block.account}'.`);
      }
      if (block.previous != swap.senderAccountInfo.frontier) {
        throw Error(`${blockType} block is required to have 'previous' be the frontier` + ` '${swap.senderAccountInfo.frontier}', and was '${block.previous}'.`);
      }
      if (block.link != swap.receiverPublicKey) {
        throw Error(`${blockType} block is required to have 'link' be the receiver_public_key` + ` '${swap.receiverPublicKey}', and was '${block.link}'.`);
      }
      const parsedRepresentative = await parseRepresentative(block.representative);
      // console.log('checkSendBlock', 'representative', block.representative);
      // console.log('checkSendBlock', 'parsedRepresentative.minRaw', parsedRepresentative.minRaw);
      // console.log('checkSendBlock', 'block.balance', block.balance);
      if (BigInt(block.balance) < parsedRepresentative.minRaw) {
        throw Error(`${blockType} block is required to have 'balance' be over min_raw` + ` '${parsedRepresentative.minRaw}', and was '${block.balance}'.`);
      }
      // console.log('checkSendBlock', 'parsedRepresentative', parsedRepresentative);
      // console.log('checkSendBlock', 'block', block);
      // console.log('checkSendBlock', 'receiverAccountInfo', swap.receiverAccountInfo);

      const senderConfirmationHeight = BigInt(swap.senderAccountInfo.confirmation_height);
      if (senderConfirmationHeight !== BigInt(parsedRepresentative.assetHeight)) {
        throw Error(
          `${blockType} sender account info is required to have 'confirmation_height' be equal to assetHeight` +
            ` '${parsedRepresentative.assetHeight}', and was '${senderConfirmationHeight}'.`
        );
      }

      const receiverConfirmationHeight = BigInt(swap.receiverAccountInfo.confirmation_height);
      if (receiverConfirmationHeight !== BigInt(parsedRepresentative.receiveHeight)) {
        throw Error(
          `${blockType} receiver account info is required to have 'confirmation_height' be equal to receiveHeight` +
            ` '${parsedRepresentative.receiveHeight}', and was '${receiverConfirmationHeight}'.`
        );
      }
      break;
    case 'send_payment':
      if (block.account != swap.receiver) {
        throw Error(`${blockType} block is required to have 'account' be the receiver` + ` '${swap.receiver}', and was '${block.account}'.`);
      }
      const receiveAtomicSwapBlock = swap.blocks.get('receive_atomic_swap');
      // console.log('checkSendBlock block', block);
      // console.log('checkSendBlock receiveAtomicSwapBlock', receiveAtomicSwapBlock);
      if (block.previous != receiveAtomicSwapBlock.hash) {
        throw Error(`${blockType} block is required to have 'previous' be the receive_atomic_swap` + ` '${receiveAtomicSwapBlock.hash}', and was '${block.previous}'.`);
      }
      if (block.link != swap.senderPublicKey) {
        throw Error(`${blockType} block is required to have 'link' be the sender_public_key` + ` '${swap.senderPublicKey}', and was '${block.link}'.`);
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

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#receiveatomic_swap

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#receivepayment

  switch (blockType) {
    case 'receive_atomic_swap':
      break;
    case 'receive_payment':
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

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#changeabort_payment

  // https://github.com/Airtune/73-meta-tokens/blob/main/meta_ledger_protocol/atomic_swap.md#changeabort_receive_atomic_swap

  switch (blockType) {
    case 'change_abort_receive_atomic_swap':
      break;
    case 'change_abort_payment':
      break;
    default:
      throw Error(`blockData.subtype is required to be 'change_abort_receive_atomic_swap', or 'change_abort_payment' and was '${blockType}'.`);
  }
};

const checkBlock = async (blockData, blockType, swap) => {
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
      await checkSendBlock(blockData.contents, blockType, swap);
      break;
    case 'receive':
      await checkReceiveBlock(blockData.contents, blockType, swap);
      break;
    case 'change':
      await checkChangeBlock(blockData.contents, blockType, swap);
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
exports.createRepresentative = createRepresentative;
