<template>
  <div id='app'>
    <section class='section-container'>
      <div class='topon-placement-container' :id="containerId"></div>
      <div id='js-action-sheet' class='action-sheet'>
        <header class='header'>
          以下按钮仅用于流程演示，其并非sdk本身的一部分
        </header>
        <div class='action-item' @click="loadAd">
          <div class='btn'>加载广告</div>
        </div>
        <div class='action-item' @click="adIsReady">
          <div class='btn'>广告isReady?</div>
        </div>
        <div class='action-item' @click="getAd">
          <div class='btn'>获取广告</div>
        </div>
        <div class='action-item' @click="showAd">
          <div class='btn'>展示广告</div>
        </div>
        <div class='action-item' @click="cleanLogger">
          <div class='btn'>清空日志</div>
        </div>
      </div>
    </section>
    <Logger :source-data="errorsList" />
  </div>
</template>

<script>
import Logger from './components/Logger'
import config from '../../config.json'
// 局部引入
// import TOPON_H5_SDK from "@topon/h5-sdk"

const configure = config.configure

export default {
  name: 'App',
  components: {
    Logger
  },

  data() {
    return {
      // 参数
      configure: configure,

      placementInstance: null, // 广告实例
      currentAd: null, // 当前广告数据
      loadFailed: false, // 广告加载失败
      loadSussed: false, // 广告加载成功
      errorsList: [],
      isReady: false,
      showed: false
    }
  },

  computed: {
    containerId() {
      return `topon-placement-${this.$data.configure.placementOptions.placementId}`
    },
  },

  mounted() {
    this.initial()
  },

  methods: {
    initial() {
      // 初始化SDK
      this.$TOPON_H5_SDK.init(this.$data.configure.initOptions)
      // 初始化广告位
      this.initPlacement()
    },

    initPlacement() {
      this.$data.placementInstance = this.$TOPON_H5_SDK.initPlacement(this.$data.configure.placementOptions)

      // 注册回调监听
      this.$data.placementInstance.onLoad = this.adLoad
      this.$data.placementInstance.onError = this.adError
      this.$data.placementInstance.onShow = this.adShow
      this.$data.placementInstance.onClick = this.adClick
      this.$data.placementInstance.onClose = this.adClose
    },

    // 广告有填充，则执行成功回调onLoad
    adLoad(res) {
      this.trackLogger(`onLoad回调`, res, 'success')
      this.$data.loadSussed = true
      // 请确保是在填充成功回调后再获取并展示广告
      // 推荐写法：在onLoad回调用getAd()获取广告数据并展示广告
      // this.showAd()
    },

    // 广告无填充，则执行失败回调onError
    adError(err) {
      this.trackLogger(`onError回调`, err, 'error')
    },

    // 广告曝光成功，则执行onSHow回调
    adShow(res) {
      this.trackLogger(`onShow回调`, res, 'primary')
      this.$data.showed = true
    },

    // 广告被点击，则执行onClick回调
    adClick(res) {
      this.trackLogger(`onClick回调`, res, 'primary')
    },

    // 广告被关闭，则执行onClose回调
    adClose(res) {
      this.trackLogger(`onClose回调`, res, 'primary')
    },

    // 获取广告数据 : 请在成功回调onLoad后再获取广告数据
    getAd() {
      if (this.$data.loadSussed) {
        const currentAd = this.getAdData()
        if (currentAd) {
          this.$data.currentAd = currentAd
          this.trackLogger(`执行getAd()获取广告数据`, currentAd)
        } else {
          this.trackLogger(
            `尝试getAd()获取广告数据`,
            '当前无可用广告，请刷新广告',
            'warning'
          )
        }
      } else {
        this.trackLogger(
          `尝试getAd()获取广告数据`,
          '当前无可用广告，请刷新广告',
          'warning'
        )
      }
    },

    getAdData () {
      if (!this.$data.placementInstance) {
        return null
      }
      return this.$data.placementInstance.getAd() || null
    },

    // 展示广告
    showAd() {
      if (!this.$data.currentAd) {
        this.$data.currentAd = this.getAdData()
      }
      // const existAd = this.$data.loadSussed && this.$data.currentAd && this.$data.isReady && !this.$data.showed
      const existAd = this.$data.loadSussed && this.$data.currentAd
      if (existAd) {
        this.trackLogger(`执行show()展示广告`, this.$data.currentAd)
        this.$data.placementInstance.show()
      } else {
        this.trackLogger(
          `尝试show()展示广告`,
          '当前无广告数据，请获取广告数据或刷新广告',
          'warning'
        )
      }
    },

    /**
     * 手动拉取广告，此仅为示例，是否以及如何重新load的判断条件请根据实际业务需要来写
     * 1: 请确保有placementInstance情况下再尝试重新load广告，否则不做处理
     * 2: 若有填充即有onLoad回调，则请在getAd消费广告后再尝试重新load广告，否则不做处理
     * 3: 若是在接到错误回调后即onError尝试重新load广告，请做好次数限制、时间间隔等条件的处理，根据业务实际需要进行判断是否需要在onError
     **/
    loadAd() {
      if (this.$data.loadSussed && !this.$data.showed) {
        this.trackLogger(
          `尝试刷新广告`,
          '有未曝光的广告，请将填充的广告曝光后再重新load广告',
          'warning'
        )
        return
      }
      if (this.$data.placementInstance) {
        // 清空掉上一次的广告数据
        this.$data.currentAd = null
        this.$data.loadFailed = false
        this.$data.loadSussed = false
        this.$data.isReady = false
        this.$data.showed = false
        this.$data.placementInstance.load()
        this.trackLogger(`执行load()`, '刷新广告')
      }
    },

    // 广告是否ready
    adIsReady() {
      if (this.$data.placementInstance) {
        const isReady = this.$data.placementInstance.isReady()
        this.trackLogger(`执行isReady()`, isReady)
        this.$data.isReady = isReady
      } else {
        this.trackLogger(`尝试isReady()`, '未初始化广告，请初始化', 'warning');
      }
    },

    // 日志收集
    trackLogger(label, data, type = 'info') {
      let output = data
      const errors = data ? data.errors : []
      if (data && typeof data === 'object') {
        output = JSON.parse(JSON.stringify(data))
        delete output['errors'];
        output = JSON.stringify(output)
      }
      const target = {
        label,
        output: output,
        errors,
        type,
      }
      this.$data.errorsList.unshift(target)
    },

    cleanLogger() {
      this.$data.errorsList = []
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.section-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.header {
  width: 100%;
  text-align: center;
  font-size: 20px;
  color: #696969;
}
.action-sheet {
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 60px;
}
.action-item {
  margin: 10px auto;
  text-align: center;
}
.btn {
  margin: 0 auto;
  width: 200px;
  height: 46px;
  line-height: 46px;
  background-color: #2e82ff;
  color: #ffffff;
  font-size: 18px;
  text-align: center;
  border-radius: 10px;
}

.btn:hover {
  cursor: pointer;
}
</style>
