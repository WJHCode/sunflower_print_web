<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  FormatPainterOutlined, 
  CalculatorOutlined, 
  ReadOutlined,
  HomeOutlined,
  FileTextOutlined,
  PictureOutlined,
  MessageOutlined
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();

const isScrollableLayout = computed(() => route.path.includes('/feedback'));

const selectedKeys = computed({
  get: () => {
    if (route.path.includes('/chinese')) return ['chinese'];
    if (route.path.includes('/english')) return ['english'];
    if (route.path.includes('/note')) return ['note'];
    if (route.path.includes('/drawing')) return ['drawing'];
    if (route.path.includes('/feedback')) return ['feedback'];
    return ['math'];
  },
  set: (keys: string[]) => {
    const key = keys[0];
    if (key === 'math') router.push('/generator/math');
    if (key === 'chinese') router.push('/generator/chinese');
    if (key === 'english') router.push('/generator/english');
    if (key === 'note') router.push('/generator/note');
    if (key === 'drawing') router.push('/generator/drawing');
    if (key === 'feedback') router.push('/generator/feedback');
  }
});

// Scroll indicator state and logic
const menuRef = ref<any>(null);
const scrollProgress = ref(0);
const showIndicator = ref(false);

const updateScrollInfo = () => {
  nextTick(() => {
    const el = menuRef.value?.$el;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth > clientWidth) {
      showIndicator.value = window.innerWidth <= 768;
      const maxScroll = scrollWidth - clientWidth;
      scrollProgress.value = maxScroll > 0 ? Math.min(Math.max(scrollLeft / maxScroll, 0), 1) : 0;
    } else {
      showIndicator.value = false;
    }
  });
};

const onMenuScroll = () => {
  updateScrollInfo();
};

const thumbStyle = computed(() => {
  const trackWidth = 80;
  const thumbWidth = 24;
  const maxTravel = trackWidth - thumbWidth;
  const translateX = scrollProgress.value * maxTravel;
  return {
    transform: `translateX(${translateX}px)`
  };
});

watch(() => route.path, () => {
  updateScrollInfo();
});

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  // Give a small delay to ensure rendering and measurements are complete
  setTimeout(updateScrollInfo, 100);
  window.addEventListener('resize', updateScrollInfo);
  
  const el = menuRef.value?.$el;
  if (el && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateScrollInfo();
    });
    resizeObserver.observe(el);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollInfo);
  if (resizeObserver) {
    resizeObserver.disconnect();
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
          ref="menuRef"
          v-model:selectedKeys="selectedKeys"
          class="subject-menu"
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
          @scroll="onMenuScroll"
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
          <a-menu-item key="note">
            <template #icon><FileTextOutlined /></template>
            笔记模板
          </a-menu-item>
          <a-menu-item key="drawing">
            <template #icon><PictureOutlined /></template>
            儿童简笔画
          </a-menu-item>
          <a-menu-item key="feedback" class="feedback-menu-item">
            <template #icon><MessageOutlined /></template>
            提个意见
          </a-menu-item>
        </a-menu>
        <div v-if="showIndicator" class="scroll-indicator-wrapper">
          <div class="scroll-indicator-track">
            <div class="scroll-indicator-thumb" :style="thumbStyle"></div>
          </div>
        </div>
      </a-layout-sider>
      <a-layout class="main-layout" :class="{ 'scrollable-layout': isScrollableLayout }">
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
    padding: 8px 8px 1px;
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
    overflow: visible !important;
  }
  .generator-layout :deep(.ant-layout),
  .generator-layout :deep(.ant-layout-content) {
    display: block !important;
    flex: none !important;
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
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

.scrollable-layout {
  overflow-y: auto !important;
}

.scroll-indicator-wrapper {
  display: none;
}

@media (max-width: 768px) {
  .scroll-indicator-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 2px;
    margin-top: -3px;
    background: transparent;
    width: 100%;
  }

  .scroll-indicator-track {
    width: 80px;
    height: 3px;
    background: rgba(47, 125, 70, 0.12);
    border-radius: 1.5px;
    position: relative;
    overflow: hidden;
  }

  .scroll-indicator-thumb {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 24px;
    background: #2f7d46;
    border-radius: 1.5px;
    transition: transform 0.05s linear;
  }
}
</style>
