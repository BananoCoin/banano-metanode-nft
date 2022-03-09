'use strict';
// libraries
const bananojs = require('@bananocoin/bananojs');

// modules

// constants

// rep from https://github.com/Airtune/73-meta-tokens/blob/134ac0556ef82ecf0734014d8cfc8f0fce58cad1/meta_ledger_protocol/atomic_swap.md
// const representativeAccount = 'ban_1atomicswap11111111i111119711113hysu79s3yxy639i11111cquj6wdh';
const representativePublicKey = '23559C159E22C000000000000000000000000000000000000000000000000000';
const previousHash = '2222222222222222222222222222222222222222222222222222222222222222';

// variables
/* eslint-disable no-unused-vars */
let config;
let loggingUtil;
let frontier;
let balance;
let confirmationHeight;
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
  frontier = previousHash;
  confirmationHeight = '0';
  balance = '1';
};

const deactivate = () => {
  /* eslint-disable no-unused-vars */
  config = undefined;
  loggingUtil = undefined;
  /* eslint-enable no-unused-vars */
  frontier = undefined;
  balance = undefined;
  confirmationHeight = undefined;
};

const getRepresentative = async () => {
  // const representativePublicKey = await bananojs.getAccountPublicKey(representativeAccount);
  return await bananojs.getBananoAccount(representativePublicKey);
};

const getBananodeApi = (fn) => {
  const bananodeApi = {};
  bananodeApi.process = (block, subtype) => {
    // console.log('mock-block-factory', 'block', block);
    fn(block, subtype);
  };
  bananodeApi.getAccountInfo = (accountAddress) => {
    return {
      balance: balance,
      frontier: frontier,
      confirmation_height: confirmationHeight,
    };
  };
  bananodeApi.getGeneratedWork = () => {
    return '0';
  };
  return bananodeApi;
};

const getSendBlock = async (seed, seedIx, newOwnerAccount) => {
  try {
    const representative = await getRepresentative();
    let sendBlock = undefined;
    bananojs.setBananodeApi(
        getBananodeApi((block, subtype) => {
          frontier = bananojs.getBlockHash(block);
          balance = BigInt(balance) - BigInt(block.balance);
          balance = balance.toString();
          sendBlock = {contents: block, subtype: subtype, hash: frontier};
        }),
    );
    const fn = bananojs.sendAmountToBananoAccountWithRepresentativeAndPrevious;
    await fn(seed, seedIx, newOwnerAccount, '1', representative, frontier);
    return sendBlock;
  } catch (error) {
    console.log('mock-block-factory', 'getSendBlock', 'error', error.message);
    console.trace(error);
  }
};

const getReceiveBlock = async (seed, seedIx, block) => {
  try {
    const privateKey = bananojs.bananoUtil.getPrivateKey(seed, seedIx);
    const publicKey = await bananojs.bananoUtil.getPublicKey(privateKey);
    const hash = bananojs.getBlockHash(block);
    const representative = await getRepresentative();
    let receiveBlock = undefined;
    const bananodeApi = getBananodeApi((block, subtype) => {
      frontier = bananojs.getBlockHash(block);
      balance = BigInt(balance) + BigInt(block.balance);
      balance = balance.toString();
      receiveBlock = {contents: block, subtype: subtype, hash: frontier};
    });
    bananojs.setBananodeApi(bananodeApi);
    const fn = bananojs.bananoUtil.receive;
    await fn(bananodeApi, privateKey, publicKey, representative, frontier, hash, '1', bananojs.BANANO_PREFIX);
    return receiveBlock;
  } catch (error) {
    console.log('mock-block-factory', 'getReceiveBlock', 'error', error.message);
    console.trace(error);
  }
};

const getAbortChangeBlock = async (seed, seedIx) => {
  try {
    const privateKey = bananojs.bananoUtil.getPrivateKey(seed, seedIx);
    const representative = await getRepresentative();
    let changeBlock = undefined;
    const bananodeApi = getBananodeApi((block, subtype) => {
      // change blocks in this mock are for aborting, so do not change the frontier.
      // frontier = bananojs.getBlockHash(block);
      changeBlock = {contents: block, subtype: subtype, hash: frontier};
    });
    bananojs.setBananodeApi(bananodeApi);
    const fn = bananojs.bananoUtil.change;
    await fn(bananodeApi, privateKey, representative, bananojs.BANANO_PREFIX);
    return changeBlock;
  } catch (error) {
    console.log('mock-block-factory', 'getChangeBlock', 'error', error.message);
    console.trace(error);
  }
};

// xrb_1sbch6knbjn31u3i5rn6x7cqrhk98se73db81bga7ux3uowhs48dqpeh7zcs
exports.SENDER_SEED = 'FF429A98CD67AAF45B8732CA9FD197AC6652D44D7BC3A956ED96A6AE5F24253C';

// xrb_3rzxi6sc4rng6ebit1e6cf1cidn8kp3ckiwgqxmsmrgmy6ajbzumbk5wd331
exports.RECEIVER_SEED = 'D21A659C778071619780C200376CE2F262A94C46C757C695F49AB06632AF54D0';

exports.init = init;
exports.deactivate = deactivate;
exports.getSendBlock = getSendBlock;
exports.getReceiveBlock = getReceiveBlock;
exports.getAbortChangeBlock = getAbortChangeBlock;
exports.getBananodeApi = getBananodeApi;
