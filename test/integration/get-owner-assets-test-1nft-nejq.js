'use strict';

// libraries
const fs = require('fs');
const path = require('path');
const chai = require('chai');
const fetch = require('node-fetch');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-owner-assets.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const actualResponseUtil = require('../util/actual-response-util.js');
const { loggingUtil, getResponse } = require('../util/get-response.js');
const testData = require('./get-owner-assets-test-1nft-nejq.json');

// constants
const owner = 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq';

const config = require('../../scripts/config.json');

const context = {
  fs: fs,
  bananojs: bananojs,
  fetch: fetch,
};

// variables

// functions
describe(actionUtil.ACTION, () => {
  it(owner, async () => {
    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, { owner: owner });
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
