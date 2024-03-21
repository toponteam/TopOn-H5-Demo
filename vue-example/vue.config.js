const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    open: true,
    proxy: 'http://192.168.86.167:3000',
    port: 8087
  }
});
