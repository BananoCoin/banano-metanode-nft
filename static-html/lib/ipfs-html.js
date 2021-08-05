import {addText, addChildElement} from '../lib/dom.js';
import {normalizeSvgs} from '../lib/svg.js';
import {shorten} from '../lib/asset-name.js';

const getIpfsHtmlWorkerInst = new Worker('./workers/get-ipfs-html.js', {type: 'module'});

window.reloadTemplateAssets = (jsonIpfsCid, assets) => {
  // no blacklist or whitelist means load everything.
  getIpfsHtmlWorkerInst.postMessage([ipfsApiUrl, jsonIpfsCid, JSON.parse(assets)]);
};

getIpfsHtmlWorkerInst.onmessage = function(e) {
  const html = e.data[0];
  const assets = e.data[1];
  const jsonIpfsCid = e.data[2];
  const imageIpfsCid = e.data[3];
  const allowReload = e.data[4];
  const title = e.data[5];
  // console.log('e.data', e.data);
  for (let assetIx = 0; assetIx < assets.length; assetIx++) {
    const asset = assets[assetIx];
    const span = document.getElementById(asset);

    span.innerHTML = html;
    normalizeSvgs(span);
    if (allowReload == 'true') {
    }
    addChildElement(span, 'br');
    addText(span, title);
    addChildElement(span, 'br');
    addText(addChildElement(span, 'button', {
      'type': 'button',
      'class': '',
      'onclick': `reloadTemplateAssets('${jsonIpfsCid}', '${JSON.stringify(assets)}');return false;`,
    }), 'Reload Template ' + shorten(jsonIpfsCid));
    addChildElement(span, 'br');
    addText(addChildElement(span, 'a', {
      href: `${ipfsApiUrl}/${jsonIpfsCid}`,
      target: '_blank',
    }), 'JSON CID ' + jsonIpfsCid);
    addChildElement(span, 'br');
    addText(addChildElement(span, 'a', {
      href: `${ipfsApiUrl}/${imageIpfsCid}`,
      target: '_blank',
    }), 'Art CID ' + imageIpfsCid);
  }
};

const postIpfsHtmlMessage = (ipfsApiUrl, jsonIpfsCid, assets) => {
  getIpfsHtmlWorkerInst.postMessage([ipfsApiUrl, jsonIpfsCid, assets, window.blacklist, window.whitelist]);
};

const addJsonImageLink = (ipfsApiUrl, jsonIpfsCid, assets) => {
  for (let assetIx = 0; assetIx < assets.length; assetIx++) {
    const asset = assets[assetIx];
    const span = document.getElementById(asset);

    span.innerHTML = 'loading image ....';
    addChildElement(span, 'br');
    addText(addChildElement(span, 'a', {
      href: `${ipfsApiUrl}/${jsonIpfsCid}`,
      target: '_blank',
    }), 'JSON CID ' + jsonIpfsCid);
  }
};

export {postIpfsHtmlMessage, addJsonImageLink};
