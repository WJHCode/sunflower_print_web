<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  FileDoneOutlined,
  PrinterOutlined,
  ReadOutlined,
  RightOutlined,
  FileTextOutlined,
  PictureOutlined,
  HighlightOutlined
} from '@ant-design/icons-vue';
import BrandMark from '../components/BrandMark.vue';
import LanguageSwitch from '../components/LanguageSwitch.vue';
import MusicNoteIcon from '../components/MusicNoteIcon.vue';
import heroImage from '../assets/home-study-desk.png';
import { useI18n } from '@/i18n';

const router = useRouter();
const { t, tm } = useI18n();

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const deferredInstallPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isStandalone = ref(false);
const isMobileViewport = ref(false);

const canShowInstallButton = computed(() => isMobileViewport.value && !isStandalone.value);

const updateInstallDisplayState = () => {
  if (typeof window === 'undefined') return;

  isMobileViewport.value = window.matchMedia('(max-width: 860px)').matches;
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
};

const handleBeforeInstallPrompt = (event: Event) => {
  event.preventDefault();
  deferredInstallPrompt.value = event as BeforeInstallPromptEvent;
};

const handleAppInstalled = () => {
  deferredInstallPrompt.value = null;
  isStandalone.value = true;
};

const handleInstallClick = async () => {
  if (isStandalone.value) return;

  if (deferredInstallPrompt.value) {
    const installPrompt = deferredInstallPrompt.value;
    deferredInstallPrompt.value = null;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    updateInstallDisplayState();
    return;
  }

  const userAgent = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  const tip = isIos
    ? t('home.install.iosTip')
    : isAndroid
      ? t('home.install.androidTip')
      : t('home.install.browserTip');

  window.alert(tip);
};

const categoryMeta = [
  {
    key: 'math',
    path: '/generator/math',
    icon: CalculatorOutlined,
    tone: 'green'
  },
  {
    key: 'chinese',
    path: '/generator/chinese',
    icon: ReadOutlined,
    tone: 'red'
  },
  {
    key: 'pinyinReading',
    path: '/generator/pinyin-reading',
    icon: ReadOutlined,
    tone: 'orange'
  },
  {
    key: 'english',
    path: '/generator/english',
    icon: EditOutlined,
    tone: 'blue'
  },
  {
    key: 'note',
    path: '/generator/note',
    icon: FileTextOutlined,
    tone: 'yellow'
  },
  {
    key: 'drawing',
    path: '/generator/drawing',
    icon: PictureOutlined,
    tone: 'purple'
  },
  {
    key: 'sticker',
    path: '/generator/sticker',
    icon: HighlightOutlined,
    tone: 'pink'
  },
  {
    key: 'music',
    path: '/generator/music',
    icon: MusicNoteIcon,
    tone: 'orange'
  }
];

const categories = computed(() => categoryMeta.map((category) => ({
  ...category,
  title: t(`home.categories.${category.key}.title`),
  description: t(`home.categories.${category.key}.description`),
})));

const strengths = computed(() => tm<string[]>('home.strengths'));

const stepIcons = [FileDoneOutlined, ClockCircleOutlined, PrinterOutlined];
const steps = computed(() => tm<Array<{ title: string; text: string }>>('home.steps').map((step, index) => ({
  ...step,
  icon: stepIcons[index],
})));

