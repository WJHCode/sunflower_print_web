<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { convert, pinyin } from 'pinyin-pro';
import { DownloadOutlined, PrinterOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '../utils/print';
import { useExportLoading } from '../composables/useExportLoading';

const { isPdfLoading, isImageLoading, runExport } = useExportLoading();

type PartCount = 2 | 3;
type ColorSetting = { role: 'initial' | 'medial' | 'final'; label: string; color: string };
type PracticeGroup = { id: string; partCount: PartCount; words: string[] };
type EditableExercise = { id: string; wordsText: string };
type ReadingRow = {
  id: string;
  word: string;
  wordPinyin: string;
  firstPinyin: string;
  tone: number;
  parts: string[];
};
type Pair = { id: string; titleParts: string[]; rows: ReadingRow[] };

const palette = [
  { name: '红色', value: '#d65c52' }, { name: '黄色', value: '#d39b22' },
  { name: '绿色', value: '#3b8752' }, { name: '黑色', value: '#20252b' },
  { name: '橙色', value: '#e47b36' }, { name: '蓝色', value: '#3478b9' },
];

// The library stores words only. Pinyin and its parts are always derived from
// the first character in the complete word context.
const practiceLibrary: PracticeGroup[] = [
  { id: 'ba', partCount: 2, words: ['八个', '拔牙', '把握', '爸爸', '吧'] },
  { id: 'bo', partCount: 2, words: ['波浪', '脖子', '跛脚', '簸箕'] },
  { id: 'bi', partCount: 2, words: ['逼近', '鼻子', '笔画', '壁画'] },
  { id: 'bu', partCount: 2, words: ['逋逃', '不对', '补丁', '不安'] },
  { id: 'bai', partCount: 2, words: ['掰开', '白菜', '百花', '拜年'] },
  { id: 'bei', partCount: 2, words: ['杯子', '北方', '被子'] },
  { id: 'pa', partCount: 2, words: ['趴下', '扒手', '怕人'] },
  { id: 'po', partCount: 2, words: ['坡路', '婆婆', '叵测', '破坏'] },
  { id: 'pi', partCount: 2, words: ['批评', '皮球', '匹马', '譬如'] },
  { id: 'pu', partCount: 2, words: ['铺开', '葡萄', '普通', '铺子'] },
  { id: 'pai', partCount: 2, words: ['拍手', '排队', '派对'] },
  { id: 'pao', partCount: 2, words: ['抛球', '刨冰', '跑步', '泡沫'] },
  { id: 'ma', partCount: 2, words: ['妈妈', '麻雀', '马路', '骂人', '吗'] },
  { id: 'mo', partCount: 2, words: ['摸鱼', '魔法', '抹黑', '墨水'] },
  { id: 'mi', partCount: 2, words: ['眯眼', '迷路', '米饭', '秘密'] },
  { id: 'mu', partCount: 2, words: ['模样', '母亲', '木头'] },
  { id: 'mai', partCount: 2, words: ['埋头', '买菜', '卖场'] },
  { id: 'mei', partCount: 2, words: ['梅花', '美丽', '妹妹'] },
  { id: 'gua', partCount: 3, words: ['瓜皮', '寡妇', '挂念'] },
  { id: 'guo', partCount: 3, words: ['锅子', '国家', '果实', '过去'] },
  { id: 'gui', partCount: 3, words: ['归来', '鬼脸', '桂花'] },
  { id: 'guan', partCount: 3, words: ['关门', '管子', '冠军'] },
  { id: 'hua', partCount: 3, words: ['花朵', '滑雪', '画画'] },
  { id: 'huo', partCount: 3, words: ['豁口', '活泼', '火车', '货物'] },
  { id: 'hui', partCount: 3, words: ['灰色', '回家', '毁坏', '会议'] },
  { id: 'huan', partCount: 3, words: ['欢乐', '还给', '缓慢', '唤醒'] },
  { id: 'jia', partCount: 3, words: ['家庭', '夹被', '假如', '价格'] },
  { id: 'jie', partCount: 3, words: ['街道', '节日', '姐姐', '介绍'] },
  { id: 'jiao', partCount: 3, words: ['交通', '嚼舌', '角度', '教室'] },
  { id: 'jian', partCount: 3, words: ['坚持', '简单', '见面'] },
];

const formState = ref<{ title: string; partCount: PartCount }>({
  title: '声母与韵母拼读',
  partCount: 2,
});
const colorSettings = ref<ColorSetting[]>([
  { role: 'initial', label: '声母颜色', color: palette[0].value },
  { role: 'medial', label: '介母颜色', color: palette[5].value },
  { role: 'final', label: '韵母颜色', color: palette[2].value },
]);
const exercises = ref<EditableExercise[]>([]);
const regenerateKey = ref(0);
const isGenerating = ref(true);
let regenerateTimer: ReturnType<typeof setTimeout> | undefined;

const activeColorSettings = computed(() => formState.value.partCount === 2
  ? [colorSettings.value[0], colorSettings.value[2]]
  : colorSettings.value);
const pageExerciseCount = computed(() => formState.value.partCount === 2 ? 6 : 4);
const wordsFromText = (value: string) => value
  .split(/[\n，,、]+/)
  .map((word) => word.trim())
  .filter(Boolean)
  .slice(0, 5);
const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};
const regenerateExercises = () => {
  isGenerating.value = true;
  if (regenerateTimer) clearTimeout(regenerateTimer);
  regenerateTimer = setTimeout(() => {
    const candidates = practiceLibrary.filter((item) => item.partCount === formState.value.partCount);
    exercises.value = shuffle(candidates)
      .slice(0, pageExerciseCount.value)
      .map((item) => ({ id: `${item.id}-${regenerateKey.value + 1}`, wordsText: item.words.join('\n') }));
    regenerateKey.value++;
    isGenerating.value = false;
  }, 0);
};

