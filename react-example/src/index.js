import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

// 注意：暂未提供npm包，目前仅支持通过script引入
import TOPON_H5_SDK from "@topon/h5-sdk"
// SDK挂载至全局
window.$TOPON_H5_SDK = TOPON_H5_SDK

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  // !TIPS: StrictMode在调试模式下，App会执行两次
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
