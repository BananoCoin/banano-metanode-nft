let bananoApiUrl;

const seedIx = 0;

const maxPending = 10;

const defaultCid = 'QmRBfyU2FLotWr6nxvKM5akyoyPK93td5v77Q1rYKdtuLU';

window.onLoad = async () => {
  await loadBananoApiUrl();
  loadSeed();
  addSeedHideShow();
  addAccountAndInfo();
  addMintNft();
  addMetanodeSubscription();
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

const addMetanodeSubscription = () => {
  const wrapperElt = document.getElementById('metanodeSubscriptionWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'Metanode Subscription');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'check-metanode-subscription',
    'type': 'button',
    'class': '',
    'onclick': 'checkMetanodeSubscription();return false;',
  });
  addText(checkCidElt, 'Get Metanode Subscription Info');
  addChildElement(wrapperElt, 'div', {
    'id': 'metanodeSubscriptionInfo',
    'class': 'selectable container column',
  });
};

const addMintNft = () => {
  const wrapperElt = document.getElementById('mintNftWrapper');
  addText(addChildElement(wrapperElt, 'h2'), 'Mint NFT');
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

window.checkMetanodeSubscription = async () => {
  const subResponse = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_metanode_subscription_account"}`,
  });
  const subResponseJson = await subResponse.json();
  const subscriptionAccount = subResponseJson.metanode_subscription_account;

  const histBody = {
    action: 'account_history',
    account: account.innerText,
    count: 1,
    raw: true,
    account_filter: [
      subscriptionAccount,
    ],
  };
  const histRequest = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(histBody),
  };
  // console.log('bananoApiUrl', bananoApiUrl);
  // console.log('histBody', histBody);
  // console.log('histBody2', histBody);
  // console.log('histRequest', histRequest);
  const histResponse = await fetch(bananoApiUrl, histRequest);
  // console.log('histResponse', histResponse);
  const histResponseJson = await histResponse.json();
  // console.log('histResponseJson', histResponseJson);

  let html = '';
  if (histResponseJson.history.length == 0) {
    html = `<span><strong>Failure! not subscribed</strong>. Send 1 raw from ${account.innerText} to ${subscriptionAccount}.`;
  } else {
    html = `<span><strong>Success! subscribed to ${subscriptionAccount}</strong>`;
  }
  metanodeSubscriptionInfo.innerHTML = html;
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