const pinyinParts = (word: string): ReadingRow | null => {
  const details = pinyin(word, { type: 'all' });
  const first = details[0];
  if (!first?.isZh || !first.pinyin) return null;

  const parts = formState.value.partCount === 2
    ? [first.initial, first.final]
    : [first.initial, first.finalHead, `${first.finalBody}${first.finalTail}`];
  if (parts.some((part) => !part)) return null;

  return {
    id: `${word}-${first.pinyin}`,
    word,
    wordPinyin: details.map((item) => item.pinyin || item.origin).join(' '),
    firstPinyin: first.pinyin,
    tone: first.num,
    parts,
  };
};
const toneOrder = (tone: number) => tone === 0 ? 5 : tone;
const pairs = computed<Pair[]>(() => exercises.value.map((exercise) => {
  const rows = wordsFromText(exercise.wordsText)
    .map(pinyinParts)
    .filter((row): row is ReadingRow => row !== null)
    .sort((left, right) => toneOrder(left.tone) - toneOrder(right.tone));
  return {
    id: exercise.id,
    titleParts: rows[0]?.parts.map((part) => convert(part, { format: 'toneNone' })) || [],
    rows,
  };
}));
const groupLabel = (exercise: EditableExercise, index: number) => {
  const firstWord = wordsFromText(exercise.wordsText)[0];
  const row = firstWord ? pinyinParts(firstWord) : null;
  return row ? row.parts.map((part) => convert(part, { format: 'toneNone' })).join('—') : `第 ${index + 1} 组`;
};
const chooseColor = (setting: ColorSetting, color: string) => { setting.color = color; };

watch(() => formState.value.partCount, regenerateExercises);
regenerateExercises();

const paperExportOptions = { paperHeightMm: 296.6 };
const printPaper = () => printElement('pinyin-reading-paper', formState.value.title, paperExportOptions);
const downloadPDF = async () => {
  const el = document.getElementById('pinyin-reading-paper');
  if (el) await runExport('pdf', () => savePdfFromElement(el, `${formState.value.title}.pdf`, paperExportOptions));
};
const downloadImage = async () => {
  const el = document.getElementById('pinyin-reading-paper');
  if (el) await runExport('image', () => saveImageFromElement(el, `${formState.value.title}.png`, paperExportOptions));
};
</script>

