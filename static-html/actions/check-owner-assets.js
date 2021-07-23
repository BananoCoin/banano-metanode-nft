import {addText, addChildElement} from '../lib/dom.js';

const addOwnerAssetCheck = () => {
  const wrapperElt = document.getElementById('ownerAssetCheckWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideOwnerAssetCheckWrappers();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'Check Owner Assets');
  addText(addChildElement(formElt, 'h3'), 'Banano Account that owns Assets');
  addChildElement(formElt, 'input', {
    'id': 'assetOwnerAccount',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': '',
    'placeholder': 'Banano Account',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'check-ownership',
    'type': 'button',
    'class': '',
    'onclick': 'checkOwnerAssets();return false;',
  });
  addText(checkCidElt, 'Check Owner Assets');
  addChildElement(wrapperElt, 'div', {
    'id': 'ownerAssetsInfo',
    'class': 'selectable container column',
  });
};


window.checkOwnerAssets = async () => {
  console.log('checkOwnerAssets');
  const assetOwnerAccount = document.getElementById('assetOwnerAccount').value.trim();
  ownerAssetsInfo.innerHTML = 'pending...';
  const callback = async () => {
    const response = await fetch('/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: `{"action": "get_nft_owner_assets", "owner":"${assetOwnerAccount}"}`,
    });
    console.log('checkOwnerAssets', response);
    const responseJson = await response.json();
    let html = '';
    if (responseJson.success) {
      html = `<span><strong>Success!</strong>`;
      if (responseJson.assetInfos !== undefined) {
        html += '<span class="bordered container column">';
        html += `<span><h2>owners</h2></span>`;
        for (let assetInfoIx = 0; assetInfoIx < responseJson.assetInfos.length; assetInfoIx++) {
          const assetInfo = responseJson.assetInfos[assetInfoIx];
          html += `<span>Asset:${assetInfo.asset}</span>`;
          html += `<span>Template:${assetInfo.template}</span>`;
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
    ownerAssetsInfo.innerHTML = html;
  };
  setTimeout(callback, 0);
};

export {addOwnerAssetCheck};
