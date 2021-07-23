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
const {loggingUtil, getResponse} = require('../util/get-response.js');
const testData = require('./get-template-owner-test-QmQJ-dzzS.json');

// constants
const ipfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';

const config = require('../../scripts/config.json');

const context = {
  fs: fs,
  bananojs: bananojs,
  fetch: fetch,
};

// variables

// functions
describe(actionUtil.ACTION, () => {
  it(ipfsCid, async () => {
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {ipfs_cid: ipfsCid});
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
