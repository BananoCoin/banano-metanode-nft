import {addText, addChildElement, clear} from '../lib/dom.js';

const addOwnerCheck = () => {
  const wrapperElt = document.getElementById('templateOwnerCheckWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(wrapperElt, 'h2'), 'Check Template Ownership');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideTemplateOwnerCheckWrappers();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');
  addChildElement(formElt, 'input', {
    'id': 'templateOwnerCid',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': defaultCid,
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
  const cid = document.getElementById('templateOwnerCid').value.trim();
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

export {addOwnerCheck};
