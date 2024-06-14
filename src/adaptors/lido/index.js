const ADDRESSES = require('../assets.json')
const utils = require('../utils');

const topLvl = async (chainString, url, token, address, underlying) => {
  let dataTvl;
  let dataApy;
  let data;
  let apy;

  if (chainString === 'ethereum') {
    dataTvl = await utils.getData(`${url}/short-lido-stats`);
    dataApy = await utils.getData(
      `https://eth-api.lido.fi/v1/protocol/steth/apr/last`
    );
    dataTvl.apr = dataApy.data.apr;
    data = { ...dataTvl };
  } else {
    data = await utils.getData(url);
  }
  data.token = token;
  data.address = address;

  return {
    pool: `${data.address}-${chainString}`.toLowerCase(),
    chain: utils.formatChain(chainString),
    project: 'lido',
    symbol: utils.formatSymbol(data.token),
    tvlUsd: chainString === 'ethereum' ? data.marketCap : data.totalStaked.usd,
    apyBase: Number(data.apr),
    underlyingTokens: [underlying],
  };
};

const main = async () => {
  const data = await Promise.all([
    topLvl(
      'ethereum',
      'https://stake.lido.fi/api',
      'stETH',
      ADDRESSES.ethereum.STETH,
      ADDRESSES.null
    ),
    topLvl(
      'polygon',
      'https://polygon.lido.fi/api/stats',
      'stMATIC',
      '0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599',
      ADDRESSES.ethereum.MATIC
    ),
  ]);

  return data;
};

module.exports = {
  timetravel: false,
  apy: main,
  url: 'https://lido.fi/#networks',
};
