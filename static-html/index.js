import {loadSeed, addSeedHideShow, addAccountAndInfo} from './actions/seed-and-account.js';
import {addCidPinInfo} from './actions/cid-pin.js';
import {addCidInfo} from './actions/cid-info.js';
import {addNavigation} from './actions/navigation.js';
import {addTransferNft} from './actions/transfer-nft.js';
import {addTemplateOwnerCheck} from './actions/check-template-ownership.js';
import {addMintNft} from './actions/mint-nft.js';
import {addOwnerAssetCheck} from './actions/check-owner-assets.js';
import {processHashAndSearchParms} from './lib/hash-and-search-parms.js';

window.bananoApiUrl = '';

window.pinataApiUrl = '';

window.ipfsApiUrl = '';

window.seedIx = 0;

window.maxPending = 10;

window.defaultCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';

window.onLoad = async () => {
  await loadBananoApiUrl();
  await loadPinataApiUrl();
  await loadIpfsApiUrl();
  loadSeed();
  addNavigation();
  addSeedHideShow();
  addAccountAndInfo();
  addCidPinInfo();
  addCidInfo();
  addTemplateOwnerCheck();
  addMintNft();
  addTransferNft();
  addOwnerAssetCheck();
  updateSeedAndAccountInfo();
  processHashAndSearchParms();
};

const loadBananoApiUrl = async () => {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_bananode_api_url"}`,
  });
  const responseJson = await response.json();
  window.bananoApiUrl = responseJson.bananode_api_url;
  console.log('loadBananoApiUrl', 'bananoApiUrl', window.bananoApiUrl);
};

const loadPinataApiUrl = async () => {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_pinata_api_url"}`,
  });
  const responseJson = await response.json();
  window.pinataApiUrl = responseJson.pinata_api_url;
  console.log('loadPinataApiUrl', 'pinataApiUrl', window.pinataApiUrl);
};

const loadIpfsApiUrl = async () => {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_ipfs_api_url"}`,
  });
  const responseJson = await response.json();
  window.ipfsApiUrl = responseJson.ipfs_api_url;
  console.log('loadIpfsApiUrl', 'ipfsApiUrl', window.ipfsApiUrl);
};
