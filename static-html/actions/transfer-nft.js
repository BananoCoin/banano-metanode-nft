import {addText, addChildElement, clear} from '../lib/dom.js';

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

export {addTransferNft};
