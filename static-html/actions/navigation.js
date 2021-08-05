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
    'type': 'button', 'onclick': 'return showSeedAndAccountWrapper();',
  }), 'Show Seed And Account');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to view your owned assets?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showOwnerAssetCheckWrapper();',
  }), 'Show Owned Assets');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to view all known templates?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showGalleryWrapper();',
  }), 'Show Gallery');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to create a new NFT template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showCreateNftTemplateWrapper();',
  }), 'Show Tools to Create a Nft Template');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to view an existing NFT template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showViewNftTemplateWrapper();',
  }), 'Show Tools to View a Nft Template');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to check ownership an existing NFT template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showTemplateOwnerCheckWrapper();',
  }), 'Show Tools to Check Ownership of an Nft Template');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to mint a new NFT asset from a template?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showMintNftWrapper();',
  }), 'Show Tools to Mint a new Asset from a Nft Template');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to transfer an existing NFT asset to a new owner?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showTransferNftWrapper();',
  }), 'Show Tools to Transfer an existing Asset to a new Owner');

  addText(addChildElement(formElt, 'h3'), 'Are you trying to share a link to a section?');
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return showLinkWrapper();',
  }), 'Show Links');
  addAllWrapperLinks();
};

const addAllWrapperLinks = () => {
  const wrapperElt = document.getElementById('linkWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideLinkWrapper();',
  }), 'Main Menu');

  const addLink = (name) => {
    addText(addChildElement(wrapperElt, 'a', {
      target: '_blank',
      href: `#show${name}`,
    }), name);
    addChildElement(wrapperElt, 'br');
  };
  addLink('SeedAndAccount');
  addLink('CreateNftTemplate');
  addLink('ViewNftTemplate');
  addLink('TemplateOwnerCheck');
  addLink('MintNft');
  addLink('TransferNft');
  addLink('OwnerAssetCheck');
  addLink('Gallery');
  addLink('Link');
};

window.hideAll = () => {
  hide('seedWrapper');
  hide('accountWrapper');
  hide('cidPinWrapper');
  hide('cidInfoWrapper');
  hide('templateOwnerCheckWrapper');
  hide('mintNftWrapper');
  hide('transferNftWrapper');
  hide('galleryWrapper');
  hide('linkWrapper');
};

window.showAll = () => {
  show('seedWrapper');
  show('accountWrapper');
  show('cidPinWrapper');
  show('cidInfoWrapper');
  show('templateOwnerCheckWrapper');
  show('mintNftWrapper');
  show('transferNftWrapper');
  show('galleryWrapper');
  show('linkWrapper');
};

window.showSeedAndAccountWrapper = () => {
  hide('navigationWrapper');
  show('seedWrapper');
  show('accountWrapper');
};

window.hideSeedAndAccountWrapper = () => {
  show('navigationWrapper');
  hide('seedWrapper');
  hide('accountWrapper');
};

window.showCreateNftTemplateWrapper = () => {
  hide('navigationWrapper');
  show('cidPinWrapper');
};

window.hideCreateNftTemplateWrapper = () => {
  show('navigationWrapper');
  hide('cidPinWrapper');
};

window.showViewNftTemplateWrapper = () => {
  hide('navigationWrapper');
  show('cidInfoWrapper');
};

window.hideViewNftTemplateWrapper = () => {
  show('navigationWrapper');
  hide('cidInfoWrapper');
};

window.showTemplateOwnerCheckWrapper = () => {
  hide('navigationWrapper');
  show('templateOwnerCheckWrapper');
};

window.hideTemplateOwnerCheckWrapper = () => {
  show('navigationWrapper');
  hide('templateOwnerCheckWrapper');
};

window.showMintNftWrapper = () => {
  hide('navigationWrapper');
  show('mintNftWrapper');
};

window.hideMintNftWrapper = () => {
  show('navigationWrapper');
  hide('mintNftWrapper');
};

window.showTransferNftWrapper = () => {
  hide('navigationWrapper');
  show('transferNftWrapper');
};

window.hideTransferNftWrapper = () => {
  show('navigationWrapper');
  hide('transferNftWrapper');
};

window.showOwnerAssetCheckWrapper = () => {
  hide('navigationWrapper');
  show('ownerAssetCheckWrapper');
};

window.hideOwnerAssetCheckWrapper = () => {
  show('navigationWrapper');
  hide('ownerAssetCheckWrapper');
};

window.showGalleryWrapper = () => {
  hide('navigationWrapper');
  show('galleryWrapper');
};

window.hideGalleryWrapper = () => {
  show('navigationWrapper');
  hide('galleryWrapper');
};

window.showLinkWrapper = () => {
  hide('navigationWrapper');
  show('linkWrapper');
};

window.hideLinkWrapper = () => {
  show('navigationWrapper');
  hide('linkWrapper');
};

export {addNavigation};
