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
const testData = require('./001-get-template-owner-test-QmWN-ohgR.json');

// constants
const ipfsCid = 'QmWNckc4jmTFsSSrhsSNJMhkmDbH19owXB6UL8jVEaohgR';

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
    expect({length: actualResponse.asset_owners.length})
        .to.deep.equal({length: expectedResponse.asset_owners.length});

    const maxIx = Math.max(actualResponse.asset_owners.length, expectedResponse.asset_owners.length);
    for (let ix = 0; ix < maxIx; ix++) {
      const actualAssetOwner = actualResponse.asset_owners[ix];
      const expectedAssetOwner = expectedResponse.asset_owners[ix];
      expect({ix: ix, ao: actualAssetOwner})
          .to.deep.equal({ix: ix, ao: expectedAssetOwner});
    }

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
