<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DownloadOutlined, PrinterOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '@/utils/print';
import { useExportLoading } from '@/composables/useExportLoading';
import { useI18n } from '@/i18n';
import { PAPER_FOOTER_ZH } from '@/constants/site';

type Stage = 'primary' | 'middle' | 'high' | 'university';

type CourseCell = { course: string; detail: string };
type Period = { label: string; time: string; kind?: 'break' | 'lunch' };
type Theme = 'school' | 'sage-green' | 'nordic-blue' | 'warm-sand' | 'peach-cream' | 'classic-white';

const { t, language } = useI18n();
const { isPdfLoading, isImageLoading, runExport } = useExportLoading();

const formState = ref({
  stage: 'primary' as Stage,
  theme: 'school' as Theme,
  title: '我的一周课程表',
  owner: '姓名：',
  group: '班级：',
  term: '2026 秋季学期',
  showWeekend: false,
  showNotes: true,
});

const stageDefaults: Record<Stage, {
  zhTitle: string;
  enTitle: string;
  periods: Period[];
  courses: string[][];
  note: string;
}> = {
  primary: {
    zhTitle: '我的一周课程表', enTitle: 'MY WEEKLY TIMETABLE', note: '本周小目标：认真听讲，快乐学习！',
    periods: [
      { label: '第 1 节', time: '08:20–09:00' }, { label: '第 2 节', time: '09:10–09:50' },
      { label: '课间休息', time: '09:50–10:10', kind: 'break' }, { label: '第 3 节', time: '10:10–10:50' },
      { label: '第 4 节', time: '11:00–11:40' }, { label: '午餐 · 午休', time: '11:40–14:00', kind: 'lunch' },
      { label: '第 5 节', time: '14:00–14:40' }, { label: '第 6 节', time: '14:50–15:30' },
      { label: '课后活动', time: '15:40–16:20', kind: 'break' },
    ],
    courses: [
      ['语文', '数学', '', '英语', '音乐'], ['数学', '语文', '', '科学', '体育'],
      ['', '', '', '', ''], ['英语', '美术', '', '语文', '数学'], ['体育', '科学', '', '数学', '班会'],
      ['', '', '', '', ''], ['语文', '数学', '', '英语', '劳动'], ['阅读', '体育', '', '社团', '整理'],
      ['阳光课间', '阅读时光', '', '兴趣小组', '值日'],
    ],
  },
  middle: {
    zhTitle: '初中生课程表', enTitle: 'MIDDLE SCHOOL SCHEDULE', note: '学习提醒：当天作业当天完成，错题及时整理。',
    periods: [
      { label: '早读', time: '07:30–08:00' }, { label: '第 1 节', time: '08:10–08:55' },
      { label: '第 2 节', time: '09:05–09:50' }, { label: '大课间', time: '09:50–10:20', kind: 'break' },
      { label: '第 3 节', time: '10:20–11:05' }, { label: '第 4 节', time: '11:15–12:00' },
      { label: '午餐 · 午休', time: '12:00–14:00', kind: 'lunch' }, { label: '第 5 节', time: '14:00–14:45' },
      { label: '第 6 节', time: '14:55–15:40' }, { label: '第 7 节', time: '15:50–16:35' },
      { label: '延时服务', time: '16:45–17:30', kind: 'break' },
    ],
    courses: [
      ['语文', '英语', '数学', '物理', '语文'], ['数学', '语文', '英语', '数学', '化学'],
      ['英语', '数学', '语文', '英语', '数学'], ['', '', '', '', ''],
      ['物理', '历史', '化学', '语文', '道法'], ['体育', '地理', '生物', '音乐', '班会'],
      ['', '', '', '', ''], ['化学', '英语', '物理', '数学', '体育'], ['语文', '数学', '历史', '地理', '生物'],
      ['阅读', '社团', '实验', '自习', '整理'], ['作业辅导', '社团活动', '学科答疑', '自主复习', '班级活动'],
    ],
  },
  high: {
    zhTitle: '高中周课程表', enTitle: 'HIGH SCHOOL WEEKLY PLAN', note: '目标：规划节奏，专注当下，稳步向前。',
    periods: [
      { label: '早读', time: '07:20–07:50' }, { label: '第 1 节', time: '08:00–08:45' },
      { label: '第 2 节', time: '08:55–09:40' }, { label: '课间操', time: '09:40–10:10', kind: 'break' },
      { label: '第 3 节', time: '10:10–10:55' }, { label: '第 4 节', time: '11:05–11:50' },
      { label: '午餐 · 午休', time: '11:50–14:00', kind: 'lunch' }, { label: '第 5 节', time: '14:00–14:45' },
      { label: '第 6 节', time: '14:55–15:40' }, { label: '第 7 节', time: '15:50–16:35' },
      { label: '晚自习', time: '18:30–21:00', kind: 'break' },
    ],
    courses: [
      ['语文', '英语', '数学', '语文', '英语'], ['数学', '物理', '化学', '数学', '物理'],
      ['英语', '数学', '生物', '历史', '化学'], ['', '', '', '', ''],
      ['物理', '语文', '数学', '地理', '政治'], ['化学', '生物', '英语', '体育', '班会'],
      ['', '', '', '', ''], ['数学', '物理', '语文', '英语', '化学'], ['历史', '地理', '政治', '生物', '语文'],
      ['选修', '体育', '研究性学习', '阅读', '班会'], ['学科自习', '数学限时练', '英语听力', '错题整理', '周测复盘'],
    ],
  },
  university: {
    zhTitle: '大学课程表', enTitle: 'UNIVERSITY COURSE SCHEDULE', note: '本周重点：预习、上课、复盘；给自己留出呼吸的空白。',
    periods: [
      { label: '第 1–2 节', time: '08:00–09:35' }, { label: '第 3–4 节', time: '10:00–11:35' },
      { label: '午间', time: '11:35–14:00', kind: 'lunch' }, { label: '第 5–6 节', time: '14:00–15:35' },
      { label: '第 7–8 节', time: '16:00–17:35' }, { label: '第 9–10 节', time: '19:00–20:35' },
    ],
    courses: [
      ['高等数学', '大学英语', '', '数据结构', ''], ['大学物理', '', '线性代数', '', '数据库原理'],
      ['', '', '', '', ''], ['程序设计', '体育', '', '操作系统', '大学英语'], ['', '离散数学', '实验课', '', '创新创业'],
      ['社团活动', '', '自习', '选修课', '项目讨论'],
    ],
  },
};

