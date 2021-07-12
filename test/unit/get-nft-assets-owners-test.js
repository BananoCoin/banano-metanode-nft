'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-assets-owners.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');

// constants
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';
const goodHead = '0000000000000000000000000000000000000000000000000000000000000000';
const DEBUG = false;

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
  loggingUtil.log = () => {};
  loggingUtil.debug = () => {};
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
      loggingUtil.log('called', fn, sent);
      resolve(sent);
    };
    loggingUtil.log('calling', fn);
    fn(context, req, res)
        .catch((error) => {
          loggingUtil.log('error', fn, error);
          resolve({
            success: false,
            errors: [error.message],
          });
        });
  });
};

describe(actionUtil.ACTION, () => {
  it('get status 200 goodIpfsCid', async () => {
    const context = {
      fetch: (resource, options) => {
        loggingUtil.log('fetch', resource, options);
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
        if (resource == config.bananodeApiUrl) {
          const body = JSON.parse(options.body);
          if (body.action == 'account_history') {
            if (body.head == goodHead) {
              return new Promise(async (resolve) => {
                resolve({
                  json: () => {
                    return {
                      history: [
                        {
                          hash: '',
                          representative: '',
                          link: '',
                        },
                      ],
                    };
                  },
                });
              });
            }
          }
        }

        return new Promise(async (resolve) => {
          resolve();
        });
      },
    };
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
  beforeEach(async () => {
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
  });
});
