let bananoApiUrl;

let pinataApiUrl;

let ipfsApiUrl;

const seedIx = 0;

const maxPending = 10;

const defaultCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';

window.onLoad = async () => {
  await loadBananoApiUrl();
  await loadPinataApiUrl();
  await loadIpfsApiUrl();
  loadSeed();
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
  bananoApiUrl = responseJson.bananode_api_url;
  console.log('loadBananoApiUrl', 'bananoApiUrl', bananoApiUrl);
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
  pinataApiUrl = responseJson.pinata_api_url;
  console.log('loadPinataApiUrl', 'pinataApiUrl', pinataApiUrl);
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
  ipfsApiUrl = responseJson.ipfs_api_url;
  console.log('loadIpfsApiUrl', 'ipfsApiUrl', ipfsApiUrl);
};

const loadSeed = () => {
  if (window.localStorage.seed == undefined) {
    window.localStorage.seed = getRandomHex32();
  }
};

const saveSeed = () => {
  const seed = document.getElementById('seed').value;
  window.localStorage.seed = seed;
};

const getRandomHex32 = () => {
  const array = new Uint32Array(32);
  window.crypto.getRandomValues(array);
  const hex = getByteArrayAsHexString(array);
  return hex;
};

const getByteArrayAsHexString = (byteArray) => {
  return Array.prototype.map.call(byteArray, (byte) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
};

const addAttributes = (child, attributes) => {
  if (attributes) {
    Object.keys(attributes).forEach((attibute) => {
      const value = attributes[attibute];
      child.setAttribute(attibute, value);
    });
  }
};

const addText = (parent, childText) => {
  parent.appendChild(document.createTextNode(childText));
};

const addChildElement = (parent, childType, attributes) => {
  // console.log('addChildElement', parent, childType, attributes);
  const child = document.createElement(childType);
  parent.appendChild(child);
  addAttributes(child, attributes);
  return child;
};

const hide = (id) => {
  const elt = document.getElementById(id);
  if (elt) {
    elt.style = 'display:none';
  }
};

const show = (id) => {
  const elt = document.getElementById(id);
  if (elt) {
    elt.style = '';
  }
};

const clear = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
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

const addCidPinInfo = () => {
  const wrapperElt = document.getElementById('cidPinWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'CID Pinning');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });

  const addField = (id, name, defaultValue) => {
    addText(addChildElement(formElt, 'h3'), name);
    addChildElement(formElt, 'input', {
      'id': id,
      'class': '',
      'type': 'text',
      'size': '66',
      'max_length': '64',
      'value': defaultValue,
    });
  };
  addText(addChildElement(formElt, 'h2'), 'API Token (JWT)');

  const showButtonElt = addChildElement(formElt, 'button', {
    'id': 'pinataApiTokenJWT-show',
    'type': 'button',
    'class': '',
    'onclick': 'return showPinataApiTokenJWT();',
  });
  addText(showButtonElt, 'Show Pinata Api Token JWT');
  const hideButtonElt = addChildElement(formElt, 'button', {
    'id': 'pinataApiTokenJWT-hide',
    'type': 'button',
    'class': '',
    'style': 'display:none',
    'onclick': 'return hidePinataApiTokenJWT();',
  });
  addText(hideButtonElt, 'Hide Pinata Api Token JWT');
  addChildElement(formElt, 'br');
  addChildElement(formElt, 'input', {
    'id': 'pinataApiTokenJWT',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': window.localStorage.pinataApiTokenJWT,
    'style': 'display:none',
    'onchange': 'updatePinataApiTokenJWT(); return false;',
    'oninput': 'updatePinataApiTokenJWT(); return false;',
  });

  addText(addChildElement(wrapperElt, 'h2'), 'CID Pinning');
  addField('command', 'Command', 'mint_nft');
  addField('version', 'Version', '1.0.0');
  addField('title', 'Title', '');
  addField('issuer', 'Issuer (Banano Account)', '');
  addField('max_supply', 'Maximum Mint Count (Max Supply)', '1');
  addField('ipfs_cid', 'Artwork IPFS CID', '');
  addField('mint_previous', 'Head block of Issuer account', '');
  addChildElement(formElt, 'br');

  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'pin-cid',
    'type': 'button',
    'class': '',
    'onclick': 'pinCid();return false;',
  });
  addText(checkCidElt, 'Pin new JSON to IPFS and get CID');
  addChildElement(wrapperElt, 'div', {
    'id': 'pinCidInfo',
    'class': 'selectable container column',
  });
};