const weekDays = computed(() => {
  const zh = formState.value.showWeekend
    ? ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
    : ['星期一', '星期二', '星期三', '星期四', '星期五'];
  const en = formState.value.showWeekend
    ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    : ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  return language.value === 'en' ? en : zh;
});

const courseRows = ref<CourseCell[][]>([]);
const periodRows = ref<Period[]>([]);
const stageClass = computed(() => `stage-${formState.value.stage}`);
const themeClass = computed(() => `theme-${formState.value.theme}`);
const paperTitle = computed(() => `${formState.value.title || t('nav.timetable')}`);
const stageHint = computed(() => t(`timetable.stageHints.${formState.value.stage}`));

const createCourseRows = (stage: Stage) => {
  const { periods, courses } = stageDefaults[stage];
  periodRows.value = periods.map((period) => ({ ...period }));
  courseRows.value = periods.map((_, rowIndex) => Array.from({ length: 7 }, (_, dayIndex) => ({
    course: courses[rowIndex]?.[dayIndex] ?? '',
    detail: '',
  })));
};

const applyStage = () => {
  const defaults = stageDefaults[formState.value.stage];
  formState.value.title = language.value === 'en' ? defaults.enTitle : defaults.zhTitle;
  createCourseRows(formState.value.stage);
};

watch(() => formState.value.stage, applyStage);
watch(language, () => {
  const defaults = stageDefaults[formState.value.stage];
  if ([defaults.zhTitle, defaults.enTitle].includes(formState.value.title)) {
    formState.value.title = language.value === 'en' ? defaults.enTitle : defaults.zhTitle;
  }
});

applyStage();

const printPaper = () => printElement('printable-paper', paperTitle.value);
const downloadPDF = async () => {
  const element = document.getElementById('printable-paper');
  if (element) await runExport('pdf', () => savePdfFromElement(element, `${paperTitle.value}.pdf`));
};
const downloadImage = async () => {
  const element = document.getElementById('printable-paper');
  if (element) await runExport('image', () => saveImageFromElement(element, `${paperTitle.value}.png`));
};
</script>

