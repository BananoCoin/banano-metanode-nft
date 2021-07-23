'use strict';

// libraries
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const fetch = require('node-fetch');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-asset-owner.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const actualResponseUtil = require('../util/actual-response-util.js');
const {loggingUtil, getResponse} = require('../util/get-response.js');
const testData = require('./get-asset-owner-test-5CCC-1B51.json');

// constants
const assetHash = '5CCCBA25B221D9437B07E15C20D0F5997B23262E3194CCB3B7A4374BF4DA1B51';

const DEBUG = false;

const LOG = false;

const config = require('../../scripts/config.json');

const context = {
  fs: fs,
  bananojs: bananojs,
  fetch: fetch,
};

// variables

// functions
describe(actionUtil.ACTION, () => {
  it(assetHash, async () => {
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {asset_hash: assetHash});
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
