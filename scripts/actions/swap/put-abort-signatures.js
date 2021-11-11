'use strict';
// libraries

// modules
const swapUtil = require('../../swap-util.js');

// constants
/**
 * adds a block to the swap.
 * @name swap_check
 * @memberof RPC
 * @example Request {"action": "swap_check", "nonce":"...."}
 * @example Response {"success":"true"}
 * @example Response {"success":"false","errors":["...","..."]}
 */
const ACTION = 'swap_check';

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

const addAction = (actions) => {
  actions[ACTION] = (context, req, res) => {
    /* istanbul ignore if */
    if (req === undefined) {
      throw Error('req is required');
    }

    /* istanbul ignore if */
    if (req.body === undefined) {
      throw Error('req.body is required');
    }
    // TODO: create and add action.
    const resp = {};
    resp.success = false;
    resp.errors = [
      'not implemented yet',
    ];
    res.send(resp);
  };
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
