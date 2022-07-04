self.onmessage = (e) => {
  const ipfsApiUrl = e.data[0];
  const templateJson = e.data[1];
  const assets = e.data[2];
  const blacklist = e.data[3];
  const whitelist = e.data[4];
  console.log('get-ipfs-html', 'onmessage', e.data);
  getIpfsHtml(ipfsApiUrl, templateJson, assets, blacklist, whitelist);
};

const getIpfsHtml = async (ipfsApiUrl, templateJsonCid, assets, blacklist, whitelist) => {
  let html = '';
  let imageIpfsCid = '';
  let allowReload = 'true';
  let title = '';
  let templateJson = {};
  try {
    const templateJsonUrl = ipfsApiUrl + '/' + templateJsonCid;
    const templateJsonResponse = await fetch(templateJsonUrl, {
      method: 'GET',
      // headers: {
      //   'content-type': 'application/json',
      // },
    });
    const templateJsonResponseContentType = templateJsonResponse.headers.get('content-type');
    if ((templateJsonResponse.status === 200) &&
        templateJsonResponseContentType &&
        (templateJsonResponseContentType.indexOf('application/json') !== -1)) {
      templateJson = await templateJsonResponse.json();
      console.log('get-ipfs-html', 'templateJson', templateJson);
      const issuer = templateJson.issuer;
      title = templateJson.title;
      if (templateJson.art_data_ipfs_cid) {
        imageIpfsCid = templateJson.art_data_ipfs_cid;
      }
      if (templateJson.image) {
        imageIpfsCid = templateJson.image;
      }
      if (blacklist !== undefined && blacklist.includes(issuer)) {
        html += `<h4>Blacklisted</h4>`;
      } else {
        html += `<h4>${title}</h4>`;
        if (whitelist === undefined || whitelist.includes(issuer)) {
          const imageUrl = ipfsApiUrl + '/' + imageIpfsCid;
          const imageResponse = await fetch(imageUrl, {
            method: 'GET',
            // headers: {
            //   'content-type': 'image',
            // },
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
            html = 'error:' + imageResponse.status + ' ' + imageResponse.statusText + ` content type '${imageContentType}`;
            allowReload = 'true';
          }
        } else {
          html += `<h4>Not Whitelisted</h4>`;
          html += 'click button to show image<br>';
        }
      }
    } else {
      html = 'error:' + templateJsonResponse.status + ' ' + templateJsonResponse.statusText + ` content type '${templateJsonResponseContentType}`;
      allowReload = 'true';
    }
  } catch (error) {
    html = 'error:' + error.message;
    allowReload = 'true';
  }

  const result = [html, assets, templateJsonCid, imageIpfsCid, allowReload, title];
  postMessage(result);
};
