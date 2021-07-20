import {addText, addChildElement, clear} from '../lib/dom.js';

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

export {addMintNft};
