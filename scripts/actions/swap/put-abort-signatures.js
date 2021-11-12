'use strict';
// libraries

// modules
const swapUtil = require('../../swap-util.js');

// constants
/**
 * adds a block to the swap.
 * @name put_abort_signatures
 * @memberof RPC
 * @example Request {
 *   "action": "put_abort_signatures",
 *   "nonce":"....",
 *   "change_abort_receive_atomic_swap_signature":"...",
 *   "change_abort_payment_signature":"..."
 * }
 * @example Response {"success":"true"}
 * @example Response {"success":"false","errors":["...","..."]}
 */
const ACTION = 'put_abort_signatures';

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
    loggingUtil.debug('put_abort_signatures start', req.body);
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
    if (req.body.change_abort_receive_atomic_swap_signature === undefined) {
      throw Error('req.body.change_abort_receive_atomic_swap_signature is required');
    }

    /* istanbul ignore if */
    if (req.body.change_abort_payment_signature === undefined) {
      throw Error('req.body.change_abort_payment_signature is required');
    }

    // TODO: create and add action.
    const resp = {};
    try {
      const nonce = req.body.nonce;
      swapUtil.signBlock(nonce, 'change_abort_receive_atomic_swap', req.body.abort_receive_atomic_swap_signature);
      swapUtil.signBlock(nonce, 'change_abort_payment', req.body.abort_payment_signature);
      resp.success = true;
    } catch (error) {
      console.trace(error);
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
