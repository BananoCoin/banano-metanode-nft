import {addText, addChildElement} from '../lib/dom.js';
import {postIpfsHtmlMessage, addJsonImageLink} from '../lib/ipfs-html.js';

const addGallery = () => {
  const wrapperElt = document.getElementById('galleryWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    method: 'POST',
    class: '',
    onsubmit: 'return false;',
  });
  addText(
      addChildElement(formElt, 'button', {
        type: 'button',
        onclick: 'return hideGalleryWrapper();',
      }),
      'Main Menu',
  );
  addText(addChildElement(formElt, 'h2'), 'Gallery');
  const shareHrefElt = addChildElement(formElt, 'a', {
    target: '_blank',
    href: '#showGallery',
  });
  addText(shareHrefElt, 'Share');

  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    id: 'gallery',
    type: 'button',
    class: '',
    onclick: 'loadGallery();return false;',
  });
  addText(checkCidElt, 'Load Gallery');
  addChildElement(wrapperElt, 'div', {
    id: 'galleryInfo',
    class: 'selectable container column',
  });
  addText(
      addChildElement(formElt, 'button', {
        id: 'refreshCidList',
        type: 'button',
        class: '',
        onclick: 'getKnownTemplateList();return false;',
      }),
      'Refresh Template List',
  );
};

window.loadGallery = async () => {
  console.log('loadGallery');
  const galleryInfo = document.getElementById('galleryInfo');

  galleryInfo.innerHTML = 'pending...';

  const dataListElt = document.getElementById('knownTemplateList');

  console.log(dataListElt);

  const callback = async () => {
    const templatesToLoad = [];

    for (let ix = 0; ix < dataListElt.options.length; ix++) {
      const value = dataListElt.options[ix].value;
      templatesToLoad.push(value);
    }
    const elt = addChildElement(galleryInfo, 'span', {
      class: 'bordered container row',
    });
    let timer = 0;
    templatesToLoad.forEach((jsonIpfsCid) => {
      const id = `gallery-${jsonIpfsCid}`;
      const innerElt = addChildElement(elt, 'span', {});
      addChildElement(innerElt, 'span', {
        id: id,
      });

      const assets = [id];
      addJsonImageLink(ipfsApiUrl, jsonIpfsCid, assets);
      const fn = () => {
        postIpfsHtmlMessage(ipfsApiUrl, jsonIpfsCid, assets);
      };
      setTimeout(fn, timer);

      timer += 1000;
    });
  };
  setTimeout(callback, 0);
};

export {addGallery};
