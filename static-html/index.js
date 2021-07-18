import {addText, addChildElement, hide, show} from './lib/dom.js';
import {loadSeed, addSeedHideShow, addAccountAndInfo} from './actions/seed-and-account.js';
import {addCidPinInfo} from './actions/cid-pin.js';
import {addCidInfo} from './actions/cid-info.js';
import {addNavigation} from './actions/navigation.js';

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
  addOwnerCheck();
  addMintNft();
  addTransferNft();
  updateSeedAndAccountInfo();
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

const addOwnerCheck = () => {
  const wrapperElt = document.getElementById('ownerCheckWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'Check Ownership');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'check-ownership',
    'type': 'button',
    'class': '',
    'onclick': 'checkOwnership();return false;',
  });
  addText(checkCidElt, 'Get Ownership Info');
  addChildElement(wrapperElt, 'div', {
    'id': 'ownershipInfo',
    'class': 'selectable container column',
  });
};


window.checkOwnership = async () => {
  console.log('checkOwnership');
  const cid = document.getElementById('cid').value.trim();
  ownershipInfo.innerHTML = 'pending...';
  const callback = async () => {
    const response = await fetch('/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: `{"action": "get_nft_assets_owners", "ipfs_cid":"${cid}"}`,
    });
    console.log('checkOwnership', response);
    const responseJson = await response.json();
    let html = '';
    if (responseJson.success) {
      html = `<span><strong>Success!</strong>`;
      if (responseJson.asset_owners !== undefined) {
        html += '<span class="bordered container column">';
        html += `<span><h2>owners</h2></span>`;
        for (let assetOwnerIx = 0; assetOwnerIx < responseJson.asset_owners.length; assetOwnerIx++) {
          const assetOwner = responseJson.asset_owners[assetOwnerIx];
          const assetAccount = await window.bananocoinBananojs.getBananoAccount(assetOwner.asset);
          html += `<span>Asset:${assetOwner.asset}</span>`;
          html += `<span>Asset Owner:${assetOwner.owner}</span>`;
          html += `<span>Asset Account:${assetAccount}</span>`;
          assetOwner.history.forEach((historicalOwner) => {
            html += `<span>${historicalOwner.send}=>${historicalOwner.receive}=${historicalOwner.owner}</span>`;
          });
        }
        html += '</span>';
      }
    } else {
      html = `<span><strong>Failure!</strong></span>.`;
      if (responseJson.errors !== undefined) {
        html += '<span class="bordered container column">';
        html += `<span><h2>errors</h2></span>`;
        responseJson.errors.forEach((error) => {
          html += `<span>${error}</span>`;
        });
        html += '</span>';
      }
    }
    ownershipInfo.innerHTML = html;
  };
  setTimeout(callback, 0);
};

window.showSeed = () => {
  hide('seed-show');
  show('seed-hide');
  show('seed');
  show('seedError');
  return false;
};

window.hideSeed = () => {
  hide('seed-hide');
  show('seed-show');
  hide('seed');
  hide('seedError');
  return false;
};

const addMintNft = () => {
  const wrapperElt = document.getElementById('mintNftWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'Mint NFT');
  addText(addChildElement(wrapperElt, 'h3'), 'Representative');
  addChildElement(wrapperElt, 'div', {
    'id': 'representativePublicKey',
    'class': 'selectable',
  });
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'mint-nft',
    'type': 'button',
    'class': '',
    'onclick': 'mintNft();return false;',
  });
  addText(checkCidElt, 'Mint NFT');
  addChildElement(wrapperElt, 'div', {
    'id': 'mintNftInfo',
    'class': 'selectable container column',
  });
};

const getPreviousHash = async () => {
  const seed = window.localStorage.seed;
  const account = await window.bananocoinBananojs.getBananoAccountFromSeed(seed, seedIx);
  console.log('getPreviousHash', 'account', account);
  const accountInfo = await window.bananocoinBananojs.getAccountInfo(account, true);
  console.log('getPreviousHash', 'accountInfo', accountInfo);
  const previousHash = accountInfo.frontier;
  console.log('getPreviousHash', 'previousHash', previousHash);
  return previousHash;
};

window.mintNft = async () => {
  const seed = window.localStorage.seed;
  const withdrawAccount = await window.bananocoinBananojs.getBananoAccountFromSeed(seed, seedIx);
  console.log('mintNft', 'withdrawAccount', withdrawAccount);
  const previousHash = await getPreviousHash();
  console.log('mintNft', 'previousHash', previousHash);
  const representativePublicKey = document.getElementById('representativePublicKey').innerText;
  console.log('mintNft', 'representativePublicKey', representativePublicKey);
  const representative = await window.bananocoinBananojs.getBananoAccount(representativePublicKey);
  console.log('mintNft', 'representative', representative);
  const fn = window.bananocoinBananojs.sendAmountToBananoAccountWithRepresentativeAndPrevious;
  const response = await fn(seed, seedIx, withdrawAccount, '1', representative, previousHash);
  console.log('mintNft', 'response', response);
  const mintNftInfoElt = document.getElementById('mintNftInfo');
  mintNftInfoElt.innerText = response;
};

const addTransferNft = () => {
  const wrapperElt = document.getElementById('transferNftWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'Transfer NFT');
  addChildElement(wrapperElt, 'div', {
    'id': 'representativePublicKey',
    'class': 'selectable',
  });
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addChildElement(formElt, 'br');
  addText(addChildElement(formElt, 'h3'), 'Hash of Asset to Transfer');
  addChildElement(formElt, 'input', {
    'id': 'hashOfAssetToTransfer',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': '',
  });
  addText(addChildElement(formElt, 'h3'), 'New Owner Account');
  addChildElement(formElt, 'input', {
    'id': 'newOwnerAccount',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': '',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'transfer-nft',
    'type': 'button',
    'class': '',
    'onclick': 'transferNft();return false;',
  });
  addText(checkCidElt, 'Transfer NFT');
  addChildElement(wrapperElt, 'div', {
    'id': 'transferNftInfo',
    'class': 'selectable container column',
  });
};

window.transferNft = async () => {
  const seed = window.localStorage.seed;
  const previousHash = await getPreviousHash();
  console.log('transferNft', 'newOwnerAccount', newOwnerAccount.value);
  console.log('transferNft', 'hashOfAssetToTransfer', hashOfAssetToTransfer.value);
  const representative = await window.bananocoinBananojs.getBananoAccount(hashOfAssetToTransfer.value);
  console.log('transferNft', 'representative', representative);
  const fn = window.bananocoinBananojs.sendAmountToBananoAccountWithRepresentativeAndPrevious;
  const response = await fn(seed, seedIx, newOwnerAccount.value, '1', representative, previousHash);
  console.log('transferNft', 'response', response);
  transferNftInfo.innerText = response;
};

window.showPinataApiTokenJWT = () => {
  hide('pinataApiTokenJWT-show');
  show('pinataApiTokenJWT-hide');
  show('pinataApiTokenJWT');
  return false;
};

window.hidePinataApiTokenJWT = () => {
  hide('pinataApiTokenJWT-hide');
  show('pinataApiTokenJWT-show');
  hide('pinataApiTokenJWT');
  return false;
};

window.updatePinataApiTokenJWT = () => {
  window.localStorage.pinataApiTokenJWT = document.getElementById('pinataApiTokenJWT').value.trim();
};