window.pinCid = async () => {
  const url = `${pinataApiUrl}/pinning/pinJSONToIPFS`;
  const body = {
    pinataMetadata: {
      name: document.getElementById('title').value.trim() + ' JSON',
    },
    pinataContent: {
      command: document.getElementById('command').value.trim(),
      version: document.getElementById('version').value.trim(),
      title: document.getElementById('title').value.trim(),
      issuer: document.getElementById('issuer').value.trim(),
      max_supply: document.getElementById('max_supply').value.trim(),
      ipfs_cid: document.getElementById('ipfs_cid').value.trim(),
      mint_previous: document.getElementById('mint_previous').value.trim(),
    },
  };
  console.log('pinCid', 'request', body);
  console.log('pinCid', 'Bearer', window.localStorage.pinataApiTokenJWT);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.pinataApiTokenJWT,
    },
    body: JSON.stringify(body),
  });
  console.log('pinCid', 'response', response);
  const responseJson = await response.json();
  document.getElementById('pinCidInfo').innerText = JSON.stringify(responseJson);
};

const addCidInfo = () => {
  const wrapperElt = document.getElementById('cidInfoWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'CID Info');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');
  const cidElt = addChildElement(formElt, 'input', {
    'id': 'cid',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': defaultCid,
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'check-cid',
    'type': 'button',
    'class': '',
    'onclick': 'checkCid();return false;',
  });
  addText(checkCidElt, 'Get CID Info');
  addChildElement(wrapperElt, 'div', {
    'id': 'cidInfo',
    'class': 'selectable container column',
  });
};

const addAccountAndInfo = () => {
  const wrapperElt = document.getElementById('accountWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'Account');
  addChildElement(wrapperElt, 'div', {
    'id': 'account',
    'class': 'selectable',
  });
  const accountFormElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
  });

  addText(addChildElement(accountFormElt, 'h2'), 'Account Info');
  const updateAccountInfoElt = addChildElement(accountFormElt, 'button', {
    'id': 'update-account-info',
    'type': 'button',
    'class': '',
    'onclick': 'updateAccountInfo();return false;',
  });
  addText(updateAccountInfoElt, 'Refresh Account Info');
  addChildElement(accountFormElt, 'div', {
    'id': 'accountInfo',
    'class': 'selectable',
  });
};

const addSeedHideShow = () => {
  const wrapperElt = document.getElementById('seedWrapper');
  const hideShowElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  const showButtonElt = addChildElement(hideShowElt, 'button', {
    'id': 'seed-show',
    'type': 'button',
    'class': '',
    'onclick': 'return showSeed();',
  });
  addText(showButtonElt, 'Show Seed');
  const hideButtonElt = addChildElement(hideShowElt, 'button', {
    'id': 'seed-hide',
    'type': 'button',
    'class': '',
    'style': 'display:none',
    'onclick': 'return hideSeed();',
  });
  addText(hideButtonElt, 'Hide Seed');
  addChildElement(hideShowElt, 'br');
  const seedElt = addChildElement(hideShowElt, 'input', {
    'id': 'seed',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': window.localStorage.seed,
    'style': 'display:none',
    'onchange': 'updateSeedAndAccountInfo(); return false;',
    'oninput': 'updateSeedAndAccountInfo(); return false;',
  });
  addChildElement(hideShowElt, 'div', {
    'id': 'seedError',
    'style': 'display:none',
    'class': 'selectable',
  });
};

window.updateSeedAndAccountInfo = () => {
  updateSeed();
  updateAccountInfo();
};

const updateSeed = () => {
  const seedElt = document.querySelector('#seed');
  const seedErrorElt = document.querySelector('#seedError');
  window.localStorage.seed = seedElt.value.trim();
  seedElt.value = window.localStorage.seed;
  saveSeed();
  try {
    const seed = window.localStorage.seed;
    window.bananocoinBananojs.getBananoAccountFromSeed(seed, seedIx);
  } catch (error) {
    console.trace(error);
    seedErrorElt.innerText = 'error:' + error.message;
    accountElt.innerText = 'seed error';
    accountInfoElt.innerText = 'seed error';
    return;
  }
};

