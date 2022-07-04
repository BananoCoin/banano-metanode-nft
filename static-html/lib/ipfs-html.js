import {addText, addChildElement} from '../lib/dom.js';
import {normalizeSvgs} from '../lib/svg.js';
import {shorten} from '../lib/asset-name.js';

const getIpfsHtmlWorkerInst = new Worker('./workers/get-ipfs-html.js', {type: 'module'});

window.reloadTemplateAssets = (templateJsonCid, assets) => {
  console.log('ipfs-html', 'reloadTemplateAssets', {templateJsonCid: templateJsonCid, assets: assets});
  // no blacklist or whitelist means load everything.
  getIpfsHtmlWorkerInst.postMessage([ipfsApiUrl, templateJsonCid, JSON.parse(assets)]);
};

getIpfsHtmlWorkerInst.onmessage = function(e) {
  const html = e.data[0];
  const assets = e.data[1];
  const templateJsonCid = e.data[2];
  const imageIpfsCid = e.data[3];
  const allowReload = e.data[4];
  const title = e.data[5];
  console.log('ipfs-html', 'getIpfsHtmlWorkerInst.onmessage', 'e.data', e.data);
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
          onclick: `reloadTemplateAssets('${templateJsonCid}', '${JSON.stringify(assets)}');return false;`,
        }),
        'Reload Template ' + shorten(templateJsonCid),
    );
    addChildElement(span, 'br');
    addText(
        addChildElement(span, 'a', {
          href: `${ipfsApiUrl}/${templateJsonCid}`,
          target: '_blank',
        }),
        'JSON CID ' + templateJsonCid,
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

const postIpfsHtmlMessage = (ipfsApiUrl, templateJsonCid, assets) => {
  getIpfsHtmlWorkerInst.postMessage([ipfsApiUrl, templateJsonCid, assets, window.blacklist, window.whitelist]);
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
