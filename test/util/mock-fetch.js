'use strict';
// libraries

// modules

// constants

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

const fetch = (histories, blockInfos) => {
  const fetchFn = (resource, options) => {
    loggingUtil.debug('fetch', resource, options);
    if (resource == config.bananodeApiUrl) {
      const body = JSON.parse(options.body);
      if (body.action == 'account_history') {
        for (let historiesIx = 0; historiesIx < histories.length; historiesIx++) {
          const historiesElt = histories[historiesIx];
          const head = historiesElt.head;
          const account = historiesElt.account;
          loggingUtil.debug('histories check', body.head, head, body.account, account);

          let match = false;
          if (body.head !== undefined) {
            if (body.head == head) {
              loggingUtil.debug('histories match head', body.head, head);
              match = true;
            }
          }
          if (body.account !== undefined) {
            if (body.account == account) {
              loggingUtil.debug('histories match account', body.account, account);
              match = true;
            }
          }

          if (match) {
            return new Promise(async (resolve) => {
              resolve({
                json: () => {
                  const history = historiesElt.history;
                  // if(history == undefined) {
                  //   console.trace('history', body.account, history == undefined);
                  // }
                  return {
                    history: history,
                  };
                },
              });
            });
          }
        }

        throw Error(`cannot match options.body '${options.body}' with any histories ${JSON.stringify(histories)}`);
      }

      if (body.action == 'account_info') {
        return new Promise(async (resolve) => {
          resolve({
            text: () => {
            // TODO: find a way to only store confirmation_height_frontier
              return '{"confirmation_height_frontier": ""}';
            },
          });
        });
      }

      if (body.action == 'block_info') {
        return new Promise(async (resolve) => {
          resolve({
            json: () => {
              return blockInfos[body.hash];
            },
          });
        });
      }

      throw Error(`unknown resource '${resource}' with body ${options.body}`);
    }

    return new Promise(async (resolve) => {
      resolve();
    });
  };
  return fetchFn;
};

exports.init = init;
exports.deactivate = deactivate;
exports.fetch = fetch;
