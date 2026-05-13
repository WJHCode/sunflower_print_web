<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  FormatPainterOutlined, 
  CalculatorOutlined, 
  ReadOutlined,
  PrinterOutlined 
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();

const selectedKeys = computed({
  get: () => {
    if (route.path.includes('/chinese')) return ['chinese'];
    if (route.path.includes('/english')) return ['english'];
    return ['math'];
  },
  set: (keys: string[]) => {
    const key = keys[0];
    if (key === 'math') router.push('/generator/math');
    if (key === 'chinese') router.push('/generator/chinese');
    if (key === 'english') router.push('/generator/english');
  }
});
</script>

<template>
  <a-layout class="generator-layout">
    <a-layout-header class="header">
      <div class="logo">向日葵打印</div>
      <div class="actions">
        <a-button type="primary" shape="round">
          <template #icon><PrinterOutlined /></template>
          升级VIP，无限制打印
        </a-button>
        <a-avatar style="background-color: #87d068" class="ml-4">User</a-avatar>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff" class="sider">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-menu-item key="math">
            <template #icon><CalculatorOutlined /></template>
            数学练习题
          </a-menu-item>
          <a-menu-item key="chinese">
            <template #icon><ReadOutlined /></template>
            语文练习题
          </a-menu-item>
          <a-menu-item key="english">
            <template #icon><FormatPainterOutlined /></template>
            英语练习题
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 24px">
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.generator-layout {
  height: 100vh;
}
.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}
.actions {
  display: flex;
  align-items: center;
}
.ml-4 {
  margin-left: 16px;
}
.sider {
  box-shadow: 2px 0 8px 0 rgba(29,35,41,.05);
  z-index: 9;
}
.content {
  background: transparent;
  min-height: 280px;
  height: 100%;
}
</style>
