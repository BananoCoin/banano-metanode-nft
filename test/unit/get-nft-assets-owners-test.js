'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-assets-owners.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');

// constants
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const badContentTypeIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWABADCT';
const badTimeoutIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQBADTIME';
const badUnknownIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciqBADUNKNOWN';
const badJsonIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQBADJSON';
const badMissingJsonIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUBAD2MISSINGJSON';
const badJsonBase58Cid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfBADJSONBASE58';
const badJsonBase58ShortCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knBADJSONBASE58SHORT';
const badAbortIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAABORT';
const badAbortOtherIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciqABORTOTHER';
const goodHead = '0000000000000000000000000000000000000000000000000000000000000000';
const goodLink = '0000000000000000000000000000000000000000000000000000000000000001';
const goodOwner4link = '0000000000000000000000000000000000000000000000000000000000000002';
const goodReceiveHash3 = '0000000000000000000000000000000000000000000000000000000000000003';
const goodSendHash4 = '0000000000000000000000000000000000000000000000000000000000000004';
const goodSendHash6 = '0000000000000000000000000000000000000000000000000000000000000006';
const nextHead = '0000000000000000000000000000000000000000000000000000000000000007';
const goodReceiveHash8 = '0000000000000000000000000000000000000000000000000000000000000008';
const goodSendHashA = '000000000000000000000000000000000000000000000000000000000000000A';
const goodOwnerBlink = '000000000000000000000000000000000000000000000000000000000000000B';
const goodReceiveHashC = '000000000000000000000000000000000000000000000000000000000000000C';
const goodOwner3 = 'ban_1111111111111111111111111111111111111111111111111113b8661hfk';
const goodOwner4 = 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c';
const goodOwner6 = 'ban_1111111111111111111111111111111111111111111111111116i3bqjdmq';
const goodOwnerB = 'ban_111111111111111111111111111111111111111111111111111d7qqrs8tn';
const goodAssetRep = 'ban_19bek3pyy9ky1k43utawjfky3wuw84jxaq5c7j4nznsktca8z5cqrfg8egjn';

const DEBUG = false;

const LOG = false;

const config = {
  fetchTimeout: 0,
  ipfsApiUrl: 'ipfsApiUrlValue',
  bananodeApiUrl: 'bananodeApiUrlValue',
};
const loggingUtil = {};
loggingUtil.trace = console.trace;
if (DEBUG) {
  loggingUtil.debug = console.log;
  loggingUtil.log = console.log;
} else {
  if (LOG) {
    loggingUtil.log = console.log;
    loggingUtil.debug = () => {};
  } else {
    loggingUtil.log = () => {};
    loggingUtil.debug = () => {};
  }
}

// variables

// functions
const getResponse = (context, ipfsCd) => {
  const actions = {};
  actionUtil.addAction(actions);
  const fn = actions[actionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = {};
    req.body.ipfs_cid = ipfsCd;
    const res = {};
    res.send = (sent) => {
      loggingUtil.debug('called', fn, sent);
      resolve(sent);
    };
    loggingUtil.debug('calling', fn);
    fn(context, req, res)
        .catch((error) => {
          loggingUtil.debug('error', fn, error);
          resolve({
            success: false,
            errors: [error.message],
          });
        });
  });
};

