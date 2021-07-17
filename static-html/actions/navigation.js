import {addText, addChildElement, hide, show} from '../lib/dom.js';

const addNavigation = () => {
  const wrapperElt = document.getElementById('navigationWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'h2'), 'Welcome! What are you trying to do?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideAll();',
  }), 'Hide Everything');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showAll();',
  }), 'Show Everything');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to view your seed and account?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showSeedAndAccountWrappers();',
  }), 'Show Seed And Account');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to create a new NFT template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showCreateNftTemplateWrappers();',
  }), 'Show Tools to Create a Nft Template');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to view an existing NFT template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showViewNftTemplateWrappers();',
  }), 'Show Tools to View a Nft Template');
};

window.hideAll = () => {
  hide('seedWrapper');
  hide('accountWrapper');
  hide('cidPinWrapper');
  hide('cidInfoWrapper');
  hide('ownerCheckWrapper');
  hide('mintNftWrapper');
  hide('transferNftWrapper');
};

window.showAll = () => {
  show('seedWrapper');
  show('accountWrapper');
  show('cidPinWrapper');
  show('cidInfoWrapper');
  show('ownerCheckWrapper');
  show('mintNftWrapper');
  show('transferNftWrapper');
};

window.showSeedAndAccountWrappers = () => {
  show('seedWrapper');
  show('accountWrapper');
  hide('cidPinWrapper');
  hide('cidInfoWrapper');
  hide('ownerCheckWrapper');
  hide('mintNftWrapper');
  hide('transferNftWrapper');
};

window.showCreateNftTemplateWrappers = () => {
  hide('seedWrapper');
  hide('accountWrapper');
  show('cidPinWrapper');
  hide('cidInfoWrapper');
  hide('ownerCheckWrapper');
  hide('mintNftWrapper');
  hide('transferNftWrapper');
};

window.showViewNftTemplateWrappers = () => {
  hide('seedWrapper');
  hide('accountWrapper');
  hide('cidPinWrapper');
  show('cidInfoWrapper');
  hide('ownerCheckWrapper');
  hide('mintNftWrapper');
  hide('transferNftWrapper');
};

export {addNavigation};
