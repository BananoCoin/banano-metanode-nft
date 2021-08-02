self.onmessage = (e) => {
  const ipfsApiUrl = e.data[0];
  const jsonIpfsCid = e.data[1];
  const assets = e.data[2];
  console.log('onmessage', e.data);
  getIpfsHtml(ipfsApiUrl, jsonIpfsCid, assets);
};

const getIpfsHtml = async (ipfsApiUrl, jsonIpfsCid, assets) => {
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
    title = templateRsponseJson.title;
    imageIpfsCid = templateRsponseJson.art_data_ipfs_cid;
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
      html += `<h4>${title}</h4>`;
      if (imageContentType == 'image/svg+xml') {
        const text = await imageBlob.text();
        // html += `<svg title="${imageIpfsCid}" style="width:30vmin;height30vmin;" viewBox="0 0 3000 3000" width="30vmin" xmlns="http://www.w3.org/2000/svg">`;
        html += text;
        // html += '</svg>';
        // html += `<object title="${imageIpfsCid}" style="width:30vmin;height30vmin;" type="image/svg+xml" data="${text}"></object>`;
      } else if ((imageContentType == 'image/png') ||
          (imageContentType == 'image/gif') ||
          (imageContentType == 'image/png')) {
        const imageObjectUrl = URL.createObjectURL(imageBlob);
        html += `<img title="${imageIpfsCid}" style="width:30vmin;height30vmin;" src="${imageObjectUrl}"></img>`;
      } else {
        html += `Unsupported Content Type: ${imageContentType}`;
      }
    } else {
      html = 'error:' + imageResponse.status + ' ' + imageResponse.statusText;
      allowReload = 'true';
    }
  } catch (error) {
    html = 'error:' + error.message;
    allowReload = 'true';
  }

  const result = [
    html,
    assets,
    jsonIpfsCid,
    imageIpfsCid,
    allowReload,
    title,
  ];
  postMessage(result);
};
