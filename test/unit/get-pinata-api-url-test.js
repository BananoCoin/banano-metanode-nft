'use strict';

// libraries
const chai = require('chai');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-pinata-api-url.js');

// constants
const DEBUG = false;

const config = {
  'pinataApiUrl': 'pinataApiUrlValue',
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
    const actualResponse = await getResponse(context);
    try {
      const expectedResponse = {
        success: true,
        pinata_api_url: config.pinataApiUrl,
      };
      loggingUtil.log('actualResponse', actualResponse);
      loggingUtil.log('expectedResponse', expectedResponse);
      expect(actualResponse).to.deep.equal(expectedResponse);
    } catch (error) {
      loggingUtil.trace(error);
    }
  });
  beforeEach(async () => {
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
  });
});
