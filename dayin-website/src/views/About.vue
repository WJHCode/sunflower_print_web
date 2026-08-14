<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeftOutlined,
  ArrowUpOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons-vue';
import BrandMark from '@/components/BrandMark.vue';
import LanguageSwitch from '@/components/LanguageSwitch.vue';
import { useI18n } from '@/i18n';

const router = useRouter();
const { t } = useI18n();

const projects = computed(() => [
  { key: 'iphotos', href: 'https://iphotos.uucc.me/', icon: SafetyCertificateOutlined },
  { key: 'filelab', href: 'https://filelab.uucc.me', icon: FolderOpenOutlined },
]);
</script>

<template>
  <main class="about-page">
    <header class="about-nav">
      <button class="brand" type="button" @click="router.push('/')">
        <span class="brand-mark"><BrandMark /></span>
        <span>{{ t('common.brand') }}</span>
      </button>
      <div class="nav-actions">
        <a-button class="back-home-btn" type="text" @click="router.push('/')">
          <template #icon><ArrowLeftOutlined /></template>
          <span class="back-home-label">{{ t('about.backHome') }}</span>
        </a-button>
        <LanguageSwitch />
      </div>
    </header>

    <section class="about-hero">
      <p class="eyebrow">{{ t('about.eyebrow') }}</p>
      <h1>{{ t('about.title') }}</h1>
      <p>{{ t('about.copy') }}</p>
    </section>

    <section class="projects-section" :aria-label="t('about.projectsTitle')">
      <div class="section-heading">
        <p>{{ t('about.projectsLabel') }}</p>
        <h2>{{ t('about.projectsTitle') }}</h2>
      </div>

      <div class="projects-grid">
        <article v-for="project in projects" :key="project.key" class="project-card" :class="`project-${project.key}`">
          <div class="project-preview" :aria-label="t(`about.${project.key}.previewLabel`)">
            <template v-if="project.key === 'iphotos'">
              <div class="preview-topbar">
                <span class="preview-brand"><SafetyCertificateOutlined /> {{ t(`about.${project.key}.name`) }}</span>
                <span class="preview-dot"></span>
              </div>
              <div class="id-photo-sheet">
                <div class="id-photo-avatar"><FileImageOutlined /></div>
                <div class="id-photo-copy">
                  <strong>{{ t(`about.${project.key}.previewLabel`) }}</strong>
                  <span>AI · 1 inch · 2 inch</span>
                </div>
              </div>
              <div class="preview-chip-row"><span></span><span></span><span></span></div>
            </template>
            <template v-else>
              <div class="preview-topbar">
                <span class="preview-brand"><FolderOpenOutlined /> FileLab</span>
                <span class="preview-dot"></span>
              </div>
              <div class="file-tool-grid">
                <div class="file-tool file-pdf">PDF</div>
                <div class="file-tool file-image">IMG</div>
                <div class="file-tool file-zip">ZIP</div>
              </div>
              <div class="local-first-note"><LockOutlined /> {{ t(`about.${project.key}.previewLabel`) }}</div>
            </template>
          </div>

          <div class="project-body">
            <div class="project-icon"><component :is="project.icon" /></div>
            <p class="project-category">{{ t(`about.${project.key}.category`) }}</p>
            <h3>{{ t(`about.${project.key}.name`) }}</h3>
            <p class="project-description">{{ t(`about.${project.key}.description`) }}</p>
            <a :href="project.href" target="_blank" rel="noopener noreferrer" class="project-link">
              {{ t('about.visit') }}
              <ArrowUpOutlined class="external-icon" />
            </a>
          </div>
        </article>
      </div>
    </section>

    <footer class="about-footer">
      <span>{{ t('home.footer') }}</span>
      <div class="footer-records">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">{{ t('home.icp') }}</a>
        <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11011302008267" target="_blank" rel="noopener noreferrer">{{ t('home.policeRecord') }}</a>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.about-page { height: 100vh; overflow-x: hidden; overflow-y: auto; background: #f7f5ef; color: #253027; }