<template>
  <div class="timetable-generator">
    <a-card class="settings-panel no-print" :bordered="false" :title="t('timetable.settingsTitle')">
      <a-form layout="vertical" :model="formState">
        <a-form-item :label="t('timetable.stage')">
          <a-select v-model:value="formState.stage">
            <a-select-option value="primary">{{ t('timetable.stages.primary') }}</a-select-option>
            <a-select-option value="middle">{{ t('timetable.stages.middle') }}</a-select-option>
            <a-select-option value="high">{{ t('timetable.stages.high') }}</a-select-option>
            <a-select-option value="university">{{ t('timetable.stages.university') }}</a-select-option>
          </a-select>
        </a-form-item>
        <p class="stage-hint">{{ stageHint }}</p>
        <a-form-item :label="t('generatorSettings.theme')">
          <a-select v-model:value="formState.theme">
            <a-select-option value="school">{{ t('timetable.themes.school') }}</a-select-option>
            <a-select-option value="sage-green">{{ t('options.sageGreen') }}</a-select-option>
            <a-select-option value="nordic-blue">{{ t('options.nordicBlue') }}</a-select-option>
            <a-select-option value="warm-sand">{{ t('options.warmSand') }}</a-select-option>
            <a-select-option value="peach-cream">{{ t('options.peachCream') }}</a-select-option>
            <a-select-option value="classic-white">{{ t('options.classicWhite') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('common.mainTitle')"><a-input v-model:value="formState.title" /></a-form-item>
        <a-form-item :label="t('timetable.owner')"><a-input v-model:value="formState.owner" /></a-form-item>
        <a-form-item :label="t('timetable.group')"><a-input v-model:value="formState.group" /></a-form-item>
        <a-form-item :label="t('timetable.term')"><a-input v-model:value="formState.term" /></a-form-item>
        <a-form-item :label="t('timetable.showWeekend')"><a-switch v-model:checked="formState.showWeekend" /></a-form-item>
        <a-form-item :label="t('timetable.showNotes')"><a-switch v-model:checked="formState.showNotes" /></a-form-item>
        <a-button block @click="applyStage"><template #icon><ReloadOutlined /></template>{{ t('timetable.reset') }}</a-button>
        <a-divider />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="printPaper"><template #icon><PrinterOutlined /></template>{{ t('common.print') }}</a-button>
          <div class="export-buttons">
            <a-button block size="large" :loading="isPdfLoading" :disabled="isImageLoading" @click="downloadPDF"><template #icon><DownloadOutlined /></template>{{ isPdfLoading ? t('common.processing') : t('common.downloadPdf') }}</a-button>
            <a-button block size="large" :loading="isImageLoading" :disabled="isPdfLoading" @click="downloadImage"><template #icon><DownloadOutlined /></template>{{ isImageLoading ? t('common.processing') : t('common.downloadImage') }}</a-button>
          </div>
        </div>
      </a-form>
    </a-card>

    <div class="preview-panel print-full-width">
      <article id="printable-paper" class="timetable-paper" :class="[stageClass, themeClass]">
        <div class="paper-topline"></div>
        <header class="timetable-header">
          <div class="header-kicker">{{ t(`timetable.kickers.${formState.stage}`) }}</div>
          <h1>{{ formState.title }}</h1>
          <div class="header-meta"><span>{{ formState.owner }}</span><span>{{ formState.group }}</span><span>{{ formState.term }}</span></div>
        </header>
        <section class="schedule-shell">
          <table class="schedule-table">
            <thead><tr><th class="period-heading">{{ t('timetable.period') }}</th><th v-for="day in weekDays" :key="day">{{ day }}</th></tr></thead>
            <tbody>
              <tr v-for="(period, rowIndex) in periodRows" :key="rowIndex" :class="{ 'break-row': period.kind }">
                <th scope="row">
                  <input v-model="period.label" class="period-input period-label" :aria-label="t('timetable.periodLabel')" :placeholder="t('timetable.periodLabel')" />
                  <input v-model="period.time" class="period-input period-time" :aria-label="t('timetable.periodTime')" :placeholder="t('timetable.periodTime')" />
                </th>
                <td v-for="(_, dayIndex) in weekDays" :key="dayIndex">
                  <template v-if="period.kind"><span class="break-label">{{ period.label }}</span></template>
                  <template v-else>
                    <input v-model="courseRows[rowIndex][dayIndex].course" class="course-input" :aria-label="`${period.label} ${weekDays[dayIndex]}`" :placeholder="t('timetable.coursePlaceholder')" />
                    <input v-model="courseRows[rowIndex][dayIndex].detail" class="course-detail" :aria-label="t('timetable.detail')" :placeholder="t('timetable.detailPlaceholder')" />
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer v-if="formState.showNotes" class="timetable-notes"><strong>{{ t('timetable.note') }}</strong><span>{{ stageDefaults[formState.stage].note }}</span><span class="note-line"></span></footer>
        <div class="paper-footer">{{ PAPER_FOOTER_ZH }}</div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.timetable-generator { display: flex; gap: 24px; height: 100%; }
.settings-panel { width: 320px; flex: 0 0 320px; overflow-y: auto; border-radius: 8px; background: #fffdf7; box-shadow: 0 12px 30px rgba(60, 54, 38, .08); }
.stage-hint { margin: -8px 0 18px; padding: 10px 12px; color: #536056; font-size: 13px; line-height: 1.6; background: #f3f7f0; border-radius: 7px; }
.action-buttons, .export-buttons { display: grid; gap: 10px; }.export-buttons { grid-template-columns: 1fr 1fr; }
.preview-panel { flex: 1; min-width: 0; overflow: auto; display: flex; justify-content: center; padding: 24px; border-radius: 8px; background: #eee8dc; }
.timetable-paper { --ink: #28493d; --accent: #7cbd96; --soft: #e7f3e8; --grid: #b9d2c0; position: relative; box-sizing: border-box; width: 210mm; height: 296mm; padding: 14mm 12mm 15mm; overflow: hidden; color: var(--ink); background: #fffefa; box-shadow: 0 18px 44px rgba(60, 54, 38, .16); print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.paper-topline { height: 7px; margin: -14mm -12mm 8mm; background: var(--accent); }.timetable-header { text-align: center; }.header-kicker { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: 2px; }.timetable-header h1 { margin: 4px 0 9px; font-size: 28px; letter-spacing: 3px; color: var(--ink); }.header-meta { display: flex; justify-content: center; gap: 18px; font-size: 11px; color: #5e6c64; }.header-meta span { min-width: 115px; padding-bottom: 4px; border-bottom: 1px solid var(--grid); text-align: left; }
.schedule-shell { margin-top: 9mm; border: 1.5px solid var(--accent); border-radius: 8px; overflow: hidden; }.schedule-table { width: 100%; border-collapse: collapse; table-layout: fixed; }.schedule-table th, .schedule-table td { border: 1px solid var(--grid); }.schedule-table thead th { height: 12mm; color: #fff; background: var(--accent); font-size: 13px; letter-spacing: .5px; }.schedule-table .period-heading { width: 27mm; }.schedule-table tbody th { padding: 2px 3px; color: var(--ink); background: var(--soft); text-align: center; }.schedule-table td { height: 18mm; padding: 0; text-align: center; background: rgba(255,255,255,.84); }.schedule-table input { display: block; box-sizing: border-box; width: 100%; padding: 2px; color: var(--ink); font-family: ui-sans-serif, system-ui, sans-serif; text-align: center; background: transparent; border: 0; outline: 0; }.schedule-table input::placeholder { color: rgba(56, 86, 72, .27); }.schedule-table .course-input { height: 10.5mm; font-size: 12px; font-weight: 700; }.schedule-table .course-detail { height: 5.8mm; padding-top: 0; color: #708078; font-size: 8px; font-weight: 400; }.period-input { height: 5.5mm; font-size: 10px; font-weight: 700; }.period-time { height: 4.2mm; padding-top: 0 !important; color: #6f8278 !important; font-size: 8px; font-weight: 400; }.break-row th, .break-row td { height: 8.5mm !important; }.break-row td { background: repeating-linear-gradient(-45deg, #f7fbf5, #f7fbf5 4px, #edf6ec 4px, #edf6ec 8px); }.break-label { color: #7a9884; font-size: 9px; }.timetable-notes { display: flex; align-items: center; gap: 9px; margin-top: 6mm; padding: 9px 12px; color: #5e7166; font-size: 11px; border: 1px dashed var(--grid); border-radius: 7px; }.timetable-notes strong { color: var(--ink); }.note-line { flex: 1; border-bottom: 1px solid var(--grid); }.paper-footer { position: absolute; right: 12mm; bottom: 6mm; left: auto; color: #8b998f; font-size: 8px; text-align: right; }
.stage-primary { --ink: #406130; --accent: #8fbd57; --soft: #f0f7db; --grid: #c7dca7; background: #fffdf4; }.stage-primary .paper-topline { background: repeating-linear-gradient(90deg, #f3c64b 0 20px, #89bf56 20px 40px, #77b4da 40px 60px, #f28a7e 60px 80px); }.stage-primary .timetable-header h1 { font-family: ui-rounded, "PingFang SC", sans-serif; }.stage-primary .schedule-shell { border-radius: 14px; }.stage-primary .schedule-table td:nth-child(2) { background: #fff9df; }.stage-primary .schedule-table td:nth-child(3) { background: #f2f8ff; }.stage-primary .schedule-table td:nth-child(4) { background: #fff0ed; }.stage-primary .schedule-table td:nth-child(5) { background: #f6f0ff; }.stage-primary .schedule-table td:nth-child(6) { background: #effaf4; }
.stage-middle { --ink: #19465c; --accent: #276f91; --soft: #e5f3f7; --grid: #aacdd9; background: #fcfefe; }.stage-middle .timetable-header { text-align: left; border-left: 5px solid var(--accent); padding-left: 12px; }.stage-middle .header-meta { justify-content: flex-start; }.stage-middle .schedule-shell { border-radius: 2px; }
.stage-high { --ink: #26384c; --accent: #26384c; --soft: #edf1f5; --grid: #bdcad7; background: #fff; }.stage-high .paper-topline { height: 4px; background: #26384c; }.stage-high .timetable-header h1 { font-family: Georgia, "Songti SC", serif; letter-spacing: 6px; }.stage-high .schedule-shell { border-radius: 0; border-width: 2px; }.stage-high .timetable-notes { border-radius: 0; }
.stage-university { --ink: #292f3d; --accent: #303d55; --soft: #e9edf6; --grid: #c3cbdc; background: #fdfdff; }.stage-university .paper-topline { height: 10px; background: linear-gradient(90deg, #252c3b 0 28%, #4e6ba3 28% 63%, #c9a465 63%); }.stage-university .timetable-header { display: grid; grid-template-columns: 1fr auto; align-items: end; text-align: left; }.stage-university .header-kicker { grid-column: 1 / -1; }.stage-university .timetable-header h1 { margin-bottom: 0; font-size: 25px; letter-spacing: 1px; }.stage-university .header-meta { justify-content: flex-end; gap: 8px; }.stage-university .header-meta span { min-width: 72px; }.stage-university .schedule-shell { border-radius: 0; border-top-width: 4px; }.stage-university .schedule-table td { height: 25mm; }.stage-university .break-row th, .stage-university .break-row td { height: 9mm !important; }
.theme-sage-green { --ink: #5e4d3f; --accent: #b09f90; --soft: #d6dfc9; --grid: #b6c2aa; background: #f8faf2; }.theme-nordic-blue { --ink: #3d4e5c; --accent: #9eb2c0; --soft: #d6e4eb; --grid: #b7cad4; background: #f9fcfd; }.theme-warm-sand { --ink: #6b5847; --accent: #c4b19e; --soft: #eae1d0; --grid: #d1c0ab; background: #fffdf9; }.theme-peach-cream { --ink: #634942; --accent: #c7a49a; --soft: #ebdcd5; --grid: #d9beb7; background: #fffafa; }.theme-classic-white { --ink: #2c3b2b; --accent: #6c7470; --soft: #f3f4f2; --grid: #cbd0cb; background: #fff; }.theme-sage-green .paper-topline, .theme-nordic-blue .paper-topline, .theme-warm-sand .paper-topline, .theme-peach-cream .paper-topline, .theme-classic-white .paper-topline { height: 7px; background: var(--accent); }.theme-sage-green .schedule-table td, .theme-nordic-blue .schedule-table td, .theme-warm-sand .schedule-table td, .theme-peach-cream .schedule-table td, .theme-classic-white .schedule-table td { background: rgba(255,255,255,.9); }
@media (max-width: 768px) { .timetable-generator { display: block; height: auto; }.settings-panel { width: 100%; }.preview-panel { margin-top: 12px; padding: 14px; justify-content: flex-start; }.timetable-paper { flex: 0 0 auto; transform-origin: top left; } }
@media print { .timetable-generator, .preview-panel { display: block !important; padding: 0 !important; background: #fff !important; overflow: visible !important; }.timetable-paper { box-shadow: none !important; border-radius: 0 !important; }.schedule-table input { appearance: none; -webkit-appearance: none; }.no-print { display: none !important; } }
</style>
