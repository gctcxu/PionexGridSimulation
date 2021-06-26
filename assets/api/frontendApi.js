const getTradeList = async (symbol, startTime, endTime, limit = 1000) => {
  const params = {
    symbol, startTime, endTime, limit,
  };

  const queryParams = Object.entries(params).reduce((accu, e) => {
    if (!e[1]) return accu;
    accu += `&${e[0]}=${e[1]}`;
    return accu;
  }, '');
  const res = await fetch(`https://api.binance.com/api/v3/aggTrades?${queryParams}`);
  return res.json();
};

const getBinanceKline = async (symbol, startTime, endTime, interval = '1m', limit = 1000) => {
  const params = {
    symbol, startTime, endTime, limit, interval,
  };

  const queryParams = Object.entries(params).reduce((accu, e) => {
    if (!e[1]) return accu;
    accu += `&${e[0]}=${e[1]}`;
    return accu;
  }, '');
  const res = await fetch(`https://api.binance.com/api/v3/klines?${queryParams}`);
  return res.json();
};

const getPionexKline = async (base, quote, start, end) => {
  const res = await fetch(`https://www.pionex.com/kline/query_unite_candle_data?base=${base}&quote=${quote}&market=pionex.v2&start=${parseInt(start / 1000, 10)}&end=${parseInt(end / 1000, 10)}&interval=1m&from=web`);
  return res.json();
};

export { getTradeList, getBinanceKline, getPionexKline };
export default {};
