import {addText, addChildElement} from '../lib/dom.js';
import {shorten} from '../lib/asset-name.js';

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
  const getValue = () => {
    return window.localStorage.assetOwnerAccount || '';
  };
  const getHref = () => {
    return `?assetOwnerAccount=${getValue()}#showOwnerAssetCheckWrappers`;
  };
  const shareHrefElt = addChildElement(formElt, 'a', {
    target: '_blank',
    href: getHref(),
  });
  addText(shareHrefElt, 'Share');
  addChildElement(formElt, 'br');
  const assetOwnerAccountElt = addChildElement(formElt, 'input', {
    'id': 'assetOwnerAccount',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': getValue(),
    'placeholder': 'Banano Account',
  });
  assetOwnerAccountElt.addEventListener('input', () => {
    window.localStorage.assetOwnerAccount = assetOwnerAccountElt.value;
    shareHrefElt.href = getHref();
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
    const templatesToLoad = {};
    const response = await fetch(nftApiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: `{"action": "get_nft_owner_assets", "owner":"${assetOwnerAccount}"}`,
    });
    const responseJson = await response.json();
    console.log('checkOwnerAssets', responseJson);
    let html = '';
    if (responseJson.success) {
      html = `<span><strong>Success!</strong>`;
      if (responseJson.assetInfos !== undefined) {
        html += `<span><h2>Owned Assets</h2></span>`;
        html += '<span class="bordered container row">';
        for (let assetInfoIx = 0; assetInfoIx < responseJson.assetInfos.length; assetInfoIx++) {
          const assetInfo = responseJson.assetInfos[assetInfoIx];

          html += '<span class="bordered">';
          html += `<span title="${assetInfo.asset}"><h3>${shorten(assetInfo.asset)}</h3></span>`;
          html += `<span><span id="${assetInfo.asset}">loading image ....</span></span>`;
          html += '</span>';
          if (templatesToLoad[assetInfo.template] == undefined) {
            templatesToLoad[assetInfo.template] = [];
          }
          templatesToLoad[assetInfo.template].push(assetInfo.asset);
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

    Object.keys(templatesToLoad).forEach(async (jsonIpfsCid) => {
      const assets = templatesToLoad[jsonIpfsCid];
      const templateUrl = ipfsApiUrl + '/' + jsonIpfsCid;
      const templateResponse = await fetch(templateUrl, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });
      const templateRsponseJson = await templateResponse.json();
      const title = templateRsponseJson.title;
      const imageIpfsCid = templateRsponseJson.ipfs_cid;
      const imageUrl = ipfsApiUrl + '/' + imageIpfsCid;
      const imageResponse = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'content-type': 'image',
        },
      });
      const imageContentType = imageResponse.headers.get('content-type');
      const imageBlob = await imageResponse.blob();
      let html = '';
      html += `<h4>${title}</h4>`;
      if (imageContentType == 'image/svg+xml') {
        html += `<object title="${imageIpfsCid}" width="30vmin" type="image/svg+xml" data="${imageBlob}"></object>`;
      } else {
        console.log(`defaulting to image for content type ${imageContentType}`);
        // console.log('imageBlob', imageBlob);
        const imageObjectUrl = URL.createObjectURL(imageBlob);
        html += `<img title="${imageIpfsCid}" style="width:30vmin;height30vmin;" src="${imageObjectUrl}"></img>`;
      }
      for (let assetIx = 0; assetIx < assets.length; assetIx++) {
        const asset = assets[assetIx];
        const span = document.getElementById(asset);

        span.innerHTML = html;
      }
    });
  };
  setTimeout(callback, 0);
};

export {addOwnerAssetCheck};
