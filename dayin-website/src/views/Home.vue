<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileDoneOutlined,
  PrinterOutlined,
  ReadOutlined,
  RightOutlined
} from '@ant-design/icons-vue';
import heroImage from '../assets/home-study-desk.png';

const router = useRouter();

const categories = [
  {
    title: '数学练习题',
    description: '口算、单位换算、人民币兑换和分解思路练习。',
    path: '/generator/math',
    icon: CalculatorOutlined,
    tone: 'green'
  },
  {
    title: '语文作业纸',
    description: '田字格、拼音格、作文纸和笔顺练习。',
    path: '/generator/chinese',
    icon: ReadOutlined,
    tone: 'red'
  },
  {
    title: '英语作业纸',
    description: '四线三格与基础英文书写纸。',
    path: '/generator/english',
    icon: EditOutlined,
    tone: 'blue'
  }
];

const strengths = [
  'A4 打印排版',
  '可直接下载 PDF',
  '适合日常巩固',
  '题量和格式可调'
];

const steps = [
  { title: '选择练习', text: '按学科进入生成器。', icon: FileDoneOutlined },
  { title: '调整格式', text: '设置题型、题量、答案显示。', icon: ClockCircleOutlined },
  { title: '打印使用', text: '下载 PDF 或直接打印。', icon: PrinterOutlined }
];
</script>

<template>
  <main class="home-page">
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImage})` }">
      <div class="hero-shade"></div>
      <header class="home-nav">
        <button class="brand" type="button" @click="router.push('/')">
          <span class="brand-mark">日</span>
          <span>向日葵打印</span>
        </button>
        <nav class="nav-links" aria-label="主要导航">
          <a-button type="text" @click="router.push('/generator/math')">数学</a-button>
          <a-button type="text" @click="router.push('/generator/chinese')">语文</a-button>
          <a-button type="text" @click="router.push('/generator/english')">英语</a-button>
        </nav>
      </header>

      <div class="hero-content">
        <p class="eyebrow">Printable practice sheets</p>
        <h1>向日葵打印</h1>
        <p class="hero-copy">
          给每天的练习留一张安静、清楚、好打印的纸。快速生成小学阶段常用的数学、语文、英语练习模板。
        </p>
        <div class="hero-actions">
          <a-button type="primary" size="large" @click="router.push('/generator/math')">
            开始生成
            <template #icon><RightOutlined /></template>
          </a-button>
          <a-button size="large" ghost @click="router.push('/generator/chinese')">看看作业纸</a-button>
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
        <p>常用入口</p>
        <h2>把练习纸准备好，剩下的交给孩子慢慢写</h2>
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

    <footer class="home-footer">© 2026 向日葵学习平台. 保留所有权利.</footer>
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f6c84c;
  color: #2c3b2b;
  box-shadow: 0 8px 18px rgba(140, 108, 31, 0.18);
}

.nav-links {
  display: flex;
  gap: 4px;
}

.hero-content {
  width: min(620px, calc(100% - 48px));
  margin: auto 0;
  padding: 24px clamp(24px, 5vw, 72px) 10vh;
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
  margin-top: 32px;
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
}

.category-card:hover {
  border-color: rgba(47, 125, 70, 0.34);
  transform: translateY(-2px);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.tone-green .category-icon {
  color: #2f7d46;
  background: #e8f3ea;
}

.tone-red .category-icon {
  color: #ad5546;
  background: #f8ece7;
}

.tone-blue .category-icon {
  color: #406d91;
  background: #e8f0f6;
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

@media (max-width: 860px) {
  .home-nav {
    padding: 0 20px;
  }

  .nav-links {
    display: none;
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
