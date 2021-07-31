import {loadSeed, addSeedHideShow, addAccountAndInfo} from './actions/seed-and-account.js';
import {addCidPinInfo} from './actions/cid-pin.js';
import {addCidInfo} from './actions/cid-info.js';
import {addNavigation} from './actions/navigation.js';
import {addTransferNft} from './actions/transfer-nft.js';
import {addTemplateOwnerCheck} from './actions/check-template-ownership.js';
import {addMintNft} from './actions/mint-nft.js';
import {addOwnerAssetCheck} from './actions/check-owner-assets.js';
import {processHashAndSearchParms} from './lib/hash-and-search-parms.js';
import {addChildElement, clear} from '../lib/dom.js';

window.bananoApiUrl = '';

window.pinataApiUrl = '';

window.ipfsApiUrl = '';

window.nftApiUrl = '';

window.seedIx = 0;

window.maxPending = 10;

window.defaultCid = 'QmXkn3YjkKptcjnrPLK6KeHMfGd9xzur33EHfDCDXCkw4b';

window.onLoad = async () => {
  await loadBananoApiUrl();
  await loadPinataApiUrl();
  await loadIpfsApiUrl();
  await loadNftApiUrl();
  loadCurrentVersion();
  loadSupportedVersions();
  loadKnownTemplateList();
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

const loadNftApiUrl = async () => {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_nft_api_url"}`,
  });
  const responseJson = await response.json();
  window.nftApiUrl = responseJson.nft_api_url;
  console.log('loadNftApiUrl', 'nftApiUrl', window.nftApiUrl);
};

const loadCurrentVersion = async () => {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_current_version"}`,
  });
  const responseJson = await response.json();
  const currentVersion = responseJson.current_version;
  const wrapperElt = document.getElementById('currentVersionWrapper');
  wrapperElt.innerText = currentVersion;
};

const loadSupportedVersions = async () => {
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_supported_versions"}`,
  });
  const responseJson = await response.json();
  const supportedVersions = responseJson.supported_versions;
  const wrapperElt = document.getElementById('supportedVersionsWrapper');
  wrapperElt.innerText = JSON.stringify(supportedVersions);
};

const loadKnownTemplateList = async () => {
  const wrapperElt = document.getElementById('knownTemplateListWrapper');
  addChildElement(wrapperElt, 'dataList', {
    'id': 'knownTemplateList',
  });
  setTimeout(getKnownTemplateList, 0);
};

window.getKnownTemplateList = async () => {
  const response = await fetch(nftApiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_nft_template_list"}`,
  });
  const responseJson = await response.json();
  const dataListElt = document.getElementById('knownTemplateList');
  clear(dataListElt);
  responseJson.templates.forEach((template) => {
    addChildElement(dataListElt, 'option', {
      'value': template,
    });
  });
};
