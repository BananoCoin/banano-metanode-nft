'use strict';

// libraries
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const fetch = require('node-fetch');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-template-owner.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const actualResponseUtil = require('../util/actual-response-util.js');
const testData = require('./get-template-owner-test-QmQJ-dzzS.json');

// constants
const ipfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';

const DEBUG = false;

const LOG = false;

const config = require('../../scripts/config.json');

const context = {
  fs: fs,
  bananojs: bananojs,
  fetch: fetch,
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
const getResponse = (context, ipfsCid) => {
  const actions = {};
  actionUtil.addAction(actions);
  const fn = actions[actionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = {};
    req.body.ipfs_cid = ipfsCid;
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
  it(ipfsCid, async () => {
    let actualResponse;
    try {
      actualResponse = await getResponse(context, ipfsCid);
    } catch (error) {
      loggingUtil.trace(error);
    }
    if (loggingUtil.isDebugEnabled()) {
      actualResponseUtil.writeActualResponse(path.basename(__filename), actualResponse);
    }
    const expectedResponse = testData.expectedResponse;
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
    // mockFs.clear();
  });
});
