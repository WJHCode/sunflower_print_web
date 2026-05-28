<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  FormatPainterOutlined, 
  CalculatorOutlined, 
  ReadOutlined,
  HomeOutlined
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
      <button class="logo" type="button" @click="router.push('/')">
        <span class="logo-mark">日</span>
        <span>向日葵打印</span>
      </button>
      <div class="actions">
        <a-button class="home-button" shape="round" @click="router.push('/')">
          <template #icon><HomeOutlined /></template>
          返回首页
        </a-button>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="212" class="sider">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          class="subject-menu"
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
      <a-layout class="main-layout">
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
  background: #f7f5ef;
}
.header {
  background: #fffdf7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  box-shadow: 0 1px 0 rgba(58, 74, 62, 0.1);
  z-index: 10;
}
.logo {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  font-size: 18px;
  font-weight: 700;
  color: #233126;
  cursor: pointer;
}
.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f6c84c;
  color: #2c3b2b;
  box-shadow: 0 8px 18px rgba(140, 108, 31, 0.16);
}
.actions {
  display: flex;
  align-items: center;
}
.home-button {
  color: #2f7d46;
  border-color: rgba(47, 125, 70, 0.32);
  background: #f8fbf5;
}
.sider {
  background: #fffdf7 !important;
  box-shadow: 1px 0 0 rgba(58, 74, 62, 0.1);
  z-index: 9;
  padding-top: 18px;
}
.subject-menu {
  background: transparent;
}
.subject-menu :deep(.ant-menu-item) {
  width: auto;
  margin: 6px 14px;
  border-radius: 8px;
  color: #4b5b4d;
}
.subject-menu :deep(.ant-menu-item-selected) {
  background: #e8f3ea;
  color: #2f7d46;
  font-weight: 700;
}
.subject-menu :deep(.ant-menu-item-selected::after) {
  display: none;
}
.main-layout {
  padding: 24px;
  background: #f7f5ef;
}
.content {
  background: transparent;
  min-height: 280px;
  height: 100%;
}

@media (max-width: 768px) {
  .generator-layout {
    height: 100dvh;
    overflow: hidden;
  }

  .header {
    height: auto;
    min-height: 58px;
    padding: 10px 14px;
    line-height: 1.2;
  }

  .logo {
    min-width: 0;
    font-size: 16px;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
  }

  .home-button {
    height: 32px;
    padding-inline: 11px;
    font-size: 13px;
  }

  .generator-layout > :deep(.ant-layout) {
    width: 100%;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
  }

  .sider {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    flex: 0 0 auto !important;
    padding: 8px 8px 6px;
    box-shadow: 0 1px 0 rgba(58, 74, 62, 0.1);
  }

  .subject-menu {
    display: flex;
    height: auto !important;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
  }

  .subject-menu::-webkit-scrollbar {
    display: none;
  }

  .subject-menu :deep(.ant-menu-item) {
    flex: 0 0 auto;
    height: 36px;
    line-height: 36px;
    margin: 0 4px;
    padding-inline: 12px;
  }

  .subject-menu :deep(.ant-menu-title-content) {
    margin-inline-start: 6px;
  }

  .main-layout {
    width: 100% !important;
    flex: 1 1 auto !important;
    min-width: 0;
    min-height: 0;
    padding: 12px;
    overflow: hidden;
  }

  .content {
    width: 100% !important;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
}

@media print {
  .generator-layout {
    display: block !important;
    height: auto !important;
    min-height: 0 !important;
    background: #fff !important;
  }
  .header,
  .sider {
    display: none !important;
  }
  .main-layout {
    display: block !important;
    padding: 0 !important;
    background: #fff !important;
  }
  .content {
    display: block !important;
    height: auto !important;
    min-height: 0 !important;
    background: #fff !important;
  }
}
</style>
