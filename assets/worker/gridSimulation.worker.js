/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// eslint-disable-next-line no-extend-native
Object.defineProperty(Array.prototype, 'remove', {
  value(item) {
    const index = this.indexOf(item);
    if (index >= 0) {
      return this.splice(index, 1);
    }
    return null;
  },
});

self.importScripts('https://cdn.jsdelivr.net/npm/dayjs@1.10.5/dayjs.min.js');

let numberOfGrid = 0;
let topPrice = 0;
let bottomPrice = 0;
let tradeList = [];
let normalizedTradeList;

let pendingOrderList = [];
let tradeUnit = 0;
let stepDistance;

let stockFund = 0;
let fund = 0;
let fee = 0;

const statistics = {
  summary: {
    fundChange: 0,
    revenue: 0,
    buy: 0,
    sell: 0,
    pair: 0,
  },
  detail: {},
};

const recordHistory = (type, level, revenue, tabIndex, initBuy = false) => {
  let price = 0;

  if (initBuy) {
    price = normalizedTradeList[0].info.open;
  } else {
    price = bottomPrice + level * stepDistance;
  }

  if (!statistics.detail[normalizedTradeList[tabIndex].date]) {
    statistics.detail[normalizedTradeList[tabIndex].date] = {
      sell: 0,
      pair: 0,
      buy: 0,
      record: [],
      revenue: 0,
    };
  }

  statistics.detail[normalizedTradeList[tabIndex].date][type] += 1;
  if (type === 'sell') {
    statistics.detail[normalizedTradeList[tabIndex].date].pair += 1;
    statistics.detail[normalizedTradeList[tabIndex].date].revenue += revenue;
  }

  statistics.detail[normalizedTradeList[tabIndex].date].record.push({
    time: dayjs(normalizedTradeList[tabIndex].info.timestamp).format('YYYY-MM-DD HH:mm:ss'),
    type,
    price,
    fee: tradeUnit * price * fee * 0.01,
    level,
    amount: tradeUnit * price,
    revenue,
    initBuy,
  });
};

const buy = (level, tabIndex, times) => {
  for (let k = 0; k < times; k++) {
    const targetLevel = level - k;
    if (pendingOrderList.some((e) => e.level === targetLevel)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const gridPrice = targetLevel * stepDistance + bottomPrice;
    const cost = tradeUnit * gridPrice * (1 + fee * 0.01);

    pendingOrderList.push({
      level: targetLevel,
      cost,
    });

    stockFund -= cost;

    // 每日統計
    recordHistory('buy', targetLevel, 0, tabIndex);
  }
};

const sell = (level, tabIndex, times) => {
  for (let k = 0; k < times; k++) {
    const targetLevel = level + k;
    const gridPrice = targetLevel * stepDistance + bottomPrice;
    const match = pendingOrderList.find((e) => e.level + 1 === targetLevel);
    if (match) {
      const volumn = tradeUnit * gridPrice * (1 - fee * 0.01);
      const revenue = volumn - match.cost;

      stockFund += volumn;

      pendingOrderList.remove(match);

      // 每日統計
      recordHistory('sell', targetLevel, revenue, tabIndex);
    }
  }
};

const run = () => {
  const initPrice = normalizedTradeList[0].info.open;

  // 初始持倉
  const initStakePrice = Math.max(bottomPrice, initPrice);

  // 最上面那一格不購買
  for (let p = initStakePrice; p < topPrice - stepDistance; p += stepDistance) {
    const level = parseInt((p - bottomPrice) / stepDistance, 10);
    const cost = tradeUnit * initPrice * (1 + fee * 0.01);

    pendingOrderList.push({
      level,
      cost,
    });

    stockFund -= cost;

    recordHistory('buy', level, 0, 0, true);
  }

  // 實際走勢時候購買
  for (let i = 1; i < normalizedTradeList.length; i++) {
    // sell
    if (normalizedTradeList[i].highLevel - normalizedTradeList[i].openLevel > 0 && normalizedTradeList[i].highLevel > 0 && normalizedTradeList[i].highLevel <= numberOfGrid - 1) {
      const sellTimes = normalizedTradeList[i].highLevel - normalizedTradeList[i].openLevel;
      sell(normalizedTradeList[i].openLevel + 1, i, sellTimes);
    }

    // buy
    if (normalizedTradeList[i].lowLevel - normalizedTradeList[i].highLevel < 0 && normalizedTradeList[i].lowLevel >= 0 && normalizedTradeList[i].lowLevel < numberOfGrid - 1) {
      const buyTimes = normalizedTradeList[i].highLevel - normalizedTradeList[i].lowLevel;
      buy(normalizedTradeList[i].highLevel, i, buyTimes);
    }
  }

  // 將剩餘掛單賣出
  const totalRemaining = pendingOrderList.length * tradeUnit * normalizedTradeList[normalizedTradeList.length - 1].info.close;

  // 概括統計
  statistics.summary.fundChange = stockFund + totalRemaining - fund;
  statistics.summary.revenue = Object.values(statistics.detail).reduce((accu, o) => {
    accu += o.revenue;
    return accu;
  }, 0);
  statistics.summary.pair = Object.values(statistics.detail).reduce((accu, o) => {
    accu += o.pair;
    return accu;
  }, 0);
  statistics.summary.buy = Object.values(statistics.detail).reduce((accu, o) => {
    accu += o.buy;
    return accu;
  }, 0);
  statistics.summary.sell = Object.values(statistics.detail).reduce((accu, o) => {
    accu += o.sell;
    return accu;
  }, 0);
};

const normalData = async () => {
  normalizedTradeList = tradeList.map((e) => ({
    time: dayjs.unix(e.date).format('HH:mm'),
    date: dayjs.unix(e.date).format('YYYY-MM-DD'),
    openLevel: parseInt((e.open - bottomPrice) / stepDistance, 10),
    closeLevel: parseInt((e.close - bottomPrice) / stepDistance, 10),
    lowLevel: parseInt((e.low - bottomPrice) / stepDistance, 10),
    highLevel: parseInt((e.high - bottomPrice) / stepDistance, 10),
    info: {
      timestamp: e.date * 1000,
      open: e.open,
      high: e.high,
      low: e.low,
      close: e.close,
      volume: e.volume,
    },
  }));
};

const simulate = async (data) => {
  numberOfGrid = data.numberOfGrid;
  topPrice = data.topPrice;
  bottomPrice = data.bottomPrice;
  tradeList = data.tradeList;
  fund = data.fund;
  fee = data.fee;

  stepDistance = (topPrice - bottomPrice) / (numberOfGrid - 1);

  normalizedTradeList = [];
  normalData();

  pendingOrderList = [];
  stockFund = data.fund;

  tradeUnit = fund / normalizedTradeList[0].info.open / numberOfGrid;

  await run();

  self.postMessage(statistics);
};

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', (payload) => {
  if (payload.data.cmd === 'simulation') {
    simulate(payload.data.data);
  }
});
