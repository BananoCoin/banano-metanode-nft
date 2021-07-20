'use strict';

// libraries
const chai = require('chai');
const fetch = require('node-fetch');
const bananojs = require('@bananocoin/bananojs');

// modules
const expect = chai.expect;
const actionUtil = require('../../scripts/actions/get-nft-assets-owner.js');
const ipfsUtil = require('../../scripts/ipfs-util.js');

// constants
const assetHash = '5CCCBA25B221D9437B07E15C20D0F5997B23262E3194CCB3B7A4374BF4DA1B51';

const DEBUG = false;

const LOG = false;

const config = require('../../scripts/config.json');

const context = {
  dataUtil: {},
  bananojs: bananojs,
  fetch: fetch,
};

const loggingUtil = {};
loggingUtil.trace = console.trace;
if (DEBUG) {
  loggingUtil.debug = console.log;
  loggingUtil.log = console.log;
} else {
  if (LOG) {
    loggingUtil.log = console.log;
    loggingUtil.debug = () => {};
  } else {
    loggingUtil.log = () => {};
    loggingUtil.debug = () => {};
  }
}

// variables

// functions
const getResponse = (context, assetHash) => {
  const actions = {};
  actionUtil.addAction(actions);
  const fn = actions[actionUtil.ACTION];

  return new Promise(async (resolve) => {
    const req = {};
    req.body = {};
    req.body.asset_hash = assetHash;
    const res = {};
    res.send = (sent) => {
      loggingUtil.debug('called', fn, sent);
      resolve(sent);
    };
    loggingUtil.debug('calling', fn);
    fn(context, req, res)
        .catch((error) => {
          loggingUtil.debug('error', fn, error);
          resolve({
            success: false,
            errors: [error.message],
          });
        });
  });
};

describe(actionUtil.ACTION, () => {
  it(assetHash, async () => {
    let actualResponse;
    try {
      actualResponse = await getResponse(context, assetHash);
    } catch (error) {
      loggingUtil.trace(error);
    }
    const expectedResponse = {
      success: true,
      asset_owner: [
        {
          asset: '5CCCBA25B221D9437B07E15C20D0F5997B23262E3194CCB3B7A4374BF4DA1B51',
          history: [
            {
              owner: 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq',
              receive: 'E8AF90918776D79770E7D573FD90804BEA51663AAFC16C775C4E158813C7AF93',
              send: '5CCCBA25B221D9437B07E15C20D0F5997B23262E3194CCB3B7A4374BF4DA1B51',
            },
            {
              owner: 'ban_1jsdpfa46qh5u49t3mbhisngtqunj43zc1k9x73okk6syi54zkugy1psyer1',
              receive: '6C8DC47F4A85C09BB976A88BCB995099C120DC4567CA1CD0A5E8C904FEA2310B',
              send: '97E4E099A082EBCB13989B2F4DA26849C2C2B8AEEAFC6B326E8C00CC788F2EF6',
            },
            {
              owner: 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq',
              receive: '55F26D0AB8F44EA1C1A080B620271F7500D6BF163502E7DA3CBBADD7CCCBAD68',
              send: '4A569CB526D9D7B59A6E716CF33CE948640B74C4AB8FEA361D3CCBA50E0D5584',
            },
            {
              owner: 'ban_1jsdpfa46qh5u49t3mbhisngtqunj43zc1k9x73okk6syi54zkugy1psyer1',
              receive: 'E4AE90CE5CE666294000DE0D5727A6361284C205472D12617C5A499AFE5368E6',
              send: '2E7E0B758F5148BFDBA373ACE38B852B715217553A9A201F0AD705EFA4EB1CBF',
            },
            {
              owner: 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq',
              receive: '26614AD84783E770E76C95B13CF997BCA3A01C7691EF439FB62D6E25EECA8BDB',
              send: 'F4601D6A3F464517965AFBE8E715B53B912295E42FB7BE382712074F32EFD8CA',
            },
            {
              owner: 'ban_1jsdpfa46qh5u49t3mbhisngtqunj43zc1k9x73okk6syi54zkugy1psyer1',
              receive: '22A4E80761E7D13A2C46EFCE3F20BA93DDD159F02C60663D1B3A800D1941B6ED',
              send: '91BB70861580C3C242838D1BE07EF42B8AD514C77BAC71AEBDC9BD8BA0E5ED00',
            },
            {
              owner: 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq',
              send: '4986190A61308889AB0CF95CA97527D55CAA8634BEF04C176329BE14B72EC88F',
              receive: 'DD8F69FC73B0B7708BDF4D16FABE50A26CD4EC2B444E762C13E3F01BF62B8569',
            },
            {
              owner: 'ban_1jsdpfa46qh5u49t3mbhisngtqunj43zc1k9x73okk6syi54zkugy1psyer1',
              send: '5AFF201E48BB85DD157EDA606A04F2A13340C0C7B4A08EB6C169959297D745F3',
              receive: '751A3E6F4DFD6FE2E102760765E413E7EB68096AC9F15BB7881533249D058AF5',
            },
            {
              owner: 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq',
              send: 'A6B4BDCDAB06F8CADF1C9D14D09E408468307FA74C4700CFFFCBCD1281D569C9',
              receive: 'C433B79AA88162C79E38EDEB59BD7D6ACE765F03485D76DD214B10AC3FC71EE3',
            },
          ],
          owner: 'ban_1nftdfyadn1ynf9bz3n8rmdejnga6b7dhdeociscsmidtuy6r4s6jzf6nejq',
        },
      ],
    };
    loggingUtil.debug('actualResponse', actualResponse);
    loggingUtil.debug('expectedResponse', expectedResponse);
    expect(actualResponse).to.deep.equal(expectedResponse);
  });

  beforeEach(async () => {
    ipfsUtil.init(config, loggingUtil);
    actionUtil.init(config, loggingUtil);
  });

  afterEach(async () => {
    actionUtil.deactivate();
    ipfsUtil.deactivate();
  });
});
