'use strict';
// libraries

// modules

// constants
/**
 * gets the supported versions
 * @name get_supported_versions
 * @memberof RPC
 * @param {String} action:get_supported_versions the action: gets the supported versions.
 * @example {"action": "get_supported_versions"}
 */
const ACTION = 'get_supported_versions';

// variables
/* eslint-disable no-unused-vars */
let config;
let loggingUtil;
/* eslint-enable no-unused-vars */

// functions
const init = (_config, _loggingUtil) => {
  /* istanbul ignore if */
  if (_config === undefined) {
    throw new Error('config is required.');
  }
  /* istanbul ignore if */
  if (_loggingUtil === undefined) {
    throw new Error('loggingUtil is required.');
  }
  config = _config;
  loggingUtil = _loggingUtil;
};

const deactivate = () => {
  /* eslint-disable no-unused-vars */
  config = undefined;
  loggingUtil = undefined;
  /* eslint-enable no-unused-vars */
};

/**
 * gets the supported versions
 * @memberof Main
 * @param {Object} context the context, used to get cached data.
 * - from filesystem in nodejs,
 * - from localstorage in a browser,
 * - from a test harness in the unit tests.
 * @param {Object} req the http request.
 * @param {Object} res the http response.
 * @return {undefined}
 */
const getSupportedVersions = async (context, req, res) => {
  /* istanbul ignore if */
  if (req === undefined) {
    throw Error('req is required');
  }

  /* istanbul ignore if */
  if (req.body === undefined) {
    throw Error('req.body is required');
  }

  const resp = {};
  resp.success = true;
  resp.supported_versions = config.supportedVersions;

  res.send(resp);
};

const addAction = (actions) => {
  actions[ACTION] = getSupportedVersions;
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
