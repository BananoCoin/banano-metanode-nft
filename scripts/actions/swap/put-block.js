'use strict';
// libraries

// modules
const swapUtil = require('../../swap-util.js');

// constants
/**
 * adds a block to the swap.
 * @name swap_put_block
 * @memberof RPC
 * @example Request {"action": "swap_put_block", "nonce":"....", "type":"send_atomic_swap", "block":{}}
 * @example Response {"success":"true"}
 */
const ACTION = 'swap_put_block';

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
  actions[ACTION] = async (context, req, res) => {
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
    if (req.body.type === undefined) {
      throw Error('req.body.type is required');
    }

    /* istanbul ignore if */
    if (req.body.block === undefined) {
      throw Error('req.body.block is required');
    }

    const resp = {};
    try {
      await swapUtil.setBlock(req.body.nonce, req.body.type, req.body.block);
      resp.success = true;
    } catch (error) {
      loggingUtil.trace(error);
      resp.success = false;
      resp.errors = [error.message];
    } finally {
      res.send(resp);
    }
  };
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