onMounted(() => {
  updateInstallDisplayState();
  window.addEventListener('resize', updateInstallDisplayState);
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateInstallDisplayState);
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<template>
  <main class="home-page">
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="hero-shade"></div>
      <header class="home-nav">
        <button class="brand" type="button" @click="router.push('/')">
          <span class="brand-mark"><BrandMark /></span>
          <span>{{ t('common.brand') }}</span>
        </button>
        <div class="nav-actions">
          <nav class="nav-links" :aria-label="t('nav.main')">
            <a-button type="text" @click="router.push('/generator/math')">{{ t('nav.mathShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/chinese')">{{ t('nav.chineseShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/pinyin-reading')">{{ t('nav.pinyinShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/english')">{{ t('nav.englishShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/note')">{{ t('nav.noteShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/drawing')">{{ t('nav.drawingShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/sticker')">{{ t('nav.stickerShort') }}</a-button>
            <a-button type="text" @click="router.push('/generator/music')">{{ t('nav.musicShort') }}</a-button>
            <a-button type="text" class="suggest-nav-btn" @click="router.push('/generator/feedback')">{{ t('nav.feedbackShort') }}</a-button>
          </nav>
          <LanguageSwitch />
          <a-button
            v-if="canShowInstallButton"
            class="mobile-install-btn"
            type="primary"
            size="small"
            :aria-label="t('home.install.label')"
            @click="handleInstallClick"
          >
            <template #icon><DownloadOutlined /></template>
            {{ t('home.install.label') }}
          </a-button>
        </div>
      </header>

      <div class="hero-content">
        <p class="eyebrow">{{ t('home.eyebrow') }}</p>
        <h1>{{ t('common.brand') }}</h1>
        <p class="hero-copy">
          {{ t('home.copy') }}
        </p>
        <div class="user-social-proof">
          <div class="avatar-stack">
            <span class="avatar avatar-1"></span>
            <span class="avatar avatar-2"></span>
            <span class="avatar avatar-3"></span>
          </div>
          <div class="proof-text">
            <span>{{ t('home.proofServed') }} <strong class="accent-text">8,000+</strong> {{ t('home.proofUsers') }}</span>
            <span class="divider">|</span>
            <span class="star-rating">★★★★★</span>
            <span>{{ t('home.proofPraise') }}</span>
          </div>
        </div>
        <div class="hero-actions">
          <a-button type="primary" size="large" @click="router.push('/generator/math')">
            {{ t('home.start') }}
            <template #icon><RightOutlined /></template>
          </a-button>
          <a-button size="large" ghost @click="router.push('/generator/chinese')">{{ t('home.preview') }}</a-button>
        </div>
        <ul class="strength-list">
          <li v-for="item in strengths" :key="item">
            <CheckCircleOutlined />
            {{ item }}
          </li>
        </ul>
      </div>
    </section>

    <section class="category-section" aria-label="练习入口">
      <div class="section-heading">
        <p>{{ t('home.sectionLabel') }}</p>
        <h2>{{ t('home.sectionTitle') }}</h2>
      </div>
      <div class="category-grid">
        <button
          v-for="category in categories"
          :key="category.title"
          class="category-card"
          :class="`tone-${category.tone}`"
          type="button"
          @click="router.push(category.path)"
        >
          <span class="category-icon"><component :is="category.icon" /></span>
          <span class="category-body">
            <strong>{{ category.title }}</strong>
            <span>{{ category.description }}</span>
          </span>
          <RightOutlined class="category-arrow" />
        </button>
      </div>
    </section>

    <section class="workflow-section" aria-label="使用流程">
      <div v-for="step in steps" :key="step.title" class="workflow-item">
        <component :is="step.icon" class="workflow-icon" />
        <h3>{{ step.title }}</h3>
        <p>{{ step.text }}</p>
      </div>
    </section>

    <footer class="home-footer">{{ t('home.footer') }}</footer>
  </main>
</template>

<style scoped>
.home-page {
  height: 100vh;
  overflow-y: auto;
  background: #f7f5ef;
  color: #253027;
}

.hero-section {
  position: relative;
  min-height: 86vh;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

.hero-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(250, 247, 235, 0.95) 0%, rgba(250, 247, 235, 0.78) 39%, rgba(250, 247, 235, 0.08) 72%);
  z-index: -1;
}

.home-nav {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(24px, 5vw, 72px);
}

.brand {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  color: #233126;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: block;
  overflow: hidden;
  background: #fff7d8;
  box-shadow: 0 8px 18px rgba(140, 108, 31, 0.18), inset 0 0 0 1px rgba(140, 108, 31, 0.1);
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-content {
  width: min(620px, calc(100% - 48px));
  margin: auto 0;
  padding: 24px clamp(24px, 5vw, 72px) 10vh;
}

.user-social-proof {
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 253, 247, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(47, 125, 70, 0.12);
  padding: 6px 16px 6px 8px;
  border-radius: 100px;
  box-shadow: 0 6px 20px rgba(60, 54, 38, 0.05);
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #fffdf7;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.avatar:not(:first-child) {
  margin-left: -8px;
}

.avatar-1 {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.avatar-2 {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.avatar-3 {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.proof-text {
  font-size: 13px;
  color: #3d4a3f;
  font-weight: 500;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.proof-text .accent-text {
  color: #2f7d46;
  font-weight: 700;
}

.proof-text .divider {
  color: rgba(58, 74, 62, 0.2);
  margin: 0 4px;
}

.star-rating {
  color: #ffb800;
  margin-right: 4px;
  font-weight: bold;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #47704d;
  text-transform: uppercase;
}

.hero-content h1 {
  margin: 0;
  font-size: clamp(48px, 8vw, 92px);
  line-height: 1;
  letter-spacing: 0;
  color: #1d2b20;
}

.hero-copy {
  max-width: 560px;
  margin: 24px 0 0;
  font-size: 20px;
  line-height: 1.8;
  color: #4a554b;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 18px;
}

.hero-actions :deep(.ant-btn-primary) {
  background: #2f7d46;
  border-color: #2f7d46;
}

.hero-actions :deep(.ant-btn-background-ghost) {
  color: #27382a;
  border-color: rgba(39, 56, 42, 0.45);
}

.strength-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  padding: 0;
  margin: 30px 0 0;
  list-style: none;
  color: #334235;
}

.strength-list li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
}

.strength-list :deep(.anticon) {
  color: #2f7d46;
}

.category-section,
.workflow-section {
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
}

.category-section {
  padding: 56px 0 28px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.section-heading p {
  margin: 0 0 8px;
  color: #68816b;
  font-weight: 700;
}

.section-heading h2 {
  max-width: 640px;
  margin: 0;
  font-size: 30px;
  line-height: 1.35;
  letter-spacing: 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.category-card {
  border: 1px solid rgba(58, 74, 62, 0.12);
  background: #fffdf7;
  border-radius: 8px;
  min-height: 132px;
  padding: 22px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(60, 54, 38, 0.08);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.category-card:hover {
  border-color: rgba(47, 125, 70, 0.34);
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(60, 54, 38, 0.11);
}

.category-icon {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72), 0 8px 18px rgba(60, 54, 38, 0.06);
}

.category-icon :deep(svg) {
  stroke-width: 1.7;
}

.tone-green .category-icon {
  color: #2f7d46;
  background: linear-gradient(145deg, #eff8ea, #dcefe2);
}

.tone-red .category-icon {
  color: #ad5546;
  background: linear-gradient(145deg, #fff2ea, #f4dfd9);
}

.tone-blue .category-icon {
  color: #406d91;
  background: linear-gradient(145deg, #eef7fb, #dceaf3);
}

.tone-yellow .category-icon {
  color: #8c6c1f;
  background: linear-gradient(145deg, #fff9df, #f3e9bf);
}

.tone-purple .category-icon {
  color: #6f4ca3;
  background: linear-gradient(145deg, #f4effb, #e8ddf5);
}

.tone-pink .category-icon {
  color: #c2255c;
  background: linear-gradient(145deg, #fff0f5, #f7dce8);
}

.category-body {
  display: grid;
  gap: 8px;
}

.category-body strong {
  font-size: 19px;
}

.category-body span {
  color: #667068;
  line-height: 1.6;
}

.category-arrow {
  color: #8c968e;
}

.workflow-section {
  padding: 28px 0 48px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.workflow-item {
  padding: 22px 0;
  border-top: 1px solid rgba(58, 74, 62, 0.14);
}

.workflow-icon {
  font-size: 22px;
  color: #2f7d46;
}

.workflow-item h3 {
  margin: 14px 0 8px;
  font-size: 18px;
}

.workflow-item p {
  margin: 0;
  color: #667068;
}

.home-footer {
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
  padding: 22px 0 32px;
  border-top: 1px solid rgba(58, 74, 62, 0.12);
  color: #7a837c;
  font-size: 14px;
  text-align: center;
}

.nav-links :deep(.ant-btn) {
  font-weight: 700 !important;
}

.suggest-nav-btn {
  color: #000000 !important;
}
.suggest-nav-btn:hover {
  color: #222222 !important;
  background-color: rgba(0, 0, 0, 0.05) !important;
}

.mobile-install-btn {
  display: none;
}

@media (max-width: 860px) {
  .home-nav {
    height: 64px;
    padding: 0 20px;
  }

  .nav-links {
    display: none;
  }

  .nav-actions {
    gap: 10px;
  }

  .mobile-install-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 34px;
    padding: 0 12px;
    border-radius: 8px;
    background: #2f7d46;
    border-color: #2f7d46;
    box-shadow: 0 8px 18px rgba(47, 125, 70, 0.18);
    font-weight: 700;
  }

  .mobile-install-btn:hover,
  .mobile-install-btn:focus {
    background: #235d34 !important;
    border-color: #235d34 !important;
  }

  .hero-section {
    min-height: 82vh;
    background-position: 62% center;
  }

  .hero-shade {
    background: rgba(250, 247, 235, 0.82);
  }

  .hero-content {
    width: auto;
    padding: 24px 20px 64px;
  }

  .hero-copy {
    font-size: 17px;
  }

  .section-heading {
    display: block;
  }

  .category-grid,
  .workflow-section {
    grid-template-columns: 1fr;
  }
}
</style>
