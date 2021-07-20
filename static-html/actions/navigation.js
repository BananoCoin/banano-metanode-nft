import {addText, addChildElement, hide, show} from '../lib/dom.js';

const addNavigation = () => {
  const wrapperElt = document.getElementById('navigationWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
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

  addText(addChildElement(formElt, 'h3'), 'Are you trying to check ownership an existing NFT template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showTemplateOwnerCheckWrappers();',
  }), 'Show Tools to Check Ownership of an Nft Template');
};

window.hideAll = () => {
  hide('seedWrapper');
  hide('accountWrapper');
  hide('cidPinWrapper');
  hide('cidInfoWrapper');
  hide('templateOwnerCheckWrapper');
  hide('mintNftWrapper');
  hide('transferNftWrapper');
};

window.showAll = () => {
  show('seedWrapper');
  show('accountWrapper');
  show('cidPinWrapper');
  show('cidInfoWrapper');
  show('templateOwnerCheckWrapper');
  show('mintNftWrapper');
  show('transferNftWrapper');
};

window.showSeedAndAccountWrappers = () => {
  hide('navigationWrapper');
  show('seedWrapper');
  show('accountWrapper');
};

window.hideSeedAndAccountWrappers = () => {
  show('navigationWrapper');
  hide('seedWrapper');
  hide('accountWrapper');
};

window.showCreateNftTemplateWrappers = () => {
  hide('navigationWrapper');
  show('cidPinWrapper');
};

window.hideCreateNftTemplateWrappers = () => {
  show('navigationWrapper');
  hide('cidPinWrapper');
};

window.showViewNftTemplateWrappers = () => {
  hide('navigationWrapper');
  show('cidInfoWrapper');
};

window.hideViewNftTemplateWrappers = () => {
  show('navigationWrapper');
  hide('cidInfoWrapper');
};

window.showTemplateOwnerCheckWrappers = () => {
  hide('navigationWrapper');
  show('templateOwnerCheckWrapper');
};

window.hideTemplateOwnerCheckWrappers = () => {
  show('navigationWrapper');
  hide('templateOwnerCheckWrapper');
};

export {addNavigation};
