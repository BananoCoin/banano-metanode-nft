'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-template-owner.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const mockFs = require('../util/mock-fs.js');
const mockFetch = require('../util/mock-fetch.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants
const artIpfsCid = 'QmbzTMo42KADUbLwc43KR9Se6aV3N6wfKqFbSr2qN1gJqR';
const goodIpfsCidNoMaxSupply = 'QmWNckc4jmTFsSSrhsSNJMhkmDbH19owXB6UL8jVEaohgR';
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const badIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzz';
const badContentTypeIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWABADCT';
const badTimeoutIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQBADT1ME';
const badUnknownIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciqBADUNKNQWN';
const badJsonIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQBADJSQN';
const badMissingJsonIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUBAD2M1SS1NGJSQN';
const badJsonBase58Cid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfBADJSQNBASE58';
const badJsonBase58ShortCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knBADJSQNBASE58SHQRT';
const badAbortIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAABQRT';
const badAbortOtherIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciqABQRTQTHER';
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
const goodAssetRepNoMaxSupply = 'ban_1xtyg8zyc3tkg8byfakcrw5qkfdob96p7dn7ga8ys59qrtcw3aqgqdszk5zz';

// variables
const accountInfos = {};
accountInfos[goodOwner4] = '{"confirmation_height_frontier": ""}';
accountInfos[goodOwnerB] = '{"confirmation_height_frontier": ""}';

// functions
describe(actionUtil.ACTION, () => {
  const getContext = (histories, blockInfos) => {
    const fetchFn = mockFetch.fetch(histories, blockInfos, accountInfos);
    return {
      bananojs: bananojs,
      fs: mockFs,
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
                  'command': 'nft_template',
                  'version': '0.0.1',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'art_data_ipfs_cid': artIpfsCid,
                  'previous': goodHead,
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
                  'command': 'nft_template',
                  'version': '',
                  'title': '',
                  'issuer': '',
                  'max_supply': '',
                  'art_data_ipfs_cid': '',
                  'previous': '',
                  'transferable': '',
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
                  'command': 'nft_template',
                  'version': '0.0.1',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'art_data_ipfs_cid': 'Qm#',
                  'previous': 'AB',
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
                  'command': 'nft_template',
                  'version': '0.0.1',
                  'title': '',
                  'issuer': '',
                  'max_supply': '1',
                  'art_data_ipfs_cid': badIpfsCid,
                  'previous': 'AB',
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

        if (resource == `${config.ipfsApiUrl}/${goodIpfsCidNoMaxSupply}`) {
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
                  'command': 'nft_template',
                  'version': '0.0.1',
                  'title': '',
                  'issuer': '',
                  'art_data_ipfs_cid': goodIpfsCidNoMaxSupply,
                  'previous': goodHead,
                };
              },
            });
          });
        }

        return fetchFn(resource, options);
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          received: 'false',
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner3,
              receive: '',
              send: goodSendHash4,
            },
          ],
          owner: goodOwner3,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
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
      {head: goodHead},
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
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
  it('get status 200 goodIpfsCid one owner with undefined head history', async () => {
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          received: 'false',
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner3,
              receive: '',
              send: goodSendHash4,
            },
          ],
          owner: goodOwner3,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
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
        head: goodReceiveHash3,
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          received: 'true',
          asset: goodSendHash4,
          history: [
            {
              'owner': goodOwner4,
              'receive': goodReceiveHash3,
              'send': goodSendHash4,
            },
          ],
          owner: goodOwner4,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          received: 'false',
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner4,
              receive: '',
              send: goodSendHash4,
            },
          ],
          owner: goodOwner4,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
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
        head: goodReceiveHash3,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHashC,
            representative: goodOwner6,
            link: goodOwner4link,
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          received: 'false',
          asset: goodSendHash4,
          owner: goodOwnerB,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
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
        head: goodReceiveHash3,
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
        head: goodReceiveHash8,
        history: [
          {
            type: 'receive',
            hash: goodReceiveHash8,
            representative: goodOwner6,
            link: goodSendHashA,
          },
        ],
      },
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owners: [
        {
          received: 'true',
          asset: goodSendHash4,
          owner: goodOwnerB,
          template: goodIpfsCid,
          max_supply: '1',
          mint_number: '0',
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
    const actualResponse2 = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid});
    expect(actualResponse2).to.deep.equal(expectedResponse);
    const expectedErrorResponse1 = {
      errors: [
        'ipfsCid \'0O1\' is invalid. error \'Non-base58 character\' 0O',
      ],
      success: false,
    };
    const actualErrorResponse1 = await getResponse(actionUtil, context, {ipfs_cid: '0O1'});
    expect(actualErrorResponse1).to.deep.equal(expectedErrorResponse1);
    const actualErrorResponse2 = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCid + '1'});
    const expectedErrorResponse2 = {
      errors: [
        'ipfsCid \''+ goodIpfsCid + '1' +
        '\' is invalid.' + ` error 'hex value is not '1220' + 64 hex chars.'`,
      ],
      success: false,
    };
    expect(actualErrorResponse2).to.deep.equal(expectedErrorResponse2);
  });
  it('get status 200 badContentTypeIpfsCid', async () => {
    const context = getContext([], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badContentTypeIpfsCid});
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
    const context = getContext([], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badTimeoutIpfsCid});
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
    const context = getContext([], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badUnknownIpfsCid});
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
    const context = getContext( [], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badJsonIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      content_type: 'application/json',
      errors: [
        'unsupported version:\'\' supported versions:["0.0.1"]',
        'max_supply:\'\' not an integer',
        'transferable:\'\' not a boolean',
        'art_data_ipfs_cid:\'\' error \'ipfs_cid:\'\' not valid v0 CID (Qm+base58)\'',
        'previous:\'\' not 64 hex characters',
      ],
      ipfs_cid: badJsonIpfsCid,
      json: {
        command: 'nft_template',
        art_data_ipfs_cid: '',
        issuer: '',
        max_supply: '',
        previous: '',
        transferable: '',
        title: '',
        version: '',
      },
      status: 200,
      success: false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badMissingJsonIpfsCid', async () => {
    const context = getContext([], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badMissingJsonIpfsCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'command:\'undefined\' !== \'nft_template\'',
        'version undefined',
        'title undefined',
        'issuer undefined',
        'art_data_ipfs_cid undefined',
        'previous undefined',
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
    const context = getContext([], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badJsonBase58Cid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'art_data_ipfs_cid:\'Qm#\' error \'ipfs_cid:\'Qm#\' not valid v0 CID (Qm+base58)\'',
        'previous:\'AB\' not 64 hex characters',
      ],
      'ipfs_cid': badJsonBase58Cid,
      'json': {
        'command': 'nft_template',
        'art_data_ipfs_cid': 'Qm#',
        'issuer': '',
        'max_supply': '1',
        'previous': 'AB',
        'title': '',
        'version': '0.0.1',
      },
      'status': 200,
      'success': false,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  it('get status 200 badJsonBase58ShortCid', async () => {
    const context = getContext([], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badJsonBase58ShortCid});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const ipfsCidHex = '500080c4b27277b22c373e4f0dbbc86091707c6cc1745a1b3efcf66664bbde9ceb';
    const expectedResponse = {
      'content_type': 'application/json',
      'errors': [
        'art_data_ipfs_cid:\''+badIpfsCid+
        '\' error \'ipfsCidHex:\''+ipfsCidHex+
        '\' not 64 hex chars after prefix 1220, 66\'',
        'previous:\'AB\' not 64 hex characters',
      ],
      'ipfs_cid': badJsonBase58ShortCid,
      'json': {
        'command': 'nft_template',
        'art_data_ipfs_cid': 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzz',
        'issuer': '',
        'max_supply': '1',
        'previous': 'AB',
        'title': '',
        'version': '0.0.1',
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badAbortIpfsCid});
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: badAbortOtherIpfsCid});
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
  it('get status 200 goodIpfsCidNoMaxSupply undefined head history', async () => {
    const context = getContext([
      {
        head: goodHead,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRepNoMaxSupply,
            link: goodOwner4link,
            type: 'state',
            subtype: 'send',
          },
        ],
      },
      {
        account: goodOwner4,
        head: goodReceiveHash3,
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
    ], {});
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: goodIpfsCidNoMaxSupply});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      asset_owners: [
        {
          asset: goodSendHash4,
          history: [
            {
              owner: goodOwner4,
              receive: goodReceiveHash3,
              send: goodSendHash4,
            },
          ],
          mint_number: '0',
          owner: goodOwner4,
          template: goodIpfsCidNoMaxSupply,
          received: 'true',
        },
      ],
      success: true,
    };

    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    mockFetch.init(config, loggingUtil);
    dataUtil.init(config, loggingUtil);
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
    dataUtil.deactivate();
    mockFetch.deactivate();
    mockFs.clear();
  });
});
