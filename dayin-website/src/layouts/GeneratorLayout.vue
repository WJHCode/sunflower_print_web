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
  MessageOutlined,
  HighlightOutlined
} from '@ant-design/icons-vue';
import BrandMark from '../components/BrandMark.vue';
import LanguageSwitch from '../components/LanguageSwitch.vue';
import MusicNoteIcon from '../components/MusicNoteIcon.vue';
import { useI18n } from '@/i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const isScrollableLayout = computed(() => route.path.includes('/feedback'));

const selectedKeys = computed({
  get: () => {
    if (route.path.includes('/chinese')) return ['chinese'];
    if (route.path.includes('/pinyin-reading')) return ['pinyin-reading'];
    if (route.path.includes('/english')) return ['english'];
    if (route.path.includes('/note')) return ['note'];
    if (route.path.includes('/drawing')) return ['drawing'];
    if (route.path.includes('/sticker')) return ['sticker'];
    if (route.path.includes('/music')) return ['music'];
    if (route.path.includes('/feedback')) return ['feedback'];
    return ['math'];
  },
  set: (keys: string[]) => {
    const key = keys[0];
    if (key === 'math') router.push('/generator/math');
    if (key === 'chinese') router.push('/generator/chinese');
    if (key === 'pinyin-reading') router.push('/generator/pinyin-reading');
    if (key === 'english') router.push('/generator/english');
    if (key === 'note') router.push('/generator/note');
    if (key === 'drawing') router.push('/generator/drawing');
    if (key === 'sticker') router.push('/generator/sticker');
    if (key === 'music') router.push('/generator/music');
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

const onMenuScroll = (e: Event) => {
  const el = e.target as HTMLElement;
  if (el) {
    sessionStorage.setItem('subjectMenuScrollLeft', String(el.scrollLeft));
  }
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

const restoreScrollPosition = () => {
  nextTick(() => {
    const el = menuRef.value?.$el;
    if (el) {
      const savedScrollLeft = sessionStorage.getItem('subjectMenuScrollLeft');
      if (savedScrollLeft) {
        el.scrollLeft = Number(savedScrollLeft);
      }
    }
    updateScrollInfo();
  });
};

onMounted(() => {
  restoreScrollPosition();
  window.addEventListener('pageshow', restoreScrollPosition);

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
  window.removeEventListener('pageshow', restoreScrollPosition);
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
        <span class="logo-mark"><BrandMark /></span>
        <span>{{ t('common.brand') }}</span>
      </button>
      <div class="actions">
        <LanguageSwitch />
        <a-button class="home-button" shape="round" @click="router.push('/')">
          <template #icon><HomeOutlined /></template>
          {{ t('common.home') }}
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
            {{ t('nav.math') }}
          </a-menu-item>
          <a-menu-item key="chinese">
            <template #icon><ReadOutlined /></template>
            {{ t('nav.chinese') }}
          </a-menu-item>
          <a-menu-item key="pinyin-reading">
            <template #icon><ReadOutlined /></template>
            {{ t('nav.pinyinReading') }}
          </a-menu-item>
          <a-menu-item key="english">
            <template #icon><FormatPainterOutlined /></template>
            {{ t('nav.english') }}
          </a-menu-item>
          <a-menu-item key="note">
            <template #icon><FileTextOutlined /></template>
            {{ t('nav.note') }}
          </a-menu-item>
          <a-menu-item key="drawing">
            <template #icon><PictureOutlined /></template>
            {{ t('nav.drawing') }}
          </a-menu-item>
          <a-menu-item key="sticker">
            <template #icon><HighlightOutlined /></template>
            {{ t('nav.sticker') }}
          </a-menu-item>
          <a-menu-item key="music">
            <template #icon><MusicNoteIcon /></template>
            {{ t('nav.music') }}
          </a-menu-item>
          <a-menu-item key="feedback" class="feedback-menu-item">
            <template #icon><MessageOutlined /></template>
            {{ t('nav.feedback') }}
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
  display: block;
  overflow: hidden;
  background: #fff7d8;
  box-shadow: 0 8px 18px rgba(140, 108, 31, 0.16), inset 0 0 0 1px rgba(140, 108, 31, 0.1);
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
  transition: background 0.18s ease, color 0.18s ease;
}
.subject-menu :deep(.ant-menu-item .ant-menu-item-icon) {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 125, 70, 0.08);
  color: #4e7156;
  font-size: 15px;
  transition: background 0.18s ease, color 0.18s ease;
}
.subject-menu :deep(.ant-menu-item-selected) {
  background: #e8f3ea;
  color: #2f7d46;
  font-weight: 700;
}
.subject-menu :deep(.ant-menu-item-selected .ant-menu-item-icon) {
  background: #2f7d46;
  color: #fffdf7;
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
    gap: 10px;
  }

  .logo {
    min-width: 0;
    font-size: 16px;
    flex: 1 1 auto;
    overflow: hidden;
  }

  .logo > span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logo-mark {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
  }

  .home-button {
    height: 32px;
    width: 34px;
    padding-inline: 0;
    font-size: 13px;
  }

  .home-button :deep(span:not(.anticon)) {
    display: none;
  }

  .actions {
    flex: 0 0 auto;
    gap: 8px;
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
    overflow-y: auto !important;
  }

  .content {
    width: 100% !important;
    min-width: 0;
    min-height: 0;
    height: auto !important;
    overflow: visible !important;
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

@media (max-width: 768px) {
  .scrollable-layout .content {
    height: auto !important;
    overflow: visible !important;
  }
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