describe(actionUtil.ACTION, () => {
  const getContext = (histories) => {
    return {
      bananojs: bananojs,
      dataUtil: {
      },
      fetch: (resource, options) => {
        loggingUtil.debug('fetch', resource, options);
        if (resource == `${config.ipfsApiUrl}/${goodIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'application/json';
                  }
                },
              },
              json: () => {
                return {
                  'command': 'mint_nft',
                  'version': '',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'ipfs_cid': goodIpfsCid,
                  'mint_previous': goodHead,
                };
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badContentTypeIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'text/plain';
                  }
                },
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badTimeoutIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 408,
              statusText: 'Request Timeout',
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'text/plain';
                  }
                },
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badUnknownIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 451,
              statusText: 'Unavailable For Legal Reasons',
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'text/plain';
                  }
                },
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badJsonIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'application/json';
                  }
                },
              },
              json: () => {
                return {
                  'command': 'mint_nft',
                  'version': '',
                  'title': '',
                  'issuer': '',
                  'max_supply': '',
                  'ipfs_cid': '',
                  'mint_previous': '',
                };
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badMissingJsonIpfsCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'application/json';
                  }
                },
              },
              json: () => {
                return {
                };
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badJsonBase58Cid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'application/json';
                  }
                },
              },
              json: () => {
                return {
                  'command': 'mint_nft',
                  'version': '',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'ipfs_cid': 'Qm#',
                  'mint_previous': 'AB',
                };
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badJsonBase58ShortCid}`) {
          return new Promise(async (resolve) => {
            resolve({
              status: 200,
              headers: {
                get: (header) => {
                  if (header == 'content-type') {
                    return 'application/json';
                  }
                },
              },
              json: () => {
                return {
                  'command': 'mint_nft',
                  'version': '',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'ipfs_cid': 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzz',
                  'mint_previous': 'AB',
                };
              },
            });
          });
        }
        if (resource == `${config.ipfsApiUrl}/${badAbortIpfsCid}`) {
          return new Promise(async (resolve, reject) => {
            reject(Error('The user aborted a request.'));
          });
        }

        if (resource == `${config.ipfsApiUrl}/${badAbortOtherIpfsCid}`) {
          return new Promise(async (resolve, reject) => {
            reject(Error('The user aborted a request with a wierd message.'));
          });
        }

        if (resource == config.bananodeApiUrl) {
          const body = JSON.parse(options.body);
          if (body.action == 'account_history') {
            for (let historiesIx = 0; historiesIx < histories.length; historiesIx++) {
              const historiesElt = histories[historiesIx];
              const head = historiesElt.head;
              const account = historiesElt.account;
              loggingUtil.debug('histories check', body.head, head, body.account, account);

              let match = false;
              if (body.head !== undefined) {
                if (body.head == head) {
                  loggingUtil.debug('histories match head', body.head, head);
                  match = true;
                }
              }
              if (body.account !== undefined) {
                if (body.account == account) {
                  loggingUtil.debug('histories match account', body.account, account);
                  match = true;
                }
              }

              if (match) {
                return new Promise(async (resolve) => {
                  resolve({
                    json: () => {
                      const history = historiesElt.history;
                      // if(history == undefined) {
                      //   console.trace('history', body.account, history == undefined);
                      // }
                      return {
                        history: history,
                      };
                    },
                  });
                });
              }
            }

            throw Error(`cannot match options.body '${options.body}' with any histories ${JSON.stringify(histories)}`);
          }
          throw Error(`unknown resource '${resource}'`);
        }

        return new Promise(async (resolve) => {
          resolve();
        });
      },
    };
  };
  it('get status 200 goodIpfsCid no owner', async () => {
    const context = getContext([{
      head: goodHead,
      history: [
        {
          hash: '',
          representative: '',
          link: '',
        },
      ]},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid no account history', async () => {
    const context = getContext([{
      head: goodHead,
      history: [
        {
          hash: goodSendHash4,
          representative: goodAssetRep,
          link: goodLink,
        },
      ]}, {account: goodOwner3},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [],
          owner: goodOwner3,
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid no head history', async () => {
    const context = getContext([
      {head: goodHead, history: []},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: false,
      errors: [
        'no history',
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid undefined head history', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodLink,
          },
        ],
      },
      {
        head: nextHead,
        account: goodOwner3,
      },
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [],
          owner: goodOwner3,
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid one owner with receive', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'state',
            subtype: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
        history: [
          {
            type: 'state',
            subtype: 'receive',
            hash: goodReceiveHash3,
            representative: goodOwner6,
            link: goodSendHash4,
          },
        ],
      },
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [
            {
              'owner': goodOwner4,
              'receive': goodReceiveHash3,
              'send': goodSendHash4,
            },
          ],
          owner: goodOwner4,
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid one owner no receive', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
      },
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [],
          owner: goodOwner4,
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid two owners sent to unopened account', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHashC,
            representative: goodOwner6,
            link: '',
          },
          {
            type: 'receive',
            hash: goodReceiveHash3,
            representative: goodOwner6,
            link: goodSendHash4,
          },
          {
            hash: goodSendHash6,
            representative: goodOwner4,
            link: goodOwnerBlink,
            type: 'send',
          },
          {
            hash: goodSendHash6,
            representative: goodOwner6,
            link: goodOwnerBlink,
            type: 'send',
          },
        ],
      },
      {
        account: goodOwnerB,
      },
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          owner: goodOwnerB,
          history: [
            {
              owner: goodOwner4,
              receive: goodReceiveHash3,
              send: goodSendHash4,
            },
            {
              owner: goodOwnerB,
              receive: '',
              send: goodSendHash6,
            },
          ],
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 goodIpfsCid two owners with receive', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner4link,
            type: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHash3,
            representative: goodOwner6,
            link: goodSendHash4,
          },
          {
            hash: goodSendHash6,
            representative: goodOwner4,
            link: goodOwnerBlink,
            type: 'send',
          },
          {
            hash: goodSendHashA,
            representative: goodOwner6,
            link: goodOwnerBlink,
            type: 'send',
          },
        ],
      },
      {
        head: goodReceiveHash8,
      },
      {
        account: goodOwnerB,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHash8,
            representative: goodOwner6,
            link: goodSendHashA,
          },
        ],
      },
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          asset: goodSendHash4,
          owner: goodOwnerB,
          history: [
            {
              owner: goodOwner4,
              receive: goodReceiveHash3,
              send: goodSendHash4,
            },
            {
              owner: goodOwnerB,
              receive: goodReceiveHash8,
              send: goodSendHashA,
            },
          ],
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badContentTypeIpfsCid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badContentTypeIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'text/plain',
      'errors': [
        'unsupported content_type',
      ],
      'ipfs_cid': badContentTypeIpfsCid,
      'status': 200,
      'success': false,

    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badTimeoutIpfsCid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badTimeoutIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'errors': [
        'Request Timeout',
      ],
      'ipfs_cid': badTimeoutIpfsCid,
      'status': 408,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badUnknownIpfsCid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badUnknownIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'errors': [
        'unknown error from IPFS CID lookup',
        'status:451',
        'statusText:Unavailable For Legal Reasons',
      ],
      'ipfs_cid': badUnknownIpfsCid,
      'status': 451,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badJsonIpfsCid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badJsonIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'max_supply:\'\' not an integer',
        'ipfs_cid:\'\' not Qm+base58',
        'mint_previous:\'\' not 64 hex characters',
      ],
      'ipfs_cid': badJsonIpfsCid,
      'json': {
        'command': 'mint_nft',
        'ipfs_cid': '',
        'issuer': '',
        'max_supply': '',
        'mint_previous': '',
        'title': '',
        'version': '',
      },
      'status': 200,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badMissingJsonIpfsCid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badMissingJsonIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'command:\'undefined\' !== \'mint_nft\'',
        'version undefined',
        'title undefined',
        'issuer undefined',
        'max_supply undefined',
        'ipfs_cid undefined',
        'mint_previous undefined',
      ],
      'ipfs_cid': badMissingJsonIpfsCid,
      'json': {},
      'status': 200,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badJsonBase58Cid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badJsonBase58Cid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'ipfs_cid:\'Qm#\' not Qm+base58',
        'mint_previous:\'AB\' not 64 hex characters',
      ],
      'ipfs_cid': badJsonBase58Cid,
      'json': {
        'command': 'mint_nft',
        'ipfs_cid': 'Qm#',
        'issuer': '',
        'max_supply': '1',
        'mint_previous': 'AB',
        'title': '',
        'version': '',
      },
      'status': 200,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badJsonBase58ShortCid', async () => {
    const context = getContext();
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badJsonBase58ShortCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'ipfs_cid_hex:\'500080c4b27277b22c373e4f0dbbc86091707c6cc1745a1b3efcf66664bbde9ceb\' not 64 hex characters after prefix 1220, 66',
        'mint_previous:\'AB\' not 64 hex characters',
      ],
      'ipfs_cid': badJsonBase58ShortCid,
      'json': {
        'command': 'mint_nft',
        'ipfs_cid': 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzz',
        'ipfs_cid_hex': '500080c4b27277b22c373e4f0dbbc86091707c6cc1745a1b3efcf66664bbde9ceb',
        'ipfs_cid_hex_base58': 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzz',
        'issuer': '',
        'max_supply': '1',
        'mint_previous': 'AB',
        'title': '',
        'version': '',
      },
      'status': 200,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badAbortIpfsCid timeout abort', async () => {
    const context = getContext([{
      head: goodHead,
      history: [
        {
          hash: '',
          representative: '',
          link: '',
        },
      ]},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badAbortIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'errors': [
        'timeout waiting for response from IPFS CID lookup',
      ],
      'ipfs_cid': badAbortIpfsCid,
      'status': 408,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badAbortOtherIpfsCid timeout abort', async () => {
    const context = getContext([{
      head: goodHead,
      history: [
        {
          hash: '',
          representative: '',
          link: '',
        },
      ]},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, badAbortOtherIpfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'errors': [
        'The user aborted a request with a wierd message.',
      ],
      'ipfs_cid': badAbortOtherIpfsCid,
      'status': 408,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
  });
});
