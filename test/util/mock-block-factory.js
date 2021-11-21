'use strict';
// libraries
const bananojs = require('@bananocoin/bananojs');

// modules

// swapUtil.setBlock(nonce, 'send_atomic_swap', {});
// swapUtil.setBlock(nonce, 'receive_atomic_swap', {});
// swapUtil.setBlock(nonce, 'change_abort_receive_atomic_swap', {});
// swapUtil.setBlock(nonce, 'send_payment', {});
// swapUtil.setBlock(nonce, 'change_abort_payment', {});
// swapUtil.setBlock(nonce, 'receive_payment', {});

// constants
const representativePublicKey = '1111111111111111111111111111111111111111111111111111111111111111';
const previousHash = '2222222222222222222222222222222222222222222222222222222222222222';

// variables

// functions
const getRepresentative = async () => {
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
      balance: '1',
      frontier: previousHash,
    };
  };
  bananodeApi.getGeneratedWork = () =>{
    return '0';
  };
  return bananodeApi;
};

const getSendBlock = async (seed, seedIx, newOwnerAccount) => {
  try {
    const representative = await getRepresentative();
    let sendBlock = undefined;
    bananojs.setBananodeApi(getBananodeApi((block, subtype) => {
      sendBlock = {contents: block, subtype: subtype};
    }));
    const fn = bananojs.sendAmountToBananoAccountWithRepresentativeAndPrevious;
    await fn(seed, seedIx, newOwnerAccount, '1', representative, previousHash);
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
    const hash = bananojs.bananoUtil.hash(block);
    const representative = await getRepresentative();
    let receiveBlock = undefined;
    const bananodeApi = getBananodeApi((block, subtype) => {
      receiveBlock = {contents: block, subtype: subtype};
    });
    bananojs.setBananodeApi(bananodeApi);
    const fn = bananojs.bananoUtil.receive;
    await fn(bananodeApi, privateKey, publicKey, representative, previousHash, hash, '1', bananojs.BANANO_PREFIX);
    return receiveBlock;
  } catch (error) {
    console.log('mock-block-factory', 'getReceiveBlock', 'error', error.message);
    console.trace(error);
  }
};

const getChangeBlock = async (seed, seedIx) => {
  try {
    const privateKey = bananojs.bananoUtil.getPrivateKey(seed, seedIx);
    const representative = await getRepresentative();
    let changeBlock = undefined;
    const bananodeApi = getBananodeApi((block, subtype) => {
      changeBlock = {contents: block, subtype: subtype};
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

exports.getSendBlock = getSendBlock;
exports.getReceiveBlock = getReceiveBlock;
exports.getChangeBlock = getChangeBlock;