window.updateAccountInfo = async () => {
  const seed = window.localStorage.seed;
  const accountElt = document.querySelector('#account');
  const accountInfoElt = document.querySelector('#accountInfo');
  const seedErrorElt = document.querySelector('#seedError');
  window.bananocoinBananojs.setBananodeApiUrl(bananoApiUrl);
  clear(accountInfoElt);
  seedErrorElt.innerText = '';
  let account;
  try {
    account = await window.bananocoinBananojs.getBananoAccountFromSeed(seed, seedIx);
  } catch (error) {
    console.trace(error);
    seedErrorElt.innerText = 'error:' + error.message;
    accountElt.innerText = 'seed error';
    accountInfoElt.innerText = 'seed error';
    return;
  }
  accountElt.innerText = account;
  const representative = account;

  let innerText = '';
  const accountInfo = await window.bananocoinBananojs.getAccountInfo(account, true);
  if (accountInfo.error !== undefined) {
    innerText = accountInfo.error;
  } else {
    const balanceParts = await window.bananocoinBananojs.getBananoPartsFromRaw(accountInfo.balance);
    const balanceDescription = await window.bananocoinBananojs.getBananoPartsDescription(balanceParts);
    innerText = 'Balance ' + balanceDescription;

    if (balanceParts.raw == '0') {
      delete balanceParts.raw;
    }
  }
  const pending = await window.bananocoinBananojs.getAccountsPending([account], maxPending, true);
  if (pending.error !== undefined) {
    innerText += '\n';
    innerText += pending.error;
  }
  const pendingBlocks = pending.blocks[account];

  const hashes = [...Object.keys(pendingBlocks)];
  if (hashes.length !== 0) {
    const hash = hashes[0];
    const response = await window.bananocoinBananojs.receiveBananoDepositsForSeed(seed, seedIx, representative, hash);
    if (response.pendingMessage) {
      innerText += '\nPending ' + response.pendingMessage;
    }
    if (response.receiveMessage) {
      innerText += '\nReceive ' + response.receiveMessage;
    }
  }
  accountInfoElt.innerText = innerText;
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
        for (let asset_owner_ix = 0; asset_owner_ix < responseJson.asset_owners.length; asset_owner_ix++) {
          const asset_owner = responseJson.asset_owners[asset_owner_ix];
          const assetAccount = await window.bananocoinBananojs.getBananoAccount(asset_owner.asset);
          html += `<span>Asset:${asset_owner.asset}</span>`;
          html += `<span>Asset Owner:${asset_owner.owner}</span>`;
          html += `<span>Asset Account:${assetAccount}</span>`;
          asset_owner.history.forEach((historical_owner) => {
            html += `<span>${historical_owner.send}=>${historical_owner.receive}=${historical_owner.owner}</span>`;
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

window.checkCid = async () => {
  const cidInfoElt = document.getElementById('cidInfo');
  clear(cidInfoElt);
  const cid = document.getElementById('cid').value.trim();
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_nft_info" ,"ipfs_cid":"${cid}"}`,
  });
  if (response.status != 200) {
    html += `<span><strong>Failure!</strong> ipfs_cid <strong>${cid}</strong> has the <strong>wrong</strong> information, with <strong>errors</strong>.</span>`;
    html += `<span><h2>errors</h2></span>`;
    html += `<span><h3>Pleae be patient if a newly created JSON does not appear immediately.</h3></span>`;
    html += `<span>${response.status}:${response.statusText}</span>`;
    cidInfoElt.innerHTML = html;
    return;
  }
  const responseJson = await response.json();

  let html = '';
  if (responseJson.success) {
    html += `<span><strong>Success!</strong> ipfs_cid <strong>${responseJson.ipfs_cid}</strong> has the correct information, with no errors.</span>`;
  } else {
    html += `<span><strong>Failure!</strong> ipfs_cid <strong>${responseJson.ipfs_cid}</strong> has the <strong>wrong</strong> information, with <strong>errors</strong>.</span>`;
  }
  if (responseJson.json !== undefined) {
    html += '<span class="bordered container column">';
    html += `<span><h2>json</h2></span>`;
    Object.keys(responseJson.json).forEach((key) => {
      const value = responseJson.json[key];
      html += `<span>'${key}':'${value}'</span>`;
    });
    html += `<img style="width:30vmin;height30vmin;" src="${ipfsApiUrl}/${responseJson.json.ipfs_cid}">${responseJson.json.ipfs_cid}</img>`;
    html += '</span>';
    html += '</span>';
  }
  if (responseJson.errors !== undefined) {
    html += '<span class="bordered container column">';
    html += `<span><h2>errors</h2></span>`;
    responseJson.errors.forEach((error) => {
      html += `<span>${error}</span>`;
    });
    html += '</span>';
  }

  cidInfoElt.innerHTML = html;


  const representativePublicKey = document.getElementById('representativePublicKey');
  if (responseJson.success) {
    representativePublicKey.innerText = responseJson.json.new_representative;
  } else {
    representativePublicKey.innerText = '';
  }
  console.log('representativePublicKey', representativePublicKey.innerText);
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
  const response = await window.bananocoinBananojs.sendAmountToBananoAccountWithRepresentativeAndPrevious(seed, seedIx, withdrawAccount, '1', representative, previousHash);
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
  const hashOfAssetToTransferElt = addChildElement(formElt, 'input', {
    'id': 'hashOfAssetToTransfer',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': '',
  });
  addText(addChildElement(formElt, 'h3'), 'New Owner Account');
  const newOwnerAccountElt = addChildElement(formElt, 'input', {
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
  const response = await window.bananocoinBananojs.sendAmountToBananoAccountWithRepresentativeAndPrevious(seed, seedIx, newOwnerAccount.value, '1', representative, previousHash);
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
