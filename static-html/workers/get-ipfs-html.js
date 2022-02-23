self.onmessage = (e) => {
  const ipfsApiUrl = e.data[0];
  const jsonIpfsCid = e.data[1];
  const assets = e.data[2];
  const blacklist = e.data[3];
  const whitelist = e.data[4];
  console.log('onmessage', e.data);
  getIpfsHtml(ipfsApiUrl, jsonIpfsCid, assets, blacklist, whitelist);
};

const getIpfsHtml = async (ipfsApiUrl, jsonIpfsCid, assets, blacklist, whitelist) => {
  let html = '';
  let imageIpfsCid = '';
  let allowReload = 'true';
  let title = '';
  try {
    const templateUrl = ipfsApiUrl + '/' + jsonIpfsCid;
    console.log('templateUrl', templateUrl);
    const templateResponse = await fetch(templateUrl, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
    });
    const templateRsponseJson = await templateResponse.json();
    const issuer = templateRsponseJson.issuer;
    title = templateRsponseJson.title;
    imageIpfsCid = templateRsponseJson.art_data_ipfs_cid;
    if (blacklist !== undefined && blacklist.includes(issuer)) {
      html += `<h4>Blacklisted</h4>`;
    } else {
      html += `<h4>${title}</h4>`;
      if (whitelist === undefined || whitelist.includes(issuer)) {
        const imageUrl = ipfsApiUrl + '/' + imageIpfsCid;
        const imageResponse = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'content-type': 'image',
          },
        });
        const imageContentType = imageResponse.headers.get('content-type');

        if (imageResponse.status === 200) {
          const imageBlob = await imageResponse.blob();
          if (imageContentType == 'image/svg+xml') {
            const text = await imageBlob.text();
            // html += text;
            const svg = `data:image/svg+xml;base64,${btoa(text)}`;
            html += `<object title="${imageIpfsCid}" style="width:30vmin;height30vmin;" type="image/svg+xml" data="${svg}"></object>`;
          } else if (imageContentType == 'image/png' || imageContentType == 'image/gif' || imageContentType == 'image/png') {
            const imageObjectUrl = URL.createObjectURL(imageBlob);
            html += `<img title="${imageIpfsCid}" style="width:30vmin;height30vmin;" src="${imageObjectUrl}"></img>`;
          } else {
            html += `Unsupported Content Type: ${imageContentType}`;
          }
        } else {
          html = 'error:' + imageResponse.status + ' ' + imageResponse.statusText;
          allowReload = 'true';
        }
      } else {
        html += `<h4>Not Whitelisted</h4>`;
        html += 'click button to show image<br>';
      }
    }
  } catch (error) {
    html = 'error:' + error.message;
    allowReload = 'true';
  }

  const result = [html, assets, jsonIpfsCid, imageIpfsCid, allowReload, title];
  postMessage(result);
};
