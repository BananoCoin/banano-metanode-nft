'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const nftOwnerActionUtil = require('../../scripts/actions/get-nft-info.js');

// constants
const DEBUG = false;

const config = {
};
const loggingUtil = {};
if (DEBUG) {
  loggingUtil.debug = console.log;
  loggingUtil.log = console.log;
} else {
  loggingUtil.log = () => {};
  loggingUtil.debug = () => {};
}

// variables

// functions
const getResponse = (context, ipfs_cid) => {
  const actions = {};
  nftOwnerActionUtil.addAction(actions);
  const fn = actions[nftOwnerActionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = {};
    req.body.ipfs_cid = ipfs_cid;
    const res = {};
    res.send = (sent) => {
      resolve(sent);
    };
    fn(context, req, res);
  });
};

describe('nft-owner', () => {
  it('nft-owner unknown ipfs_cid', async () => {
    const context = {
      fetch: () => {
        return {status: 400};
      },
    };
    const actualResponse = await getResponse(context, '');
    try {
      const expectedResponse = {
        status: 400,
        ipfs_cid: '',
        success: false,
        error: 'unknown ipfs_cid',
      };
      expect(actualResponse).to.deep.equal(expectedResponse);
    } catch (error) {
      console.trace(error);
    }
  });
  it('nft-owner unsupported content_type', async () => {
    const context = {
      fetch: () => {
        return {
          status: 200,
          headers: {
            get: () => {
              return 'image/gif';
            },
          },
        };
      },
    };
    const actualResponse = await getResponse(context, '');
    try {
      const expectedResponse = {
        success: false,
        status: 200,
        ipfs_cid: '',
        content_type: 'image/gif',
        error: 'unsupported content_type',
      };
      expect(actualResponse).to.deep.equal(expectedResponse);
    } catch (error) {
      console.trace(error);
    }
  });
  it('nft-owner supported content_type', async () => {
    const context = {
      fetch: () => {
        return {
          status: 200,
          headers: {
            get: () => {
              return 'application/json';
            },
          },
          json: () => {
            return {};
          },
        };
      },
    };
    const actualResponse = await getResponse(context, '');
    try {
      const expectedResponse = {
        success: true,
        status: 200,
        ipfs_cid: '',
        content_type: 'application/json',
        json: {},
      };
      expect(actualResponse).to.deep.equal(expectedResponse);
    } catch (error) {
      console.trace(error);
    }
  });
  beforeEach(async () => {
    nftOwnerActionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    nftOwnerActionUtil.deactivate();
  });
});
