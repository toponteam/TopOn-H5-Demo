var loadFailed = false // 填充失败
var loadSussed = false // 填充成功
var currentAd = null // 当前广告数据
var showed = false // 广告是否已曝光
var isReady = false // 广告是否ready
var placementInstance = null // 广告实例
var loadComplete = false // 广告load是否加载完成，接收到onLoad或者onError意味着完成一次广告load

/* ==================== 不同业务场景|条件编写示例，仅为示例，请从自身实际需要出发编写业务 ==================== */

var reLoadAtError = configure?.testOptions?.reLoadAtError ?? false // 无填充时是否重新尝试load广告
var reLoadLimit = configure?.testOptions?.reLoadLimit ?? 10 // 最大重试load广告次数
var reLoadTimeout = configure?.testOptions?.reLoadTimeout ?? 3000 // 重试load广告时间间隔
var reLoadCode = configure?.testOptions?.reLoadCode ?? [19002, 21004, 22000] // 需要尝试重新load广告的错误码，错误码详见[文档](https://h5-docs.toponad.com/docs/sdk-access).
var autoPlay = configure?.testOptions?.autoPlay ?? false // 广告填充后是否自动展示广告

var reLoadTimes = 0 // 已重试load次数
var timerId = null // 定时器ID

var requestStart = Date.now()
var requestEnd = Date.now()
var doc = document

window.TOPON_H5_SDK = window.TOPON_H5_SDK || {}

initial()

function initial () {
  trackLogger(
    `执行init()`,
    '初始化SDK appId = ' + configure.initOptions.appId,
    'primary'
  )
  requestStart = Date.now()
  // 初始化SDK
  window.TOPON_H5_SDK.init(configure.initOptions)
  initPlacement()
}

function initPlacement () {
  trackLogger(
    `执行initPlacement()`,
    '初始化广告位 placementId = ' + configure.placementOptions.placementId,
    'primary'
  )
  // 初始化广告位
  placementInstance = TOPON_H5_SDK.initPlacement(configure.placementOptions)

  trackLogger(
    `AD Loading`,
    'Please wait...',
    'primary'
  )

  // 注册回调监听
  placementInstance.onLoad = adLoad
  placementInstance.onError = adError
  placementInstance.onShow = adShow
  placementInstance.onClick = adClick
  placementInstance.onClose = adClose
  placementInstance.onReward = adReward
  placementInstance.onVideoStart = adVideoStart
  placementInstance.onVideoEnd = adVideoEnd
}

// 广告有填充，则执行成功回调onLoad
function adLoad (res) {
  trackLogger(`onLoad回调`, res, 'success')
  loadSussed = true
  loadComplete = true
  requestEnd = Date.now()
  const diff = requestEnd - requestStart
  trackLogger(`AD LoadTime`, diff + 'ms', 'success')
  // 请确保是在填充成功回调后再获取并展示广告
  // 推荐写法：在onLoad回调用getAd()获取广告数据并展示广告
  if (autoPlay) {
    showAd()
  }
}

// 广告无填充，则执行失败回调onError
function adError (err) {
  trackLogger(`onError回调`, err, 'error')
  loadComplete = true
  // 非展示失败
  if (err.code !== 21005) {
    requestEnd = Date.now()
    const diff = requestEnd - requestStart
    trackLogger(`AD LoadTime`, diff + 'ms', 'error')
  }
  if (reLoadAtError && reLoadCode.includes(err.code) && reLoadTimes < reLoadLimit) {
    timerId && clearTimeout(timerId)
    timerId = setTimeout(function () {
      loadAd()
    }, reLoadTimeout)
  }
}

// 广告曝光成功，则执行onSHow回调
function adShow (res) {
  trackLogger(`onShow回调`, res, 'primary')
}

// 广告被点击，则执行onClick回调
function adClick (res) {
  trackLogger(`onClick回调`, res, 'primary')
}

// 广告被关闭，则执行onClose回调
function adClose (res) {
  trackLogger(`onClose回调`, res, 'primary')
}

// 广告获得激励，则执行onReward回调
function adReward (res) {
  trackLogger(`onReward回调`, res, 'primary')
}

function adVideoStart (res) {
  trackLogger(`onVideoStart回调`, res, 'primary')
}

function adVideoEnd (res) {
  trackLogger(`onVideoEnd回调`, res, 'primary')
}

