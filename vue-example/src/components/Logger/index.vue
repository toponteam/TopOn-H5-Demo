<template>
  <section class='logs-section'>
    <header class='logs-header'>
      <span>日志列表</span>
    </header>
    <ul id='logs-list'>
      <li v-for="(item, idx) in sourceData" :key="idx" :class="listStyle(item)">
        {{ formatDateTime }} =>> {{ item.label }} : {{ item.output }}
        <template v-if="item.errors">
          <ul>
            <li v-for="(child, k) in item.errors" :key="k">
              {{ JSON.stringify(child) }}
            </li>
          </ul>
        </template>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: 'LoggerSession',
  props: {
    sourceData: Array,
  },

  computed: {
    formatDateTime () {
      const dateTime = new Date()
      const date = dateTime.toLocaleDateString()
      const time = dateTime.toLocaleTimeString()
      return date + ' ' + time
    },

    listStyle () {
      return function(item) {
        return `logs-item logs-${item.type}`
      }
    }
  }
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.logs-header {
  width: 120px;
  font-size: 18px;
  text-align: left;
  margin-bottom: 10px;
}

.logs-section {
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  text-align: left;
  box-sizing: border-box;
  border: 1px solid #CCCCCC;
  border-radius: 10px;
  min-height: 200px;
  max-height: 1000px;
  overflow-y: auto;
  background-color: aliceblue;
}

.logs-item {
  padding: 6px 0;
  box-sizing: border-box;
}

.logs-error {
  color: #F56C6C;
}

.logs-success {
  color: #67C23A;
}

.logs-primary {
  color: #409EFF;
}

.logs-warning {
  color: #E6A23C;
}

.errors-title {
  color: #A52A2A !important;
}
</style>
