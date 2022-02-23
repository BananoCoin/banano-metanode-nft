const getRandomHex32 = () => {
  const array = new Uint32Array(32);
  window.crypto.getRandomValues(array);
  const hex = getByteArrayAsHexString(array);
  return hex;
};

const getByteArrayAsHexString = (byteArray) => {
  return Array.prototype.map
    .call(byteArray, (byte) => {
      return ('0' + (byte & 0xff).toString(16)).slice(-2);
    })
    .join('');
};

export { getRandomHex32 };