// 获取广告数据
function getAd () {
  if (loadSussed) {
    currentAd = getAdData()
    if (currentAd) {
      trackLogger(`执行getAd()获取广告数据`, currentAd)
    } else {
      trackLogger(
        `尝试getAd()获取广告数据`,
        '当前无可用广告，请刷新广告',
        'warning'
      )
    }
  } else {
    trackLogger(
      `尝试getAd()获取广告数据`,
      '当前无可用广告，请刷新广告',
      'warning'
    )
  }
}

function getAdData () {
  if (!placementInstance) {
    return null
  }
  return placementInstance.getAd() || null
}

// 展示广告
function showAd () {
  if (!currentAd) {
    currentAd = getAdData()
    trackLogger(`执行getAd()获取广告数据`, currentAd)
  }
  var existAd = loadSussed && currentAd
  if (existAd) {
    trackLogger(`执行show()展示广告`, currentAd)
    placementInstance.show()
    showed = true
  } else {
    trackLogger(
      `尝试show()展示广告`,
      '当前无广告数据，请获取广告数据或刷新广告',
      'warning'
    )
  }
}

// 刷新广告
function loadAd () {
  if (!loadComplete) {
    trackLogger(
      `尝试刷新广告`,
      '广告loading中， 不予刷新',
      'warning'
    )
    return
  }
  /**
  * 手动拉取广告，此仅为示例，是否以及如何重新load的判断条件请根据实际业务需要来写
  * 1: 请确保有placementInstance情况下再尝试重新load广告，否则不做处理
  * 2: 若有填充即有onLoad回调，则请在getAd消费广告后再尝试重新load广告，否则不做处理
  * 3: 若是在接到错误回调后即onError尝试重新load广告，请做好次数限制、时间间隔等条件的处理，根据业务实际需要进行判断是否需要在onError
  */
  if (loadSussed && !showed) {
    trackLogger(
      `尝试刷新广告`,
      '有未曝光的广告，请将填充的广告曝光后再重新load广告',
      'warning'
    )
    return
  }
  if (placementInstance) {
    // 清空掉上一次的广告数据
    currentAd = null
    loadFailed = false
    loadSussed = false
    showed = false
    isReady = false
    loadComplete = false
    requestStart = Date.now()
    reLoadTimes++
    placementInstance.load()
    trackLogger(`执行load()`, `刷新广告${reLoadTimes}次`, 'primary')
  }
}

// 广告是否ready
function adIsReady () {
  if (placementInstance) {
    isReady = placementInstance.isReady()
    const type = isReady ? 'success' : 'error'
    trackLogger(`执行isReady()`, isReady, type)
  } else {
    trackLogger(`尝试isReady()`, '未初始化广告，请初始化', 'warning')
  }
}

function create (tag) {
  return doc.createElement(tag)
}

// 添加日志
function trackLogger (label, data, type = 'info') {
  var li = create('li')
  var output = data
  var errors = data ? data.errors : []
  if (data && typeof data === 'object') {
    output = JSON.parse(JSON.stringify(data))
    delete output['errors']
    output = JSON.stringify(output)
  }
  li.className = `logs-item logs-${type}`
  li.innerHTML = `${formatDateTime()} => ${label} : ${output}`
  if (errors && errors.length > 1) {
    var ul = create('ul')
    var div = create('div')
    div.className = 'errors-title'
    div.innerHTML = 'onError 错误栈 errors ：'
    ul.appendChild(div)
    for (var i = 0; i < errors.length; i++) {
      var child = create('li')
      child.innerHTML = JSON.stringify(errors[i])
      ul.appendChild(child)
    }
    li.appendChild(ul)
  }
  var element = doc.querySelector('#logs-list')
  element && element.insertBefore(li, element.firstChild)
}

function cleanLogger () {
  var element = doc.querySelector('#logs-list')
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function formatDateTime () {
  var dateTime = new Date()
  var date = dateTime.toLocaleDateString()
  var time = dateTime.toLocaleTimeString()
  return date + ' ' + time
}

// 清空所有以TOPON_AD_CACHE开头的缓存数据
function cleanCache () {
  var data = window.localStorage
  for (const item in data) {
    if (Object.prototype.hasOwnProperty.call(data, item) && item.includes('TOPON_AD_CACHE')) {
      window.localStorage.removeItem(item)
    }
  }
}

function isJsonString (val) {
  if (typeof val === 'string') {
    try {
      const obj = JSON.parse(val)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }
}

function getQueryString (key) {
  var reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)')
  var result = window.location.search.substr(1).match(reg)
  return result ? decodeURIComponent(result[2]) : null
}
