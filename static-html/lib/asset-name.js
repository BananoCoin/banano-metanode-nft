const shorten = (asset) => {
  if (asset === undefined) {
    return '';
  }
  if (asset.length < 8) {
    return asset;
  }
  const front = asset.substring(0, 4);
  const back = asset.substring(asset.length-4);
  return front + '...' + back;
};

export {shorten};
