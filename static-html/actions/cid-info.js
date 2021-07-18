import {addText, addChildElement, clear} from '../lib/dom.js';

const addCidInfo = () => {
  const wrapperElt = document.getElementById('cidInfoWrapper');
  const formElt = addChildElement(wrapperElt, 'form', {
    'method': 'POST',
    'class': '',
    'onsubmit': 'return false;',
  });
  addText(addChildElement(formElt, 'button', {
    'type': 'button', 'onclick': 'return hideViewNftTemplateWrappers();',
  }), 'Main Menu');
  addText(addChildElement(formElt, 'h2'), 'CID Info');
  addText(addChildElement(formElt, 'h3'), 'IPFS Content ID (CID)');
  const cidElt = addChildElement(formElt, 'input', {
    'id': 'cid',
    'class': '',
    'type': 'text',
    'size': '66',
    'max_length': '64',
    'value': defaultCid,
  });
  addChildElement(formElt, 'br');
  const checkCidElt = addChildElement(formElt, 'button', {
    'id': 'check-cid',
    'type': 'button',
    'class': '',
    'onclick': 'checkCid();return false;',
  });
  addText(checkCidElt, 'Get CID Info');
  addChildElement(wrapperElt, 'div', {
    'id': 'cidInfo',
    'class': 'selectable container column',
  });
};

window.checkCid = async () => {
  const cidInfoElt = document.getElementById('cidInfo');
  clear(cidInfoElt);
  const cid = document.getElementById('cid').value.trim();
  const response = await fetch('/', {
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

  let html = '';
  if (responseJson.success) {
    html += `<span><strong>Success!</strong> ipfs_cid <strong>${responseJson.ipfs_cid}</strong> has the correct information, with no errors.</span>`;
  } else {
    html += `<span><strong>Failure!</strong> ipfs_cid <strong>${responseJson.ipfs_cid}</strong> has the <strong>wrong</strong> information, with <strong>errors</strong>.</span>`;
  }
  if (responseJson.json !== undefined) {
    html += '<span class="bordered container column">';
    html += `<span><h2>json</h2></span>`;
    Object.keys(responseJson.json).forEach((key) => {
      const value = responseJson.json[key];
      html += `<span>'${key}':'${value}'</span>`;
    });
    html += `<img style="width:30vmin;height30vmin;" src="${ipfsApiUrl}/${responseJson.json.ipfs_cid}">${responseJson.json.ipfs_cid}</img>`;
    html += '</span>';
    html += '</span>';
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


  const representativePublicKey = document.getElementById('representativePublicKey');
  if (responseJson.success) {
    representativePublicKey.innerText = responseJson.json.new_representative;
  } else {
    representativePublicKey.innerText = '';
  }
  console.log('representativePublicKey', representativePublicKey.innerText);
};


export {addCidInfo};
