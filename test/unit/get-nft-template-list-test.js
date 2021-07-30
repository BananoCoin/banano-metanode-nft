'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-template-list.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');
const dataUtil = require('../../scripts/data-util.js');
const mockFs = require('../util/mock-fs.js');
const {config, loggingUtil, getResponse} = require('../util/get-response.js');

// constants
const goodIpfsCid = 'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS';

// variables

// functions
describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const context = {
      bananojs: {},
      fs: mockFs,
      fetch: {},
    };
    ipfsUtil.addTemplate(mockFs, goodIpfsCid);

    let actualResponse;
    try {
      actualResponse = await getResponse(actionUtil, context, {});
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      history: [
        'QmQJXwo7Ee1cgP2QVRMQGrgz29knQrUMfciq2wQWAvdzzS',
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
