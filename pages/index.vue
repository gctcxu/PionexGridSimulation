<template>
  <div class="page">
    <div class="anchor-wrapper">
      <a v-for="(date, index) in Object.keys(statistics.detail)" :key="index" class="btn-anchor" @click="jumpToDate(date)" v-text="date" />
    </div>
    <div class="grid-input-form">
      <h2>網格估算</h2>
      <div class="grid-input-form__input">
        幣種: <select v-model="form.symbol" :disabled="lock">
          <option v-for="(item, index) in symbolList" :key="index" :value="item">
            {{ item.label }}
          </option>
        </select>
      </div>
      <div class="grid-input-form__input">
        時間: 起<input v-model="form.startTimeText" type="datetime-local" :disabled="lock"> ~ 迄<input v-model="form.endTimeText" type="datetime-local" :disabled="lock">
      </div>
      <div class="grid-input-form__input">
        區間下界<input v-model.number="form.bottomPrice" placeholder="" type="number" step="0.01" @input="rangeOptimizationForm.bottomPrice = form.bottomPrice"> ~ 區間上界<input v-model.number="form.topPrice" placeholder="" type="number" step="0.01" @input="rangeOptimizationForm.topPrice = form.topPrice">
      </div>
      <div class="grid-input-form__input">
        網格數目:<input v-model.number="form.numberOfGrid" type="number">
      </div>
      <div class="grid-input-form__input">
        投資本金:<input v-model.number="form.fund" type="number">
      </div>
      <div class="grid-input-form__action">
        <button @click="reset()">
          清空資料
        </button>
        <button @click="simulate()">
          開始模擬
        </button>
      </div>
      <!--
      <div class="mt-5">
        <h2>固定價錢範圍下,找尋最好的網格數量</h2>
        <div class="grid-input-form__input">
          網格數量起訖:<input v-model.number="optimizationForm.minGridNumber" type="number">~<input v-model.number="optimizationForm.maxGridNumber" type="number">
        </div>
        <div class="grid-input-form__action">
          <button @click="gridOptimize()">
            最佳化網格數
          </button>
        </div>
      </div>
      -->
      <div class="range-optimization mt-5">
        <h2>固定網格數量下,找尋最好的區間價位</h2>
        <div class="grid-input-form__input">
          網格價位範圍:<input v-model.number="rangeOptimizationForm.bottomPrice" type="number">~<input v-model.number="rangeOptimizationForm.topPrice" type="number">
        </div>
        <div class="grid-input-form__input">
          網格數量:<input v-model.number="rangeOptimizationForm.gridNumber" type="number">
        </div>
        <div class="grid-input-form__input">
          階梯:<input v-model.number="rangeOptimizationForm.step" type="number">
        </div>
        <div class="grid-input-form__input">
          投資本金:<input v-model.number="rangeOptimizationForm.fund" type="number">
        </div>
        <div class="grid-input-form__action">
          <button @click="rangeOptimize()">
            最佳化網格範圍
          </button>
        </div>
      </div>
    </div>
    <div class="result">
      <van-loading v-show="showLoading" />
      <div v-if="showOptimizationGraph" class="optimization">
        <h2>最佳化</h2>
        <div ref="gridRevenue" class="grid-revenue-graph" />
      </div>
      <div v-if="showStatistics" class="simulate">
        <h2>總計結果</h2>
        <div class="summary-detail">
          <div class="summary-detail__column">
            <span>總利潤</span><span>{{ np.round(statistics.summary.fundChange, 5) }}</span>
          </div>
          <div class="operator">
            =
          </div>
          <div class="summary-detail__column">
            <span>浮動利潤</span><span>{{ np.round(statistics.summary.fundChange - statistics.summary.revenue, 5) }}</span>
          </div>
          <div class="operator">
            +
          </div>
          <div class="summary-detail__column">
            <span>網格營利</span><span>{{ np.round(statistics.summary.revenue, 5) }}</span>
          </div>
          <div class="summary-detail__column">
            <span>交易</span><span>買 {{ statistics.summary.buy }}</span><span>賣 {{ statistics.summary.sell }}</span><span>配對 {{ statistics.summary.pair }}</span>
          </div>
        </div>
        <div class="result__detail">
          <div class="result__trade-unit">
            <span>單位買賣數量 </span><span>{{ np.round(tradeUnit, 5) }}</span>
          </div>
          <div v-for="(date, index) in Object.keys(statistics.detail)" :id="date" :key="index">
            <div class="result__date-summary">
              <div class="result__date">
                日期: {{ date }}
              </div>
              <div class="result__date-revenue">
                收益: {{ np.round(statistics.detail[date].revenue, 5) }}
              </div>
              <div class="result__trade-statistics">
                <div>
                  買 {{ statistics.detail[date].buy }}
                </div>
                <div>
                  賣 {{ statistics.detail[date].sell }}
                </div>
                <div>
                  配對 {{ statistics.detail[date].pair }}
                </div>
              </div>
            </div>
            <div v-for="(record, index2) in statistics.detail[date].record" :key="index+'_'+index2" :class="['result__record', record.type]">
              <div class="result__time">
                <div :class="[record.type, 'label']">
                  <span>{{ (record.type==='buy' ? '買入' : '賣出')+form.symbol.quote }}</span>
                </div>
                <div class="result__datetime">
                  {{ record.time }}
                </div>
              </div>
              <div class="result__info">
                <div class="cell">
                  <span>行情</span><span>{{ np.round(record.price, 5) }}</span>
                </div>
                <div class="cell">
                  <span>手續費</span><span>{{ np.round(record.fee, 5) }}</span>
                </div>
                <div class="cell">
                  <span>成交額</span><span>{{ np.round(record.amount,5) }}</span>
                </div>
              </div>
              <div v-if="record.type==='sell'" class="profit">
                <span class="result__revenue">營利:</span>&nbsp;<span>{{ np.round(record.revenue, 5) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-dialog v-model="showDetailDialog">
      <div v-if="selectedDetail && selectedDetail.result && selectedDetail.result.summary" class="wrapper">
        <div class="block">
          <div><span>網格收益:</span><span>{{ selectedDetail.result.summary.revenue }}</span></div>
          <div><span>浮動盈虧:</span><span>{{ selectedDetail.result.summary.fundChange - selectedDetail.result.summary.revenue }}</span></div>
          <div><span>總收益:</span><span>{{ selectedDetail.result.summary.fundChange }}</span></div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { getPionexKline } from '@/assets/api/frontendApi';
import dayjs from 'dayjs';
import NP from 'number-precision';
import * as echarts from 'echarts';
import GridSimulationWorker from '@/assets/worker/gridSimulation.worker.js';
import { Toast } from 'vant';

NP.enableBoundaryChecking(false);
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

let tradeList = [];

const list = [
  {
    base: 'BNB', quote: 'USDT', label: 'BNB/USDT', type: 'coin',
  },
  {
    base: 'ETH', quote: 'USDT', label: 'ETH/USDT', type: 'coin',
  },
  {
    base: 'BTC', quote: 'USDT', label: 'BTC/USDT', type: 'coin',
  },
  {
    base: 'FTT', quote: 'USDT', label: 'FTT/USDT', type: 'coin',
  },
  {
    base: 'ADA', quote: 'USDT', label: 'ADA/USDT', type: 'coin',
  },
  {
    base: 'BNB1M', quote: 'USDT', label: 'BNB1S/USDT', type: 'index',
  },
  {
    base: 'BNB3P', quote: 'USDT', label: 'BNB3L/USDT', type: 'index',
  }];

const simulationList = [];

export default {
  data() {
    return {
      form: {
        topPrice: 0,
        bottomPrice: 0,
        numberOfGrid: 100,
        startTimeText: '',
        endTimeText: '',
        symbol: list[0],
        fund: 1000,
      },

      optimizationForm: {
        minGridNumber: 0,
        maxGridNumber: 0,
      },

      rangeOptimizationForm: {
        gridNumber: 0,
        bottomPrice: 0,
        topPrice: 0,
        step: 0,
        fund: 1000,
      },

      numberOfGrid: 0,

      startTime: 0,
      endTime: 0,

      showLoading: false,
      symbolList: list,

      fee: 0,

      pendingOrderList: [],
      tradeUnit: 0,
      stockFund: 0,

      lock: false,

      // 統計
      showStatistics: false,
      statistics: {
        summary: {
          fundChange: 0,
          revenue: 0,
          buy: 0,
          sell: 0,
          pair: 0,
        },
        detail: {},
      },

      // 最佳化
      showOptimizationGraph: false,

      totalWorker: 0,
      completedWorker: 0,

      showDetailDialog: false,
      selectedDetail: {},
    };
  },
  computed: {
    np() {
      return NP;
    },
  },
  watch: {
    'form.symbol': {
      handler(val) {
        const vm = this;

        vm.fee = val.type === 'coin' ? 0.05 : 0.1;
      },
      immediate: true,
    },
  },
  mounted() {
    const vm = this;

    vm.form.startTimeText = dayjs().subtract(1, 'day').format('YYYY-MM-DDTHH:mm');
    vm.form.endTimeText = dayjs().format('YYYY-MM-DDTHH:mm');
    // vm.startTimeText = '2021-06-02T17:06';
    // vm.endTimeText = '2021-06-07T00:00';
    vm.startTime = dayjs(vm.form.startTimeText).valueOf();
    vm.endTime = dayjs(vm.form.endTimeText).valueOf();

    vm.$root.$on('showDetail', (i, j) => {
      vm.showDetailDialog = true;
      vm.selectedDetail = simulationList.find((e) => e.key === `${i}-${j}`);
    });
  },
  methods: {
    async calculateGridSimulation({
      numberOfGrid, topPrice, bottomPrice, fund, fee,
    }) {
      return new Promise((resolve) => {
        const worker = new GridSimulationWorker();
        let result;

        const receiveMessage = (payload) => {
          result = payload.data;
          worker.removeEventListener('message', receiveMessage);
          worker.terminate();
          resolve(result);
        };

        worker.addEventListener('message', receiveMessage);

        worker.postMessage({
          cmd: 'simulation',
          data: {
            numberOfGrid,
            topPrice,
            bottomPrice,
            tradeList,
            fund,
            fee,
          },
        });
      });
    },
    jumpToDate(date) {
      window.location.href = `${window.location.origin}#${date}`;
    },
    async prepareData(startTime) {
      const vm = this;

      const res = await getPionexKline(vm.form.symbol.base, vm.form.symbol.quote, startTime, Math.min(startTime + 999 * 60 * 1000, vm.endTime));
      const historyPriceList = res.history_price;

      if (!historyPriceList || historyPriceList.length <= 1) return;

      tradeList = [...tradeList, ...historyPriceList];

      await vm.prepareData(historyPriceList[historyPriceList.length - 1].date * 1000);
    },
    reset() {
      const vm = this;
      tradeList = [];

      vm.statistics = {
        summary: {
          fundChange: 0,
          revenue: 0,
          buy: 0,
          sell: 0,
          pair: 0,
        },
        detail: {},
      };

      vm.lock = false;
    },
    async fetchData() {
      const vm = this;

      vm.startTime = dayjs(vm.form.startTimeText).valueOf();
      vm.endTime = dayjs(vm.form.endTimeText).valueOf();

      vm.showLoading = true;
      await vm.prepareData(vm.startTime);
      vm.showLoading = false;

      tradeList.forEach((item, index) => {
        if (index === 0) {
          return;
        }

        vm.open = tradeList[index - 1].close;
      });

      vm.lock = true;
    },
    async simulate() {
      const vm = this;

      vm.numberOfGrid = vm.form.numberOfGrid;

      if (!tradeList || !tradeList.length) {
        await vm.fetchData();
      }

      vm.statistics = await vm.calculateGridSimulation({
        numberOfGrid: vm.form.numberOfGrid,
        topPrice: vm.form.topPrice,
        bottomPrice: vm.form.bottomPrice,
        tradeList,
        fund: vm.form.fund,
        fee: vm.fee,
      });

      vm.showStatistics = true;
    },
    async gridOptimize() {
      const vm = this;
      const queue = [];
      const simulateList = [];

      if (!tradeList || !tradeList.length) {
        await vm.fetchData();
      }

      const calculate = async (current, max) => {
        if (current < max) {
          const task = (async () => {
            const result = await vm.calculateGridSimulation({
              numberOfGrid: current, topPrice: vm.form.topPrice, bottomPrice: vm.form.bottomPrice, fee: vm.fee, fund: vm.form.fund, tradeList,
            });
            simulateList.push({ grid: current, revenue: result.summary.revenue });
          })();

          queue.push(task);
          calculate(current + 1, max);
        }
      };

      calculate(vm.optimizationForm.minGridNumber, vm.optimizationForm.maxGridNumber);

      await Promise.all(queue);

      simulateList.sort((a, b) => a.grid - b.grid);

      vm.drawLineGridGraph(simulateList);
    },
    async rangeOptimize() {
      const vm = this;

      const { bottomPrice, topPrice } = vm.rangeOptimizationForm;
      const cellList = [];

      const queue = [];

      if (!tradeList || !tradeList.length) {
        Toast.loading({
          duration: 0,
          message: '讀取派網資料中...',
        });
        await vm.fetchData();
      }

      const max = tradeList.reduce((accu, e) => (accu > e.high ? accu : e.high), 0);
      const min = tradeList.reduce((accu, e) => (accu < e.low ? accu : e.low), 0);

      vm.totalWorker = 0;
      vm.completedWorker = 0;

      const toast = Toast.loading({
        duration: 0,
        message: `加載中: ${vm.completedWorker}/${vm.totalWorker}`,
      });

      for (let i = bottomPrice; i <= topPrice; i += vm.rangeOptimizationForm.step) {
        for (let j = i + vm.rangeOptimizationForm.step; j <= topPrice; j += vm.rangeOptimizationForm.step) {
          // eslint-disable-next-line no-continue
          if (i > max || j < min) continue;
          vm.totalWorker += 1;
          // eslint-disable-next-line no-loop-func
          const task = (async () => {
            const result = await vm.calculateGridSimulation({
              numberOfGrid: vm.rangeOptimizationForm.gridNumber,
              topPrice: j,
              bottomPrice: i,
              tradeList,
              fund: vm.rangeOptimizationForm.fund,
              fee: vm.fee,
            });

            simulationList.push({
              key: `${NP.strip((i - bottomPrice) / vm.rangeOptimizationForm.step)}-${NP.strip((j - bottomPrice) / vm.rangeOptimizationForm.step)}`,
              bottomPrice: i,
              topPrice: j,
              result,
            });

            vm.completedWorker += 1;

            const cell = [i, j, result.summary.revenue];

            cellList.push(cell);

            toast.message = `加載中: ${vm.completedWorker}/${vm.totalWorker}`;
          })();

          queue.push(task);
        }
      }

      await Promise.all(queue);
      Toast.clear();

      vm.drawHeatmapGraph(bottomPrice, topPrice, vm.rangeOptimizationForm.step, cellList);
    },
    // 畫網格與收益的折線圖
    drawLineGridGraph(simulateList) {
      const vm = this;
      let dom = vm.$refs.gridRevenue;

      const option = {
        xAxis: {
          type: 'category',
          data: simulateList.map((e) => e.grid),
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: simulateList.map((e) => e.revenue),
          type: 'line',
        }],
      };

      if (!dom) {
        vm.showOptimizationGraph = true;
        vm.$nextTick(() => {
          dom = vm.$refs.gridRevenue;

          vm.chart = echarts.init(dom);
          option && vm.chart.setOption(option);
        });
      } else {
        option && vm.chart.setOption(option);
      }
    },
    drawHeatmapGraph(bottomPrice, topPrice, step, cellList) {
      const vm = this;
      let dom = vm.$refs.gridRevenue;

      const prices = [];

      for (let i = bottomPrice; i <= topPrice; i += step) {
        prices.push(NP.strip(i));
      }

      const max = cellList.reduce((accu, i) => (accu > i[2] ? accu : i[2]), cellList[0][2]);
      const min = cellList.reduce((accu, i) => (accu < i[2] ? accu : i[2]), cellList[0][2]);

      cellList = cellList.map((e) => ([(e[0] - bottomPrice) / step, (e[1] - bottomPrice) / step, NP.strip(e[2], 2)]));

      const option = {
        tooltip: {
          position: 'top',
          triggerOn: 'click',
          formatter(p) {
            return `<div style="text-align:center;"><p>網格收益:${NP.strip(step * p.data[0] + bottomPrice)}~${NP.strip(step * p.data[1] + bottomPrice)}:${NP.strip(p.data[2])}</p><a onclick="window.$nuxt.$root.$emit('showDetail',${NP.strip(p.data[0])}, ${NP.strip(p.data[1])})">查看</a></div>`;
          },
        },
        grid: {
          width: '100%',
          height: '90%',
          top: '5%',
          left: '0',
        },
        xAxis: {
          type: 'category',
          data: prices,
          axisPointer: {
            label: {
              precision: 3,
            },
          },
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: 'category',
          data: prices,
          axisPointer: {
            label: {
              precision: 2,
            },
          },
          splitArea: {
            show: true,
          },
        },
        visualMap: {
          min,
          max,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '15%',
        },
        series: [{
          name: 'Punch Card',
          type: 'heatmap',
          data: cellList,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }],
      };

      if (!dom) {
        vm.showOptimizationGraph = true;
        vm.$nextTick(() => {
          dom = vm.$refs.gridRevenue;

          vm.chart = echarts.init(dom);
          option && vm.chart.setOption(option);
        });
      } else {
        option && vm.chart.setOption(option);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 100%;
}

.grid-input-form {
  display: block;
  width: 40rem;
  margin: 0 auto 2rem;

  &__input {
    display: inline-flex;
    align-items: center;
    width: 75rem;
    margin: 0.5rem 0;
  }

  &__action {
    text-align: center;
  }

  input, select {
    height: 2rem;
    margin-left: 10px;
  }
}

.optimization {
  height: 55rem;
}

.grid-revenue-graph {
  width: 100%;
  height: 100%;
}

.result {
  position: relative;
  width: 60rem;
  margin: auto;

  /deep/ .van-loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
  }

  /deep/ .van-loading__spinner{
    margin-top: 150px;
  }

  &__trade-unit {
    margin-bottom: 1rem;
    color: #11a78f;
    font-weight: bold;
  }

  &__date-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 0.5rem;
    background: #f2f3f5;
  }

  &__date {
    text-align: center;
  }

  &__date-revenue {
    color: #1989fa;
    font-weight: bold;
  }

  .summary-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 1rem;
    background: #f2f3f5;

    .operator {
      font-size: 1.5rem;
    }

    &__column {
      display: inline-flex;
      flex-direction: column;
      text-align: center;

      >span:first-child {
        color: #969799;
        font-size: 0.9rem;
      }
    }
  }

  &__detail {
    margin: auto;
  }

  &__record {
    display: inline-flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem 0;
    border-bottom: 0.05rem solid #dedede;

    .result__time {
      display: flex;
      margin-bottom: 0.5rem;

      .result__datetime {
        margin-left: 1rem;
      }
    }

    .label {
      display: inline-block;
      padding: 0.2rem 0.4rem;
      border-radius: 0.2rem;
      color: #fff;
      font-size: 0.625rem;

      &.buy {
        background: red;
      }

      &.sell {
        background: green;
      }
    }

    .profit {
      color: #1989fa;
      font-weight: bold;
    }
  }

  &__info {
    display: flex;
    justify-content: space-between;

    .cell {
      display: inline-flex;
      flex-direction: column;
      text-align: center;

      > span:first-child {
        color: #969799;
        font-size: 0.95rem;
      }
    }
  }
}

.anchor-wrapper {
  position: sticky;
  top: 0;
  z-index: 1;
  display: inline-flex;
  flex-direction: column;
  float: left;
  height: 100vh;
  padding: 0.6rem;
  overflow: auto;

  .btn-anchor {
    width: 6rem;
    margin-top: 5px;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    color: #fff;
    font-size: 0.875rem;
    background: #969799;
    transform: skewX(-25deg);
  }

  &::-webkit-scrollbar {
    width: 3px;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 0;
    background: #c8c9cc;
  }
}

/deep/ .van-dialog__content{
  padding: 1rem;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
  width: 17rem;
  height: 6.2rem;
  padding: 1rem;
  background-color: #fff;
}
</style>
