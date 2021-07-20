'use strict';

// libraries
const bananojs = require('@bananocoin/bananojs');

const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-assets-owner.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const mockFs = require('../util/mock-fs.js');

// constants
const goodOwner2link = '0000000000000000000000000000000000000000000000000000000000000002';
const goodOwner2 = 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c';
const goodSendHash4 = '0000000000000000000000000000000000000000000000000000000000000004';
const goodAssetRep = 'ban_19bek3pyy9ky1k43utawjfky3wuw84jxaq5c7j4nznsktca8z5cqrfg8egjn';

const DEBUG = false;

const LOG = false;

const config = {
  fetchTimeout: 0,
  ipfsApiUrl: 'ipfsApiUrlValue',
  bananodeApiUrl: 'bananodeApiUrlValue',
  receiveBlockHashDataDir: 'receiveBlockHashDataDir',
};
const loggingUtil = {};
loggingUtil.trace = console.trace;
loggingUtil.isDebugEnabled = () => {
  return DEBUG;
};
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
const getResponse = (context, assetHash) => {
  const actions = {};
  actionUtil.addAction(actions);
  const fn = actions[actionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = {};
    req.body.asset_hash = assetHash;
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
      fs: mockFs,
      fetch: (resource, options) => {
        loggingUtil.debug('fetch', resource, options);
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
  it('get status 200 goodIpfsCid no history', async () => {
    const context = getContext([{
      head: goodSendHash4,
      history: [
      ]},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodSendHash4);
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
  it('get status 200 goodIpfsCid no owner', async () => {
    const context = getContext([{
      head: goodSendHash4,
      history: [
      ]},
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodSendHash4);
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
  it('get status 200 goodIpfsCid one owner', async () => {
    const context = getContext([
      {
        head: goodSendHash4,
        history: [
          {
            hash: goodSendHash4,
            representative: goodAssetRep,
            link: goodOwner2link,
          },
          {
            hash: goodSendHash4,
            representative: goodOwner2,
            link: goodOwner2link,
          },
        ]},
      {
        account: goodOwner2,
      },
    ]);
    let actualResponse;
    try {
      actualResponse = await getResponse(context, goodSendHash4);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owner: [
        {
          asset: '0000000000000000000000000000000000000000000000000000000000000004',
          history: [],
          owner: 'ban_11111111111111111111111111111111111111111111111111147dcwzp3c',
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    dataUtil.init(config, loggingUtil);
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
    dataUtil.deactivate();
    mockFs.clear();
  });
});