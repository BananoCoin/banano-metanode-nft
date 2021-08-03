import {addText, addChildElement} from '../lib/dom.js';
import {shorten} from '../lib/asset-name.js';
import {postIpfsHtmlMessage, addJsonImageLink} from '../lib/ipfs-html.js';

const addGallery = () => {
  const wrapperElt = document.getElementById('galleryWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideGalleryWrappers();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'Gallery');

  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'gallery',
    'type': 'button',
    'class': '',
    'onclick': 'loadGallery();return false;',
  });
  addText(checkCidElt, 'Load Gallery');
  addChildElement(wrapperElt, 'div', {
    'id': 'galleryInfo',
    'class': 'selectable container column',
  });
  addText(addChildElement(formElt, 'button', {
    'id': 'refreshCidList',
    'type': 'button',
    'class': '',
    'onclick': 'getKnownTemplateList();return false;',
  }), 'Refresh Template List');
};


window.loadGallery = async () => {
  console.log('loadGallery');
  galleryInfo.innerHTML = 'pending...';


  const dataListElt = document.getElementById('knownTemplateList');

  console.log(dataListElt);

  const callback = async () => {
    const templatesToLoad = [];

    for (let ix = 0; ix < dataListElt.options.length; ix++) {
      const value = dataListElt.options[ix].value;
      templatesToLoad.push(value);
    }

    let timer = 0;
    templatesToLoad.forEach((jsonIpfsCid) => {
      const id = `gallery-${jsonIpfsCid}`;
      const elt = addChildElement(galleryInfo, 'span', {
        id: id,
        class: 'bordered',
      });
      const assets = [id];
      addJsonImageLink(ipfsApiUrl, jsonIpfsCid, assets);
      const fn = () => {
        postIpfsHtmlMessage(ipfsApiUrl, jsonIpfsCid, assets);
      };
      setTimeout(fn, timer);

      timer+= 1000;
    });
  };
  setTimeout(callback, 0);
};

export {addGallery};
