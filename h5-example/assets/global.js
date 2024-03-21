
// 请替换为您在topon后台的应用id、广告位id和appKey
var configure = {
  initOptions: {
    appId: "appid1234567",
    appKey: "appkey1234567"
  },
  placementOptions: {
    placementId: "plid1234567",
    containerId: "ad-box-plid1234567"
  }
}

function setAdContainer () {
  var adContainer = document.querySelector('.topon-placement-container')
  var elId = adContainer.getAttribute('id')
  if (adContainer && !elId) {
    var id = configure.placementOptions.containerId || 'topon-placement-' + configure.placementOptions.placementId
    adContainer.setAttribute('id', id)
  }
}

// 绑定id
setAdContainer()