import {addText, addChildElement} from '../lib/dom.js';

const addCidPinInfo = () => {
  const wrapperElt = document.getElementById('cidPinWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideCreateNftTemplateWrappers();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'Create (and pin) an NFT template');

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

  addText(addChildElement(formElt, 'h2'), 'CID Pinning');
  addField('command', 'Command', 'mint_nft');
  addField('version', 'Version', '1.0.0');
  addField('title', 'Title', '');
  addField('issuer', 'Issuer (Banano Account)', '');
  addField('max_supply', 'Maximum Mint Count (Max Supply), (Leave Blank for Unlimited)', '1');
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
  if (body.pinataContent.max_supply.length == 0) {
    delete body.pinataContent.max_supply;
  }
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

export {addCidPinInfo};
