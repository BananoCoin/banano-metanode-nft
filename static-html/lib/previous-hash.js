const getPreviousHash = async () => {
  const seed = window.localStorage.seed;
  const account = await window.bananocoinBananojs.getBananoAccountFromSeed(seed, seedIx);
  console.log('getPreviousHash', 'account', account);
  const accountInfo = await window.bananocoinBananojs.getAccountInfo(account, true);
  console.log('getPreviousHash', 'accountInfo', accountInfo);
  const previousHash = accountInfo.frontier;
  console.log('getPreviousHash', 'previousHash', previousHash);
  return previousHash;
};

export { getPreviousHash };
