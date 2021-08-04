import {addText, addChildElement, clear} from '../lib/dom.js';
import {postIpfsHtmlMessage, addJsonImageLink} from '../lib/ipfs-html.js';

const addCidInfo = () => {
  const wrapperElt = document.getElementById('cidInfoWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideViewNftTemplateWrapper();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'CID Info');
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');
  addChildElement(formElt, 'input', {
    'id': 'cid',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'placeholder': 'select from drop down',
    'list': 'knownTemplateList',
    'autocomplete': 'off',
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'check-cid',
    'type': 'button',
    'class': '',
    'onclick': 'checkCid();return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button',
    'class': '',
    'onclick': 'clearCid();getKnownTemplateList();return false;',
  }), 'Refresh Template List');
  addText(checkCidElt, 'Get CID Info');
  addChildElement(wrapperElt, 'div', {
    'id': 'cidInfo',
    'class': 'selectable container column',
  });
};


window.clearCid = () => {
  document.getElementById('cid').value = '';
};

window.checkCid = async () => {
  const cidInfoElt = document.getElementById('cidInfo');
  clear(cidInfoElt);
  const cid = document.getElementById('cid').value.trim();
  const response = await fetch(nftApiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: `{"action": "get_nft_info" ,"ipfs_cid":"${cid}"}`,
  });
  if (response.status != 200) {
    html += `<span><strong>Failure!</strong> ipfs_cid <strong>${cid}</strong> has the <strong>wrong</strong> information, with <strong>errors</strong>.</span>`;
    html += `<span><h2>errors</h2></span>`;
    html += `<span><h3>Pleae be patient if a newly created JSON does not appear immediately.</h3></span>`;
    html += `<span>${response.status}:${response.statusText}</span>`;
    cidInfoElt.innerHTML = html;
    return;
  }
  const responseJson = await response.json();
  const assets = [];
  let jsonIpfsCid = '';

  let html = '';
  if (responseJson.success) {
    html += `<span><strong>Success!</strong> ipfs_cid `+
    `<strong>${responseJson.ipfs_cid}</strong> has the `+
    `correct information, with no errors.</span>`;
  } else {
    html += `<span><strong>Failure!</strong> ipfs_cid `+
    `<strong>${responseJson.ipfs_cid}</strong> has the `+
    `<strong>wrong</strong> information, with <strong>errors</strong>.</span>`;
  }
  if (responseJson.json !== undefined) {
    html += '<span class="bordered container column">';
    html += `<span><h2>json</h2></span>`;
    Object.keys(responseJson.json).forEach((key) => {
      const value = responseJson.json[key];
      html += `<span>'${key}':'${value}'</span>`;
    });

    html += `<span id="cidInfoAsset">loading image ....</span>`;

    // TODO: use responseJson.json.art_data_ipfs_cid;
    // as the use of responseJson.ipfs_cid causes an extra step.
    jsonIpfsCid = responseJson.ipfs_cid;
    assets.push('cidInfoAsset');
  }
  if (responseJson.errors !== undefined) {
    html += '<span class="bordered container column">';
    html += `<span><h2>errors</h2></span>`;
    responseJson.errors.forEach((error) => {
      html += `<span>${error}</span>`;
    });
    html += '</span>';
  }

  cidInfoElt.innerHTML = html;

  addJsonImageLink(ipfsApiUrl, jsonIpfsCid, assets);
  if (assets.length > 0) {
    postIpfsHtmlMessage(ipfsApiUrl, jsonIpfsCid, assets);
  }
};

export {addCidInfo};
