import React, { Component } from 'react'
import Logger from './components/Logger'

// 导入sdk参数，此处为方便示例演示，采用分离配置的方法，实际应用中请根据自身项目需要组织代码
import config from '../../config.json'

// 局部引入
// import TOPON_H5_SDK from "@topon/h5-sdk"

import './App.css'

const configure = config.configure

class App extends Component {
  constructor(...props) {
    super(...props)
    this.state = {
      // 参数
      configure: configure,

      currentAd: null, // 当前广告数据
      loadFailed: false, // 广告加载失败
      loadSussed: false, // 广告加载成功
      errorsList: [],
      isReady: false,
      showed: false
    }

    this.initial = this.initial.bind(this)
    this.initPlacement = this.initPlacement.bind(this)
    this.loadAd = this.loadAd.bind(this)
    this.adIsReady = this.adIsReady.bind(this)
    this.getAd = this.getAd.bind(this)
    this.showAd = this.showAd.bind(this)
    this.trackLogger = this.trackLogger.bind(this)
    this.cleanLogger = this.cleanLogger.bind(this)

    this.adLoad = this.adLoad.bind(this)
    this.adError = this.adError.bind(this)
    this.adShow = this.adShow.bind(this)
    this.adClick = this.adClick.bind(this)
    this.adClose = this.adClose.bind(this)
  }

  placementInstance = null

  componentDidMount() {
    this.initial()
  }


  initial() {
    // 初始化SDK
    window.$TOPON_H5_SDK.init(this.state.configure.initOptions)
    // 初始化广告位
    this.initPlacement()
  }

  initPlacement() {
    this.placementInstance = window.$TOPON_H5_SDK.initPlacement(this.state.configure.placementOptions)

    // 注册回调监听
    this.placementInstance.onLoad = this.adLoad
    this.placementInstance.onError = this.adError
    this.placementInstance.onShow = this.adShow
    this.placementInstance.onClick = this.adClick
    this.placementInstance.onClose = this.adClose
  }

  // 广告有填充，则执行成功回调onLoad
  adLoad(res) {
    this.trackLogger(`onLoad回调`, res, 'success')
    this.setState({ loadSussed: true })
    // 请确保是在填充成功回调后再获取并展示广告
    // 推荐写法：在onLoad回调用getAd()获取广告数据并展示广告
    // this.showAd()
  }

  // 广告无填充，则执行失败回调onError
  adError(err) {
    this.trackLogger(`onError回调`, err, 'error')
  }

  // 广告曝光成功，则执行onSHow回调
  adShow(res) {
    this.trackLogger(`onShow回调`, res, 'primary')
    this.setState({ showed: true })
  }

  // 广告被点击，则执行onClick回调
  adClick(res) {
    this.trackLogger(`onClick回调`, res, 'primary')
  }

  // 广告被关闭，则执行onClose回调
  adClose(res) {
    this.trackLogger(`onClose回调`, res, 'primary')
  }

  // 获取广告数据 : 请在成功回调onLoad后再获取广告数据
  getAd() {
    if (this.state.loadSussed) {
      const currentAd = this.getAdData()
      if (currentAd) {
        this.setState({ currentAd })
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
  }

  getAdData () {
    if (!this.placementInstance) {
      return null
    }
    return this.placementInstance.getAd() || null
  }

  // 展示广告
  showAd() {
    let currentAd = this.state.currentAd
    if (!currentAd) {
      currentAd = this.getAdData()
      this.setState({ currentAd })
    }
    // const existAd = this.state.loadSussed && this.state.currentAd && this.state.isReady && !this.state.showed
    const existAd = this.state.loadSussed && currentAd
    if (existAd) {
      this.trackLogger(`执行show()展示广告`, currentAd)
      this.placementInstance.show()
    } else {
      this.trackLogger(
        `尝试show()展示广告`,
        '当前无广告数据，请获取广告数据或刷新广告',
        'warning'
      )
    }
  }

  /**
   * 手动拉取广告，此仅为示例，是否以及如何重新load的判断条件请根据实际业务需要来写
   * 1: 请确保有placementInstance情况下再尝试重新load广告，否则不做处理
   * 2: 若有填充即有onLoad回调，则请在getAd消费广告后再尝试重新load广告，否则不做处理
   * 3: 若是在接到错误回调后即onError尝试重新load广告，请做好次数限制、时间间隔等条件的处理，根据业务实际需要进行判断是否需要在onError
   **/
  loadAd() {
    if (this.state.loadSussed && !this.state.showed) {
      this.trackLogger(
        `尝试刷新广告`,
        '有未曝光的广告，请将填充的广告曝光后再重新load广告',
        'warning'
      )
      return
    }
    if (this.placementInstance) {
      // 清空掉上一次的广告数据
      this.setState({
        currentAd: null,
        loadFailed: false,
        loadSussed: false,
        isReady: false,
        showed: false
      })
      this.placementInstance.load()
      this.trackLogger(`执行load()`, '刷新广告')
    }
  }

  // 广告是否ready
  adIsReady() {
    if (this.placementInstance) {
      const isReady = this.placementInstance.isReady()
      this.trackLogger(`执行isReady()`, isReady)
      this.setState({ isReady: isReady })
    } else {
      this.trackLogger(`尝试isReady()`, '未初始化广告，请初始化', 'warning')
    }
  }

  // 日志收集
  trackLogger(label, data, type = 'info') {
    let output = data
    const errors = data ? data.errors : []
    if (data && typeof data === 'object') {
      output = JSON.parse(JSON.stringify(data))
      delete output['errors']
      output = JSON.stringify(output)
    }
    const target = {
      label,
      output: output,
      errors,
      type,
    }
    const { errorsList } = this.state
    const targetList = [...errorsList]
    targetList.unshift(target)
    this.setState({ errorsList: targetList })
  }

  cleanLogger() {
    this.setState({ errorsList: [] })
  }

  render() {
    const { errorsList } = this.state
    const containerId = `topon-placement-${this.state.configure.placementOptions.placementId}`;
    return (
      <div className='App'>
        <section className='section-container'>
          <div className='topon-placement-container' id={containerId}></div>
          <div id='js-action-sheet' className='action-sheet'>
            <header className='header'>
              以下按钮仅用于流程演示，其并非sdk本身的一部分
            </header>
            <div className='action-item' onClick={this.loadAd.bind(this)}>
              <div className='btn'>加载广告</div>
            </div>
            <div className='action-item' onClick={this.adIsReady.bind(this)}>
              <div className='btn'>广告isReady?</div>
            </div>
            <div className='action-item' onClick={this.getAd.bind(this)}>
              <div className='btn'>获取广告</div>
            </div>
            <div className='action-item' onClick={this.showAd.bind(this)}>
              <div className='btn'>展示广告</div>
            </div>
            <div className='action-item' onClick={this.cleanLogger.bind(this)}>
              <div className='btn'>清空日志</div>
            </div>
          </div>
        </section>
        <Logger sourceData={errorsList} />
      </div>
    )
  }
}

export default App
