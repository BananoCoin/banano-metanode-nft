import {addText, addChildElement} from '../lib/dom.js';
import {normalizeSvgs} from '../lib/svg.js';
import {shorten} from '../lib/asset-name.js';

const getIpfsHtmlWorkerInst = new Worker('./workers/get-ipfs-html.js', {type: 'module'});

window.reloadTemplateAssets = (templateJson, assets) => {
  // no blacklist or whitelist means load everything.
  getIpfsHtmlWorkerInst.postMessage([ipfsApiUrl, JSON.parse(templateJson), JSON.parse(assets)]);
};

getIpfsHtmlWorkerInst.onmessage = function(e) {
  const html = e.data[0];
  const assets = e.data[1];
  const templateJson = e.data[2];
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
    addText(
        addChildElement(span, 'button', {
          type: 'button',
          class: '',
          onclick: `reloadTemplateAssets('${JSON.stringify(templateJson)}', '${JSON.stringify(assets)}');return false;`,
        }),
        'Reload Template ' + shorten(templateJson.ipfs_cid),
    );
    addChildElement(span, 'br');
    addText(
        addChildElement(span, 'a', {
          href: `${ipfsApiUrl}/${templateJson.ipfs_cid}`,
          target: '_blank',
        }),
        'JSON CID ' + templateJson.ipfs_cid,
    );
    addChildElement(span, 'br');
    addText(
        addChildElement(span, 'a', {
          href: `${ipfsApiUrl}/${imageIpfsCid}`,
          target: '_blank',
        }),
        'Art CID ' + imageIpfsCid,
    );
  }
};

const postIpfsHtmlMessage = (ipfsApiUrl, templateJson, assets) => {
  getIpfsHtmlWorkerInst.postMessage([ipfsApiUrl, templateJson, assets, window.blacklist, window.whitelist]);
};

const addJsonImageLink = (ipfsApiUrl, artIpfsCid, assets) => {
  for (let assetIx = 0; assetIx < assets.length; assetIx++) {
    const asset = assets[assetIx];
    const span = document.getElementById(asset);

    span.innerHTML = 'loading image ....';
    addChildElement(span, 'br');
    addText(
        addChildElement(span, 'a', {
          href: `${ipfsApiUrl}/${artIpfsCid}`,
          target: '_blank',
        }),
        'ART CID ' + artIpfsCid,
    );
  }
};

export {postIpfsHtmlMessage, addJsonImageLink};
