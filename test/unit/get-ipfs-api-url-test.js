'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-ipfs-api-url.js');

// constants
const DEBUG = false;

const config = {
  'ipfsApiUrl': 'ipfsApiUrlValue',
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
const getResponse = (context) => {
  const actions = {};
  actionUtil.addAction(actions);
  const fn = actions[actionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = {};
    const res = {};
    res.send = (sent) => {
      // console.log('called', fn, sent);
      resolve(sent);
    };
    // console.log('calling', fn);
    fn(context, req, res)
        .catch((error) => {
          // console.log('error', fn, error);
          resolve({
            success: false,
            errors: [error.message],
          });
        });
  });
};

describe(actionUtil.ACTION, () => {
  it('get status 200', async () => {
    const context = {
    };
    let actualResponse;
    try {
      actualResponse = await getResponse(context);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      ipfs_api_url: config.ipfsApiUrl,
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });
  beforeEach(async () => {
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
  });
});
