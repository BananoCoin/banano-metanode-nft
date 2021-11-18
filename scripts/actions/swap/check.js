'use strict';
// libraries

// modules
const swapUtil = require('../../swap-util.js');

// constants
/**
 * checks if all the blocks are submitted correctly and have no errors.
 * take a parameter for the stage to check, which is "start" or "abort"
 * takes a parameter "blocks" which is "true" or "false" and says whether the blocks should be returned as part of the response.
 * @name swap_check
 * @memberof RPC
 * @example Request {"action": "swap_check", "stage":"start", "blocks":"true", "nonce":"...."}
 * @example Response {"success":"true","blocks": {"send#atomic_swap":{"hash":"..."}}}
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

    /* istanbul ignore if */
    if (req.body.nonce === undefined) {
      throw Error('req.body.nonce is required');
    }

    /* istanbul ignore if */
    if (req.body.stage === undefined) {
      throw Error('req.body.stage is required');
    }

    /* istanbul ignore if */
    if (req.body.blocks === undefined) {
      throw Error('req.body.blocks is required');
    }

    const resp = {};
    try {
      swapUtil.checkSwapAndReturnBlocks(req.body.nonce, req.body.stage, req.body.blocks, resp);
      resp.success = true;
    } catch (error) {
      loggingUtil.trace(error);
      resp.success = false;
      resp.errors = [
        error.message,
      ];
    } finally {
      res.send(resp);
    }
  };
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
