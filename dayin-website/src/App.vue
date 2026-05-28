<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>

<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<style>
/* Remove default vite styles */
body {
  margin: 0;
  padding: 0;
  background-color: #f7f5ef;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

@media (max-width: 768px) {
  html,
  body,
  #app {
    min-width: 0;
    overflow-x: hidden;
  }
}

@media print {
  html,
  body,
  #app {
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    background: #fff !important;
  }
}
</style>
