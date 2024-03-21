const express = require('express')
const ip = require('ip')
const path = require('path')
const opener = require('opener')
const yargs = require('yargs-parser')
const pkg = require('./package.json')
const config = require('../config.json')

const CMD = process.cwd()

const log = console.log


const rawArgv = process.argv.slice(2)
const args = rawArgv.join(' ')
const parserArgs = yargs(args)

const host = parserArgs.host ?? `http://${ip.address()}`
const port = parserArgs.port ?? 80

const app = express()

app.set('port', port)

// 静态目录
app.use(express.static(path.resolve(CMD, 'assets')))

// 模板引擎
app.set('view engine', 'hbs')
app.set('views', path.resolve(CMD, 'views'))

// 使用handlebars模板进行渲染
app.get('/', function (request, response) {
  const { configure } = config
  const data = {
    title: pkg.title,
    // 当前sdk版本
    sdkVersion: pkg.version,
    // 初始化SDK、广告位所需参数
    configure: JSON.stringify(configure),
    // 广告容器ID
    containerId: configure.placementOptions.containerId
  }
  response.render('index', data)
})

// 直接渲染html
app.get('/example', function (request, response) {
  response.setHeader('Content-Type', 'text/html')
  response.sendFile(path.resolve(`${CMD}/public/index.html`))
})

let timerId = null

function startUp() {
  const serverInstant = addServerListener(app, serverListener)

  serverInstant.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use, Will use ${Number(port) + 3}`)
      timerId && clearTimeout(timerId)
      timerId = setTimeout(() => {
        port = Number(port) + 3
        app.set('port', port)
        startUp()
      }, 2000)
    }
  })
}

function addServerListener (server, listener) {
  return server.listen(app.get('port'), listener)
}

function serverListener () {
  const url = `${host}:${port}`
  log(`server open on ${url}`)
  opener(url)
}

startUp()