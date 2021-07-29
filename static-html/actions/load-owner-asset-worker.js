onmessage = (e) => {
  const ipfsApiUrl = e.data[0];
  const jsonIpfsCid = e.data[1];
  const assets = e.data[2];
  console.log('onmessage', e.data);


  loadOwnerAssetWorker(ipfsApiUrl, jsonIpfsCid, assets);
};

const loadOwnerAssetWorker = async (ipfsApiUrl, jsonIpfsCid, assets) => {
  let html = '';
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
    const title = templateRsponseJson.title;
    const imageIpfsCid = templateRsponseJson.art_data_ipfs_cid;
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
        html += `<object title="${imageIpfsCid}" width="30vmin" type="image/svg+xml" data="${imageBlob}"></object>`;
      } else {
        console.log(`defaulting to image for content type ${imageContentType}`);
        // console.log('imageBlob', imageBlob);
        const imageObjectUrl = URL.createObjectURL(imageBlob);
        html += `<img title="${imageIpfsCid}" style="width:30vmin;height30vmin;" src="${imageObjectUrl}"></img>`;
      }
    } else {
      html = 'error:' + imageResponse.status + ' ' + imageResponse.statusText;
    }
  } catch (error) {
    html = 'error:' + error.message;
  }

  const result = [
    html,
    assets,
  ];
  postMessage(result);
};