.about-nav { height: 72px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(24px, 5vw, 72px); }
.brand { border: 0; background: transparent; display: inline-flex; align-items: center; gap: 10px; padding: 0; color: #233126; font-size: 18px; font-weight: 700; cursor: pointer; }
.brand-mark { width: 34px; height: 34px; overflow: hidden; border-radius: 8px; background: #fff7d8; box-shadow: 0 8px 18px rgba(140, 108, 31, .18), inset 0 0 0 1px rgba(140, 108, 31, .1); }
.nav-actions { display: flex; align-items: center; gap: 10px; }
.back-home-btn { color: #35523c !important; font-weight: 700; }
.back-home-btn:hover { color: #2f7d46 !important; background: rgba(47, 125, 70, .08) !important; }
.about-hero { width: min(1120px, calc(100% - 48px)); margin: clamp(28px, 7vw, 92px) auto 0; padding: clamp(32px, 6vw, 72px); overflow: hidden; border: 1px solid rgba(47, 125, 70, .12); border-radius: 28px; background: radial-gradient(circle at 92% 0%, rgba(251, 191, 36, .24), transparent 31%), linear-gradient(135deg, #fffdf6, #eef7ea); box-shadow: 0 20px 45px rgba(60, 54, 38, .07); }
.eyebrow, .section-heading > p { margin: 0 0 12px; color: #47704d; font-size: 13px; font-weight: 800; letter-spacing: .11em; }
.about-hero h1 { max-width: 760px; margin: 0; color: #1d2b20; font-size: clamp(36px, 5.4vw, 68px); line-height: 1.14; letter-spacing: -.04em; }
.about-hero > p:last-child { max-width: 660px; margin: 24px 0 0; color: #58645b; font-size: 18px; line-height: 1.85; }
.projects-section { width: min(1120px, calc(100% - 48px)); margin: clamp(54px, 8vw, 96px) auto; }
.section-heading h2 { margin: 0; color: #253027; font-size: clamp(28px, 4vw, 42px); line-height: 1.25; }
.projects-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-top: 30px; }
.project-card { overflow: hidden; border: 1px solid rgba(58, 74, 62, .12); border-radius: 20px; background: #fffdf8; box-shadow: 0 12px 30px rgba(60, 54, 38, .08); transition: transform .18s ease, box-shadow .18s ease; }
.project-card:hover { transform: translateY(-4px); box-shadow: 0 20px 42px rgba(60, 54, 38, .13); }
.project-preview { min-height: 240px; padding: 20px; color: #fff; }
.project-iphotos .project-preview { background: linear-gradient(145deg, #5f58c8, #8174df 51%, #a879db); }
.project-filelab .project-preview { background: linear-gradient(145deg, #2d725d, #529a7c 55%, #8ab89d); }
.preview-topbar { display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 800; }
.preview-brand { display: inline-flex; align-items: center; gap: 7px; }
.preview-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, .85); box-shadow: 16px 0 rgba(255, 255, 255, .45); }
.id-photo-sheet { display: flex; align-items: center; gap: 16px; max-width: 365px; margin: 32px auto 17px; padding: 20px; border: 1px solid rgba(255, 255, 255, .48); border-radius: 16px; background: rgba(255, 255, 255, .18); backdrop-filter: blur(8px); }
.id-photo-avatar { width: 68px; height: 84px; display: grid; place-items: center; border-radius: 11px; background: linear-gradient(155deg, #e9e7ff, #bfc6ff); color: #655dc2; font-size: 29px; }
.id-photo-copy { display: grid; gap: 8px; }.id-photo-copy strong { font-size: 17px; }.id-photo-copy span { opacity: .82; font-size: 12px; font-weight: 700; }
.preview-chip-row { display: flex; justify-content: center; gap: 9px; }.preview-chip-row span { width: 58px; height: 8px; border-radius: 100px; background: rgba(255, 255, 255, .38); }.preview-chip-row span:nth-child(2) { width: 86px; background: rgba(255, 255, 255, .75); }
.file-tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 365px; margin: 34px auto 20px; }.file-tool { min-height: 88px; display: grid; place-items: center; border: 1px solid rgba(255, 255, 255, .4); border-radius: 14px; background: rgba(255, 255, 255, .16); font-size: 18px; font-weight: 900; letter-spacing: .04em; }.file-pdf { color: #fee6e3; }.file-image { color: #edf8dc; }.file-zip { color: #e5f1ff; }.local-first-note { display: flex; justify-content: center; align-items: center; gap: 8px; color: rgba(255, 255, 255, .9); font-size: 13px; font-weight: 700; }
.project-body { position: relative; padding: 28px; }.project-icon { position: absolute; top: -27px; right: 28px; width: 54px; height: 54px; display: grid; place-items: center; border: 5px solid #fffdf8; border-radius: 16px; background: #e8f3e5; color: #2f7d46; font-size: 23px; }.project-category { margin: 0; color: #52745a; font-size: 13px; font-weight: 800; }.project-body h3 { margin: 8px 0 12px; color: #253027; font-size: 26px; }.project-description { min-height: 86px; margin: 0; color: #667068; line-height: 1.75; }.project-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; color: #2f7d46; font-weight: 800; }.project-link:hover { color: #1f5e33; }.external-icon { transform: rotate(45deg); }
.about-footer { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 22px 0 32px; border-top: 1px solid rgba(58, 74, 62, .12); color: #7a837c; font-size: 14px; text-align: center; }.about-footer > span { display: block; }.footer-records { display: flex; justify-content: center; gap: 16px; margin-top: 6px; white-space: nowrap; font-size: clamp(11px, 3vw, 14px); }.footer-records a { color: inherit; }.footer-records a:hover { color: #2f7d46; }
@media (max-width: 860px) { .about-nav { height: 64px; padding: 0 20px; }.back-home-btn { min-width: 34px; padding: 0 6px !important; }.back-home-label { display: none; }.about-hero, .projects-section, .about-footer { width: min(100% - 40px, 1120px); }.about-hero { margin-top: 22px; padding: 32px 24px; border-radius: 22px; }.about-hero > p:last-child { font-size: 16px; }.projects-section { margin: 58px auto 64px; }.projects-grid { grid-template-columns: 1fr; gap: 18px; }.project-preview { min-height: 218px; }.project-description { min-height: auto; }.footer-records { gap: 10px; } }
</style>
