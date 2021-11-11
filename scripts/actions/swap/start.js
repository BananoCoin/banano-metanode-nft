'use strict';
// libraries

// modules
const swapUtil = require('../../swap-util.js');

// constants
/**
 * starts a swap.
 * @name swap_start
 * @memberof RPC
 * @example Request {"action": "swap_start", "sender":"ban_...", "receiver":"ban_..."}
 * @example Response {"success":"true","nonce":"...."}
 */
const ACTION = 'swap_start';

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
    console.log('swap start', req.body);
    /* istanbul ignore if */
    if (req === undefined) {
      throw Error('req is required');
    }

    /* istanbul ignore if */
    if (req.body === undefined) {
      throw Error('req.body is required');
    }

    /* istanbul ignore if */
    if (req.body.sender === undefined) {
      throw Error('req.body.sender is required');
    }

    /* istanbul ignore if */
    if (req.body.receiver === undefined) {
      throw Error('req.body.receiver is required');
    }

    // TODO: create and add action.
    const resp = {};
    console.log('swap start', req.body);
    try {
      const nonce = swapUtil.start(req.body.sender, req.body.receiver);
      resp.success = true;
      resp.nonce = nonce;
    } finally {
      res.send(resp);
    }
  };
};

exports.init = init;
exports.deactivate = deactivate;
exports.ACTION = ACTION;
exports.addAction = addAction;