<template>
  <div class="pinyin-reading-container">
    <a-card class="settings-panel no-print" :bordered="false" title="拼音练习题设置">
      <a-form layout="vertical">
        <a-form-item label="练习标题"><a-input v-model:value="formState.title" /></a-form-item>
          <a-form-item label="拼音组成">
          <a-radio-group v-model:value="formState.partCount" button-style="solid">
            <a-radio-button :value="2">双音节</a-radio-button><a-radio-button :value="3">三音节</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-divider orientation="left">拼音颜色设置</a-divider>
        <div v-for="setting in activeColorSettings" :key="setting.role" class="syllable-config color-config">
          <div class="config-label">{{ setting.label }}</div>
          <div class="palette-row"><button v-for="color in palette" :key="color.value" type="button" class="palette-dot" :class="{ selected: setting.color === color.value }" :style="{ backgroundColor: color.value }" :aria-label="`${color.name}，${setting.label}`" :title="color.name" @click="chooseColor(setting, color.value)"></button></div>
        </div>
        <a-divider orientation="left">自定义词组</a-divider>
        <p class="helper-text">每行一个词组，拼音会根据词组第一个字自动生成，并按一声到轻声排序。</p>
        <div v-for="(exercise, index) in exercises" :key="exercise.id" class="example-config">
          <div class="exercise-label">{{ groupLabel(exercise, index) }}</div>
          <a-textarea v-model:value="exercise.wordsText" :rows="4" placeholder="每行输入一个词组，最多 5 个" />
        </div>
        <a-divider />
        <div class="action-buttons">
          <a-button block size="large" @click="regenerateExercises" style="margin-bottom: 16px; background: #f6c84c; color: #2c3b2b; border-color: #f6c84c"><template #icon><RedoOutlined /></template>重新生成题目</a-button>
          <a-button type="primary" block size="large" @click="printPaper"><template #icon><PrinterOutlined /></template>直接打印</a-button>
          <div class="export-buttons"><a-button block size="large" :loading="isPdfLoading" :disabled="isImageLoading" @click="downloadPDF"><template #icon><DownloadOutlined /></template>{{ isPdfLoading ? '处理中…' : '下载 PDF' }}</a-button><a-button block size="large" :loading="isImageLoading" :disabled="isPdfLoading" @click="downloadImage"><template #icon><DownloadOutlined /></template>{{ isImageLoading ? '处理中…' : '下载图片' }}</a-button></div>
        </div>
      </a-form>
    </a-card>

    <div class="preview-panel print-full-width">
      <div v-if="isGenerating" class="generation-loading" role="status" aria-live="polite">
        <span class="loading-spinner" aria-hidden="true"></span>
        题目生成中…
      </div>
      <div id="pinyin-reading-paper" class="pinyin-reading-paper paper-container">
        <header class="pinyin-paper-header"><h1>{{ formState.title }}</h1><div class="paper-info"><span>姓名：__________</span><span>班级：__________</span><span>日期：__________</span></div></header>
        <div class="reading-grid" :class="formState.partCount === 2 ? 'two-part-grid' : 'three-part-grid'">
          <section v-for="pair in pairs" :key="`${pair.id}-${regenerateKey}`" class="reading-card">
            <div class="reading-card-title"><template v-for="(part, index) in pair.titleParts" :key="index"><span :style="{ color: activeColorSettings[index].color }">{{ part }}</span><span v-if="index < pair.titleParts.length - 1" class="segment-divider">—</span></template></div>
            <div v-for="row in pair.rows" :key="row.id" class="reading-row">
              <div class="pinyin-result">
                <div class="joining"><template v-for="(part, index) in row.parts" :key="index"><span :style="{ color: activeColorSettings[index].color }">{{ part }}</span><span v-if="index < row.parts.length - 1" class="segment-divider">—</span></template><span class="arrow">→</span></div>
                <div class="answer-box"><span class="complete-spelling">{{ row.firstPinyin }}</span></div>
              </div>
              <span class="tone-example"><span class="example-pinyin">{{ row.wordPinyin }}</span><span class="example-word">{{ row.word }}</span></span>
            </div>
          </section>
        </div>
        <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pinyin-reading-container { display: flex; gap: 24px; height: 100%; }
