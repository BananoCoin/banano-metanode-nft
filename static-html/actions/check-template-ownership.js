import {addText, addChildElement} from '../lib/dom.js';

const addTemplateOwnerCheck = () => {
  const wrapperElt = document.getElementById('templateOwnerCheckWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    method: 'POST',
    class: '',
    onsubmit: 'return false;',
  });
  addText(
      addChildElement(formElt, 'button', {
        type: 'button',
        onclick: 'return hideTemplateOwnerCheckWrapper();',
      }),
      'Main Menu',
  );
  addText(addChildElement(formElt, 'h2'), 'Check Template Ownership');
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');

  addChildElement(formElt, 'input', {
    id: 'templateOwnerCid',
    class: '',
    type: 'text',
    size: '66',
    max_length: '64',
    placeholder: 'select from drop down',
    list: 'knownTemplateList',
    autocomplete: 'off',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    id: 'check-ownership',
    type: 'button',
    class: '',
    onclick: 'checkTemplateOwnership();return false;',
  });
  addText(checkCidElt, 'Get Ownership Info');
  addChildElement(wrapperElt, 'div', {
    id: 'templateOwnershipInfo',
    class: 'selectable container column',
  });
  addText(
      addChildElement(formElt, 'button', {
        type: 'button',
        class: '',
        onclick: 'clearTemplateOwnerCidCid();getKnownTemplateList();return false;',
      }),
      'Refresh Template List',
  );
};

window.clearTemplateOwnerCidCid = () => {
  document.getElementById('templateOwnerCid').value = '';
};

window.checkTemplateOwnership = async () => {
  console.log('checkTemplateOwnership');
  const cid = document.getElementById('templateOwnerCid').value.trim();
  templateOwnershipInfo.innerHTML = 'pending...';
  const callback = async () => {
    const response = await fetch(nftApiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: `{"action": "get_nft_template_owner", "ipfs_cid":"${cid}"}`,
    });
    const responseJson = await response.json();
    console.log('checkTemplateOwnership', responseJson);
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
    templateOwnershipInfo.innerHTML = html;
  };
  setTimeout(callback, 0);
};

export {addTemplateOwnerCheck};
