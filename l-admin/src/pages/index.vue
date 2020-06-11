<template>
  <div class="box">
    <h2 class="title">文章访问次数统计</h2>
    <div class="box-content">
      <div class="table-header clearfix">
        <post-selector
          :autoSetFirst="true"
          :autoSetFirstCallBack="setAccessChartData"
          emptyOption
          emptyOptionLabel="请选择统计文章"
          class="wd12 item"
          v-model="accessChartFormInfo.postId"
        />
        <el-select
          class="wd6 item"
          v-model="accessChartFormInfo.day"
          size="small">
          <el-option label="请选择统计天数" value="" disabled></el-option>
          <el-option
            v-for="item in accessChartDaySelectData"
            :key="'access_day_' + item"
            :label="'最近 ' + item + ' 天'"
            :value="item">
          </el-option>
        </el-select>
        <el-input
          v-model="accessChartFormInfo.postId"
          size="small"
          class="wd6 item"
          clearable
          placeholder="文章ID"></el-input>
        <el-button
          :loading="accessChartLoading"
          @click="setAccessChartData"
          type="primary"
          size="small"
          class="item"
          icon="el-icon-document">立即统计</el-button>
      </div>
      <div class="chart-box">
        <v-chart ref="accessChart" :options="accessChartData" autoresize />
      </div>
    </div>
  </div>
</template>

<script>
  import PostAccessLogic from '../logic/post_access';
  import Util from '../utils/util';
  import postSelector from '../components/selector/post-selector';
  import MSG from '../utils/message';

  import ECharts from 'vue-echarts'
  import 'echarts/lib/chart/line'
  import 'echarts/lib/component/tooltip'
  import 'echarts/lib/component/polar'

  export default {
    components: {
      'v-chart': ECharts,
      'post-selector': postSelector,
    },
    data() {
      return {
        accessChartLoading: false,
        accessChartFormInfo: {
          postId: undefined,
          day: 30,
        },

        accessChartData: {
          tooltip: {
            trigger: 'axis',
            formatter: '日期: {b}<br>访问: {c}'
          },
          xAxis: {
            type: 'category',
            name: '统计日期',
            boundaryGap: false,
            axisLabel: {
              rotate: 45
            },
            data: [],
          },
          yAxis: {
            type: 'value',
            name: '访问量',
          },
          series: [{
            data: [],
            type: 'line',
            lineStyle: {
              color: '#EB4858',
            },
          }],
          grid: {
            left: 60,
            bottom: 80,
          }
        },
      };
    },
    computed: {
      title: function() {
        return this.$route.meta.title;
      },
      accessChartDaySelectData() {
        return [ 7, 14, 30, 60, 90, 120, 240, 360 ];
      },
    },
    methods: {
      async setAccessChartData() {
        let { postId, day } = this.accessChartFormInfo;

        if(Util.isNullStr(postId)) {
          MSG.error('请选择文章');
          return;
        }

        const accessChart = this.$refs.accessChart;

        try {
          this.accessChartLoading = true;
          accessChart.showLoading();
          
          const rt = await PostAccessLogic.getAccessChartData(postId, day);

          if(rt.code === 200) {
            let days = [];
            let nums = [];

            rt.list.reverse().map(item => {
              days.push(item.day);
              nums.push(item.num);
            });

            this.accessChartData = {
              ...this.accessChartData,
              xAxis: {
                ...this.accessChartData.xAxis,
                data: days,
              },
              series: [{
                ...this.accessChartData.series[0],
                data: nums,
              }]
            }
          }else {
            MSG.error(rt.message);
          }

          this.accessChartLoading = false;
          accessChart.hideLoading();
        }catch(e) {
          this.accessChartLoading = false;
          accessChart.hideLoading();
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .chart-box {
    width: 100%;
    height: 460px;

    .echarts {
      width: 100%;
      height: 100%;
    }
  }
</style>