.settings-panel { width: 320px; flex-shrink: 0; border-radius: 8px; box-shadow: 0 12px 30px rgba(60,54,38,.08); overflow-y: auto; background: #fffdf7; }
.preview-panel { position: relative; flex-grow: 1; background: #eee8dc; border-radius: 8px; overflow-y: auto; display: flex; justify-content: center; padding: 24px; }
.generation-loading { position: absolute; inset: 24px; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(238,232,220,.82); color: #2f7d46; font-weight: 700; pointer-events: none; }
.pinyin-reading-paper { position: relative; box-sizing: border-box; display: flex; flex: 0 0 auto; flex-direction: column; width: 210mm; height: 296.6mm; padding: 10mm 9mm 8mm; background: #fff; box-shadow: 0 18px 44px rgba(60,54,38,.16); font-family: "Andika", "Noto Sans SC", sans-serif; overflow: hidden; }
.pinyin-paper-header { flex: 0 0 auto; text-align: center; margin-bottom: 8mm; }
.pinyin-paper-header h1 { margin: 0 0 5mm; color: #252a30; font: 400 25px/1.2 "Kaiti", "STKaiti", serif; letter-spacing: .08em; }
.paper-info { display: flex; justify-content: space-between; color: #555; font: 12px/1.3 sans-serif; }
.reading-grid { display: grid; flex: 1 1 auto; min-height: 0; align-content: space-evenly; column-gap: 5mm; row-gap: 0; }
.two-part-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(2, 99mm); }
.three-part-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, 99mm); }
.reading-card { display: flex; min-width: 0; flex-direction: column; border: 1.5px solid #dca7a2; border-radius: 15px; padding: 0 4mm 3mm; }
.reading-card-title { width: 70%; min-width: 38mm; margin: -5mm auto 3mm; padding: 1.5mm 2mm; border: 1.5px solid #dca7a2; border-radius: 18px; background: #fff; text-align: center; font-size: 23px; line-height: 1.2; white-space: nowrap; }
.segment-divider, .arrow { color: #555; }
.reading-row { display: flex; align-items: center; justify-content: center; gap: 8mm; min-height: 12mm; font-size: 18px; }
.two-part-grid .reading-card { padding-inline: 2mm; }
.two-part-grid .reading-row { flex: 1; gap: 3mm; min-height: 0; font-size: 17px; }
.three-part-grid .reading-row { flex: 1; min-height: 0; }
.pinyin-result { display: inline-flex; align-items: center; gap: 4mm; min-width: 0; }
.two-part-grid .pinyin-result { gap: 2mm; }
.two-part-grid .answer-box { min-height: 8mm; font-size: 20px; }
.joining { white-space: nowrap; }
.arrow { padding-left: 2px; }
.answer-box { min-height: 8mm; display: flex; align-items: center; justify-content: center; padding: 0; font-size: 20px; white-space: nowrap; }
.complete-spelling { color: #20252b; }
.tone-example { min-width: 0; overflow: hidden; color: #bd756b; text-align: left; pointer-events: none; }
.example-pinyin, .example-word { display: block; overflow: hidden; text-overflow: ellipsis; }
.example-pinyin { font-size: 9px; line-height: 1.05; }
.example-word { font-size: 11px; line-height: 1.1; }
.paper-footer { flex: 0 0 auto; margin-top: 2mm; }
.syllable-config { padding: 8px 10px 10px; margin-bottom: 10px; border-radius: 8px; background: #f8f7f1; }
.config-label { margin-bottom: 6px; color: #555; font-size: 13px; }
.palette-row { display: flex; gap: 8px; margin-top: 8px; }
.color-config .palette-row { margin-top: 0; }
.palette-dot { width: 20px; height: 20px; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 0 1px #d4d4d4; cursor: pointer; }
.palette-dot.selected { box-shadow: 0 0 0 2px #333; }
.helper-text { color: #888; font-size: 12px; margin: -4px 0 8px; }
.example-config { display: grid; grid-template-columns: 48px 1fr; gap: 8px; align-items: start; margin-bottom: 8px; color: #555; font-size: 13px; }
.exercise-label { padding-top: 4px; overflow: hidden; color: #555; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
.action-buttons :deep(.ant-btn-primary) { background: #2f7d46; border-color: #2f7d46; }
.action-buttons :deep(.ant-btn-primary:hover), .action-buttons :deep(.ant-btn-primary:focus) { background: #235d34; border-color: #235d34; }
.export-buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
@media (max-width: 768px) { .pinyin-reading-container { height: auto; flex-direction: column; gap: 12px; } .settings-panel { width: 100%; overflow: visible; } .preview-panel { min-height: 430px; padding: 12px; overflow: hidden; justify-content: center; align-items: flex-start; } .pinyin-reading-paper { --zoom-factor: .43; transform: scale(var(--zoom-factor)); transform-origin: top left; margin-right: calc(-210mm * (1 - var(--zoom-factor))); margin-bottom: calc(-296.6mm * (1 - var(--zoom-factor))); } }
@media (min-width: 430px) and (max-width: 768px) { .pinyin-reading-paper { --zoom-factor: .5; } }
@media print { @page { size: A4 portrait; margin: 0; } .no-print { display: none !important; } .pinyin-reading-container { display: block; } .print-full-width { padding: 0 !important; background: transparent !important; display: block; overflow: visible !important; } .pinyin-reading-paper { transform: none !important; box-shadow: none !important; margin: 0 auto !important; } }
</style>
