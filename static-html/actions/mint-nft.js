import {addText, addChildElement, clear} from '../lib/dom.js';

const addMintNft = () => {
  const wrapperElt = document.getElementById('mintNftWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideMintNftWrapper();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'Mint NFT');
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');
  addChildElement(formElt, 'input', {
    'id': 'mintNftTemplateCid',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': defaultCid,
  });
  addChildElement(formElt, 'br');
  addText(addChildElement(formElt, 'button', {
    'id': 'mint-nft',
    'type': 'button',
    'class': '',
    'onclick': 'checkMintNftCID();return false;',
  }), 'Check CID');
  addText(addChildElement(formElt, 'h3'), 'Representative');
  addChildElement(formElt, 'div', {
    'id': 'representativePublicKey',
    'class': 'selectable',
  });
  addChildElement(formElt, 'br');
  addText(addChildElement(formElt, 'button', {
    'id': 'mint-nft',
    'type': 'button',
    'class': '',
    'onclick': 'mintNft();return false;',
  }), 'Mint NFT');
  addChildElement(formElt, 'div', {
    'id': 'mintNftInfo',
    'class': 'selectable container column',
  });
};

window.checkMintNftCID = async () => {
  const cid = document.getElementById('mintNftTemplateCid').value.trim();
  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_nft_info" ,"ipfs_cid":"${cid}"}`,
  });
  if (response.status == 200) {
    const responseJson = await response.json();
    if (responseJson.success) {
      if (responseJson.json !== undefined) {
        document.getElementById('representativePublicKey').innerText =
          responseJson.json.new_representative;
      }
    }
    return;
  }

  document.getElementById('representativePublicKey').innerText =
    'Error, please check CID Info for errors.';
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
