import {addText, addChildElement} from '../lib/dom.js';
import {getPreviousHash} from '../lib/previous-hash.js';

const addTransferNft = () => {
  const wrapperElt = document.getElementById('transferNftWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideTransferNftWrapper();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'Transfer NFT');
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');
  addChildElement(formElt, 'input', {
    'id': 'transferNftTemplateCid',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'placeholder': 'select from drop down',
    'list': 'knownTemplateList',
    'autocomplete': 'off',
  });
  addChildElement(formElt, 'br');
  addText(addChildElement(formElt, 'button', {
    'id': 'mint-nft',
    'type': 'button',
    'class': '',
    'onclick': 'checkTransferNftCID();return false;',
  }), 'Check CID');
  addText(addChildElement(formElt, 'button', {
    'id': 'refreshCidList',
    'type': 'button',
    'class': '',
    'onclick': 'clearTransferNftTemplateCid();getKnownTemplateList();return false;',
  }), 'Refresh Template List');
  addChildElement(formElt, 'div', {
    'id': 'transferAssets',
    'class': 'selectable',
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


window.clearTransferNftTemplateCid = () => {
  document.getElementById('transferNftTemplateCid').value = '';
};

window.checkTransferNftCID = async () => {
  document.getElementById('transferAssets').innerHTML = 'pending...';
  const cid = document.getElementById('transferNftTemplateCid').value.trim();
  const response = await fetch(nftApiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_nft_template_owner" ,"ipfs_cid":"${cid}"}`,
  });
  if (response.status == 200) {
    const responseJson = await response.json();
    if (responseJson.success) {
      if (responseJson.asset_owners !== undefined) {
        let assetHtml = '';

        for (let assetOwnerIx = 0; assetOwnerIx < responseJson.asset_owners.length; assetOwnerIx++) {
          const assetOwner = responseJson.asset_owners[assetOwnerIx];
          assetHtml += assetOwner.asset;
          assetHtml += ` (owned by ${assetOwner.owner})`;
          if (assetOwner.owner === document.querySelector('#account').innerText) {
            assetHtml += '(you)';
          }
          assetHtml += '<br>';
        }

        document.getElementById('transferAssets').innerHTML = assetHtml;
      }
    } else {
      let assetHtml = 'failure<br>';
      if (responseJson.errors !== undefined) {
        responseJson.errors.forEach((error) => {
          assetHtml += error;
          assetHtml += '<br>';
        });
      }

      document.getElementById('transferAssets').innerHTML = assetHtml;
    }
    return;
  }

  document.getElementById('transferAssets').innerHTML =
    'Error, please check CID Info for errors.';
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

export {addTransferNft};
