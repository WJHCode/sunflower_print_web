<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '../utils/print';
import { pinyin } from 'pinyin-pro';
import { GRADE_1_2_WORDS } from '../utils/wordBank';
import { message } from 'ant-design-vue';
import { useI18n } from '@/i18n';

const { t } = useI18n();

type ChinesePaperType =
  | 'tianzi'
  | 'radical'
  | 'stroke-type'
  | 'pinyin-finals'
  | 'pinyin-initials'
  | 'pinyin-syllables'
  | 'stroke-order'
  | 'pinyin-stroke-order'
  | 'four-line-square'
  | 'pinyin-paper'
  | 'composition'
  | 'cornell-note';
type StrokeCellMode = 'blank' | 'sample' | 'trace';
type StrokeCell = {
  char: string;
  mode: StrokeCellMode;
};
type StrokeRow = {
  char: string;
  cells: StrokeCell[];
};
type PinyinStrokeCellMode = 'blank' | 'sample' | 'trace' | 'stroke-step';
type PinyinStrokeCell = {
  char: string;
  pinyin: string;
  mode: PinyinStrokeCellMode;
  stepIndex: number;
};
type PinyinStrokeRow = {
  char: string;
  pinyin: string;
  cells: PinyinStrokeCell[];
};
type HanziStrokeData = {
  strokes: string[];
  loading: boolean;
  error: boolean;
};

const finals = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'];
const initials = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
const syllables = ['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying'];

const formState = ref({
  type: 'tianzi' as ChinesePaperType,
  strokeChars: '一二三上口日田目',
  pinyinStrokeChars: '一二三上口日田目',
  radicalChars: '亻冫氵辶艹宀口土木扌忄讠纟钅疒竹雨礻衤女子犭饣月日山石田禾白目足',
  strokeTypeChars: '一,丨,丿,丶,乀,乛,亅,乚,\uD840\uDC0B,\uD840\uDCD1,\uD840\uDD0E,乙,フ',
});
const isGenerating = ref(true);
let previewTimer: ReturnType<typeof setTimeout> | undefined;

const schedulePreviewGeneration = () => {
  isGenerating.value = true;
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    isGenerating.value = false;
  }, 0);
};

const paperTitleKeys: Record<ChinesePaperType, string> = {
  tianzi: 'options.tianzi',
  radical: 'options.radical',
  'stroke-type': 'options.strokeType',
  'pinyin-finals': 'options.pinyinFinals',
  'pinyin-initials': 'options.pinyinInitials',
  'pinyin-syllables': 'options.pinyinSyllables',
  'stroke-order': 'options.strokeOrder',
  'pinyin-stroke-order': 'options.pinyinStrokeOrder',
  'four-line-square': 'options.fourLineSquare',
  'pinyin-paper': 'options.pinyinPaper',
  composition: 'options.composition',
  'cornell-note': 'options.cornellNote',
};

const paperTitle = computed(() => t(paperTitleKeys[formState.value.type]));
const isTianzi = computed(() => formState.value.type === 'tianzi');
const isRadical = computed(() => formState.value.type === 'radical');
const isStrokeType = computed(() => formState.value.type === 'stroke-type');
const isStrokeOrder = computed(() => formState.value.type === 'stroke-order');
const isPinyinStrokeOrder = computed(() => formState.value.type === 'pinyin-stroke-order');
const isFourLineSquare = computed(() => formState.value.type === 'four-line-square');
const isPinyinPaper = computed(() => formState.value.type === 'pinyin-paper');
const isComposition = computed(() => formState.value.type === 'composition');
const isCornellNote = computed(() => formState.value.type === 'cornell-note');
const isPairedPinyin = computed(() => formState.value.type === 'pinyin-finals' || formState.value.type === 'pinyin-initials');
const pinyinRows = computed(() => {
  if (formState.value.type === 'pinyin-finals') return finals;
  if (formState.value.type === 'pinyin-initials') return initials;
  if (formState.value.type === 'pinyin-syllables') return syllables;
  return [];
});
const pinyinPracticeRows = computed(() => {
  if (!isPairedPinyin.value) return pinyinRows.value.map((item) => [item]);

  const rows: string[][] = [];
  for (let i = 0; i < pinyinRows.value.length; i += 2) {
    rows.push(pinyinRows.value.slice(i, i + 2));
  }
  return rows;
});
const pinyinPages = computed(() => {
  const pageSize = isPairedPinyin.value ? 12 : 16;
  const pages: string[][][] = [];
  for (let i = 0; i < pinyinPracticeRows.value.length; i += pageSize) {
    pages.push(pinyinPracticeRows.value.slice(i, i + pageSize));
  }
  return pages;
});
const strokeOrderChars = computed(() => (
  formState.value.strokeChars
    .replace(/\s/g, '')
    .split('')
    .filter(Boolean)
    .slice(0, 200)
));
const limitStrokeChars = (value: string) => value.replace(/\s/g, '').slice(0, 200);
const updateStrokeChars = (value: string) => {
  formState.value.strokeChars = limitStrokeChars(value);
};
const buildStrokeCells = (char?: string): StrokeCell[] => {
  if (!char) {
    return Array.from({ length: 15 }, () => ({ char: '', mode: 'blank' }));
  }

  const cells: StrokeCell[] = [{ char, mode: 'sample' }];

  while (cells.length < 8) {
    cells.push({ char, mode: 'trace' });
  }
  while (cells.length < 15) {
    cells.push({ char: '', mode: 'blank' });
  }

  return cells;
};
const strokeRows = computed(() => {
  const rows: StrokeRow[] = strokeOrderChars.value.map((char) => ({
    char,
    cells: buildStrokeCells(char),
  }));
  return rows;
});
const strokePages = computed(() => {
  const pageSize = 11;
  const pages: StrokeRow[][] = [];
  for (let i = 0; i < strokeRows.value.length; i += pageSize) {
    pages.push(strokeRows.value.slice(i, i + pageSize));
  }
  if (!pages.length) {
    pages.push([]);
  }
  return pages.map((page) => {
    const rows = [...page];
    while (rows.length < pageSize) {
      rows.push({ char: '', cells: buildStrokeCells() });
    }
    return rows;
  });
});
const pinyinStrokeOrderChars = computed(() => (
  formState.value.pinyinStrokeChars
    .replace(/\s/g, '')
    .split('')
    .filter(Boolean)
    .slice(0, 200)
));
const limitPinyinStrokeChars = (value: string) => value.replace(/\s/g, '').slice(0, 200);
const updatePinyinStrokeChars = (value: string) => {
  formState.value.pinyinStrokeChars = limitPinyinStrokeChars(value);
};
const getCharPinyin = (char: string): string => {
  if (!char) return '';
  return pinyin(char, { toneType: 'symbol' });
};
const buildPinyinStrokeCells = (char?: string): PinyinStrokeCell[] => {
  const charPinyin = char ? getCharPinyin(char) : '';
  if (!char) {
    return Array.from({ length: 15 }, () => ({ char: '', pinyin: '', mode: 'blank', stepIndex: -1 }));
  }

  const strokes = getStrokeData(char)?.strokes ?? [];
  const S = strokes.length;

  const cells: PinyinStrokeCell[] = [];

  // Cell 0 is always the sample cell (black)
  cells.push({ char, pinyin: charPinyin, mode: 'sample', stepIndex: -1 });

  if (S > 0) {
    // We have stroke data
    for (let i = 1; i <= 14; i++) {
      if (i <= S) {
        // Step i (indices 0 to i-1)
        cells.push({ char, pinyin: charPinyin, mode: 'stroke-step', stepIndex: i - 1 });
      } else {
        if (i < 8) {
          cells.push({ char, pinyin: charPinyin, mode: 'trace', stepIndex: -1 });
        } else {
          cells.push({ char: '', pinyin: '', mode: 'blank', stepIndex: -1 });
        }
      }
    }
  } else {
    // Fallback if stroke data is not loaded yet (or has error)
    for (let i = 1; i <= 14; i++) {
      if (i < 8) {
        cells.push({ char, pinyin: charPinyin, mode: 'trace', stepIndex: -1 });
      } else {
        cells.push({ char: '', pinyin: '', mode: 'blank', stepIndex: -1 });
      }
    }
  }

  return cells;
};
const pinyinStrokeRows = computed(() => {
  const rows: PinyinStrokeRow[] = pinyinStrokeOrderChars.value.map((char) => ({
    char,
    pinyin: getCharPinyin(char),
    cells: buildPinyinStrokeCells(char),
  }));
  return rows;
});
const pinyinStrokePages = computed(() => {
  const pageSize = 8;
  const pages: PinyinStrokeRow[][] = [];
  for (let i = 0; i < pinyinStrokeRows.value.length; i += pageSize) {
    pages.push(pinyinStrokeRows.value.slice(i, i + pageSize));
  }
  if (!pages.length) {
    pages.push([]);
  }
  return pages.map((page) => {
    const rows = [...page];
    while (rows.length < pageSize) {
      rows.push({ char: '', pinyin: '', cells: buildPinyinStrokeCells() });
    }
    return rows;
  });
});
const splitPages = computed(() => {
  const inputStr = (
    formState.value.type === 'radical'
      ? formState.value.radicalChars
      : formState.value.strokeTypeChars
  ) || '';

  const hasDelimiters = /[,，\n]/.test(inputStr);
  const chars = hasDelimiters
    ? inputStr.split(/[,，\n]+/).map(s => s.trim()).filter(Boolean)
    : Array.from(inputStr.replace(/\s/g, '')).filter(Boolean);

  const pageSize = 16;
  const pages: { left: string; right: string }[][] = [];
  const itemsPerPage = pageSize * 2;

  for (let i = 0; i < chars.length; i += itemsPerPage) {
    const pageChars = chars.slice(i, i + itemsPerPage);
    const rows: { left: string; right: string }[] = [];

    for (let r = 0; r < pageSize; r++) {
      const leftIndex = r * 2;
      const rightIndex = r * 2 + 1;

      rows.push({
        left: pageChars[leftIndex] || '',
        right: pageChars[rightIndex] || '',
      });
    }
    pages.push(rows);
  }

  if (!pages.length) {
    const emptyRows = Array.from({ length: pageSize }, () => ({ left: '', right: '' }));
    pages.push(emptyRows);
  }

  return pages;
});

const getCharStyle = (text?: string) => {
  if (!text) return {};
  const len = text.length;
  if (len <= 1) {
    return {};
  }
  if (len === 2) {
    return { fontSize: '16px', lineHeight: '1.2' };
  }
  if (len === 3) {
    return { fontSize: '12px', lineHeight: '1.2' };
  }
  if (len === 4) {
    return { fontSize: '9px', lineHeight: '1.2' };
  }
  return { fontSize: '8px', lineHeight: '1.1' };
};

const strokeDataByChar = reactive<Record<string, HanziStrokeData>>({});
const strokeStepsByChar = new Map<string, string[][]>();
const strokeSvgViewBox = '0 0 1024 1024';
const strokeSvgTransform = 'scale(1, -1) translate(0, -900)';
const getStrokeData = (char: string) => strokeDataByChar[char];
const getStrokeSteps = (char: string) => {
  const cachedSteps = strokeStepsByChar.get(char);
  if (cachedSteps) return cachedSteps;
  const strokes = getStrokeData(char)?.strokes ?? [];
  const steps = strokes.map((_, index) => strokes.slice(0, index + 1));
  strokeStepsByChar.set(char, steps);
  return steps;
};
const getStrokeCount = (char: string) => getStrokeData(char)?.strokes.length ?? 0;
const loadStrokeData = async (char: string) => {
  const cached = strokeDataByChar[char];
  if (cached?.loading || cached?.strokes.length || cached?.error) return;

  strokeDataByChar[char] = { strokes: [], loading: true, error: false };

  try {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`);
    if (!response.ok) throw new Error(`Failed to load stroke data for ${char}`);
    const data = await response.json() as { strokes?: string[] };
    strokeDataByChar[char] = {
      strokes: Array.isArray(data.strokes) ? data.strokes : [],
      loading: false,
      error: false,
    };
    strokeStepsByChar.delete(char);
  } catch {
    strokeDataByChar[char] = { strokes: [], loading: false, error: true };
    strokeStepsByChar.delete(char);
  }
};

watch(strokeOrderChars, (chars) => {
  chars.forEach((char) => {
    void loadStrokeData(char);
  });
}, { immediate: true });

watch(pinyinStrokeOrderChars, (chars) => {
  chars.forEach((char) => {
    void loadStrokeData(char);
  });
}, { immediate: true });

watch(() => formState.value.type, (newType) => {
  if (newType === 'stroke-order') {
    const shuffled = [...GRADE_1_2_WORDS].sort(() => 0.5 - Math.random());
    formState.value.strokeChars = shuffled.slice(0, 11).join('');
  } else if (newType === 'pinyin-stroke-order') {
    const shuffled = [...GRADE_1_2_WORDS].sort(() => 0.5 - Math.random());
    formState.value.pinyinStrokeChars = shuffled.slice(0, 8).join('');
  }
});

watch(() => formState.value.type, schedulePreviewGeneration, { immediate: true });

const currentWordBankIndex = ref(0);
const importPages = ref(1);

const handleOrderImport = () => {
  const pageSize = isPinyinStrokeOrder.value ? 8 : 11;
  const count = pageSize * importPages.value;
  
  const chars: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (currentWordBankIndex.value + i) % GRADE_1_2_WORDS.length;
    chars.push(GRADE_1_2_WORDS[idx]);
  }
  
  const charStr = chars.join('');
  if (isPinyinStrokeOrder.value) {
    formState.value.pinyinStrokeChars = charStr;
  } else {
    formState.value.strokeChars = charStr;
  }
  
  const prevIndex = currentWordBankIndex.value;
  currentWordBankIndex.value = (currentWordBankIndex.value + count) % GRADE_1_2_WORDS.length;
  
  void message.success(t('generatorSettings.importedOrdered', { count, start: prevIndex, end: prevIndex + count - 1 }));
};

const handleRandomImport = () => {
  const pageSize = isPinyinStrokeOrder.value ? 8 : 11;
  const count = pageSize * importPages.value;
  
  const shuffled = [...GRADE_1_2_WORDS].sort(() => 0.5 - Math.random());
  const charStr = shuffled.slice(0, count).join('');
  
  if (isPinyinStrokeOrder.value) {
    formState.value.pinyinStrokeChars = charStr;
  } else {
    formState.value.strokeChars = charStr;
  }
  
  void message.success(t('generatorSettings.importedRandom', { count }));
};

const printPaper = () => {
  printElement('chinese-printable-paper', paperTitle.value, { pagebreak: true });
};

const downloadPDF = () => {
  const element = document.getElementById('chinese-printable-paper');
  if (!element) return;
  void savePdfFromElement(element, `${paperTitle.value}.pdf`, { pagebreak: true });
};

const downloadImage = () => {
  const element = document.getElementById('chinese-printable-paper');
  if (!element) return;
  void saveImageFromElement(element, `${paperTitle.value}.png`, { pagebreak: true });
};
</script>

<template>
  <div class="chinese-container">
    <a-card class="settings-panel no-print" :bordered="false" :title="t('common.settings')">
      <a-form layout="vertical" :model="formState">
        <a-form-item :label="t('generatorSettings.type')">
          <a-select v-model:value="formState.type">
            <a-select-option value="tianzi">{{ t('options.tianzi') }}</a-select-option>
            <a-select-option value="radical">{{ t('options.radical') }}</a-select-option>
            <a-select-option value="stroke-type">{{ t('options.strokeType') }}</a-select-option>
            <a-select-option value="four-line-square">{{ t('options.fourLineSquare') }}</a-select-option>
            <a-select-option value="pinyin-paper">{{ t('options.pinyinPaper') }}</a-select-option>
            <a-select-option value="composition">{{ t('options.composition') }}</a-select-option>
            <a-select-option value="cornell-note">{{ t('options.cornellNote') }}</a-select-option>
            <a-select-option value="pinyin-finals">{{ t('options.pinyinFinals') }}</a-select-option>
            <a-select-option value="pinyin-initials">{{ t('options.pinyinInitials') }}</a-select-option>
            <a-select-option value="pinyin-syllables">{{ t('options.pinyinSyllables') }}</a-select-option>
            <a-select-option value="stroke-order">{{ t('options.strokeOrder') }}</a-select-option>
            <a-select-option value="pinyin-stroke-order">{{ t('options.pinyinStrokeOrder') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="isRadical" :label="t('generatorSettings.radicals')">
          <a-textarea
            v-model:value="formState.radicalChars"
            :rows="3"
            :placeholder="t('generatorSettings.radicalsPlaceholder')"
          />
          <div class="input-tip">{{ t('generatorSettings.radicalsTip') }}</div>
        </a-form-item>
        <a-form-item v-if="isStrokeType" :label="t('generatorSettings.strokes')">
          <a-textarea
            v-model:value="formState.strokeTypeChars"
            :rows="3"
            :placeholder="t('generatorSettings.strokesPlaceholder')"
          />
          <div class="input-tip">{{ t('generatorSettings.strokesTip') }}</div>
        </a-form-item>
        <a-form-item v-if="isStrokeOrder" :label="t('generatorSettings.practiceChars')">
          <a-textarea
            :value="formState.strokeChars"
            :maxlength="200"
            :rows="3"
            :placeholder="t('generatorSettings.charsPlaceholder')"
            show-count
            @update:value="updateStrokeChars"
          />
          <div class="input-tip">{{ t('generatorSettings.strokeOrderTip') }}</div>
        </a-form-item>
        <a-form-item v-if="isPinyinStrokeOrder" :label="t('generatorSettings.practiceChars')">
          <a-textarea
            :value="formState.pinyinStrokeChars"
            :maxlength="200"
            :rows="3"
            :placeholder="t('generatorSettings.charsPlaceholder')"
            show-count
            @update:value="updatePinyinStrokeChars"
          />
          <div class="input-tip">{{ t('generatorSettings.pinyinStrokeOrderTip') }}</div>
        </a-form-item>
        
        <template v-if="isStrokeOrder || isPinyinStrokeOrder">
          <a-form-item :label="t('generatorSettings.wordBankImport')">
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="line-height: 32px; flex-shrink: 0;">{{ t('generatorSettings.importPages') }}</span>
              <a-select v-model:value="importPages" style="flex-grow: 1;">
                <a-select-option :value="1">1</a-select-option>
                <a-select-option :value="2">2</a-select-option>
                <a-select-option :value="3">3</a-select-option>
                <a-select-option :value="5">5</a-select-option>
                <a-select-option :value="10">10</a-select-option>
              </a-select>
            </div>
            <div style="display: flex; gap: 8px;">
              <a-button type="dashed" style="flex: 1;" @click="handleOrderImport">{{ t('generatorSettings.orderedImport') }}</a-button>
              <a-button type="dashed" style="flex: 1;" @click="handleRandomImport">{{ t('generatorSettings.randomImport') }}</a-button>
            </div>
          </a-form-item>
        </template>
        <a-form-item :label="t('common.paper')">
          <a-tag color="blue">{{ t('common.a4Portrait') }}</a-tag>
        </a-form-item>
        <a-divider />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="printPaper">
            <template #icon><PrinterOutlined /></template>
            {{ t('common.print') }}
          </a-button>
          <div class="export-buttons">
            <a-button block size="large" @click="downloadPDF">
              <template #icon><DownloadOutlined /></template>
              {{ t('common.downloadPdf') }}
            </a-button>
            <a-button block size="large" @click="downloadImage">
              <template #icon><DownloadOutlined /></template>
              {{ t('common.downloadImage') }}
            </a-button>
          </div>
        </div>
      </a-form>
    </a-card>

    <div class="preview-panel print-full-width">
      <div v-if="isGenerating" class="generation-loading" role="status" aria-live="polite">
        <span class="loading-spinner" aria-hidden="true"></span>
        {{ t('common.generating') }}
      </div>
      <div v-else class="paper-stack" id="chinese-printable-paper">
        <div v-if="isTianzi" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="tianzi-sheet">
            <div v-for="row in 16" :key="row" class="tianzi-row">
              <span v-for="cell in 15" :key="cell" class="tianzi-cell"></span>
            </div>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>

        <template v-else-if="isRadical || isStrokeType">
          <div
            v-for="(page, pageIndex) in splitPages"
            :key="pageIndex"
            :class="['paper-container', { 'has-next-page': pageIndex < splitPages.length - 1 }]"
          >
            <div class="paper-header">
              <h2>{{ paperTitle }}</h2>
              <div class="paper-info">
                <span>姓名：__________</span>
                <span>日期：__________</span>
                <span>用时：__________</span>
              </div>
            </div>

            <div class="tianzi-sheet">
              <div v-for="(row, rowIndex) in page" :key="rowIndex" class="split-tianzi-row">
                <div class="tianzi-block">
                  <span v-for="cell in 7" :key="`left-${cell}`" class="tianzi-cell">
                    <span v-if="cell === 1 && row.left" class="radical-char-container" :style="getCharStyle(row.left)">{{ row.left }}</span>
                  </span>
                </div>
                <div class="tianzi-block">
                  <span v-for="cell in 7" :key="`right-${cell}`" class="tianzi-cell">
                    <span v-if="cell === 1 && row.right" class="radical-char-container" :style="getCharStyle(row.right)">{{ row.right }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
          </div>
        </template>

        <template v-else-if="isStrokeOrder">
          <div
            v-for="(page, pageIndex) in strokePages"
            :key="pageIndex"
            :class="['paper-container', { 'has-next-page': pageIndex < strokePages.length - 1 }]"
          >
            <div class="paper-header">
              <h2>{{ paperTitle }}</h2>
              <div class="paper-info">
                <span>姓名：__________</span>
                <span>日期：__________</span>
                <span>用时：__________</span>
              </div>
            </div>

            <div class="stroke-sheet">
              <div v-for="(row, rowIndex) in page" :key="`${row.char || 'blank'}-${rowIndex}`" class="stroke-practice-row">
                <div class="stroke-order-guide">
                  <span class="stroke-order-label">笔顺：</span>
                  <template v-if="row.char">
                    <span v-if="getStrokeData(row.char)?.loading" class="stroke-order-status">加载中...</span>
                    <span v-else-if="getStrokeData(row.char)?.error" class="stroke-order-status">暂无笔顺数据</span>
                    <template v-else>
                      <svg
                        v-for="(step, stepIndex) in getStrokeSteps(row.char)"
                        :key="stepIndex"
                        class="stroke-step-svg"
                        :viewBox="strokeSvgViewBox"
                        aria-hidden="true"
                      >
                        <g :transform="strokeSvgTransform">
                          <path
                            v-for="(path, pathIndex) in step"
                            :key="pathIndex"
                            :d="path"
                            :class="{ current: pathIndex === step.length - 1 }"
                          />
                        </g>
                      </svg>
                    </template>
                    <span class="stroke-count">{{ getStrokeCount(row.char) || '-' }} 画</span>
                  </template>
                </div>

                <div class="stroke-row">
                  <span
                    v-for="(cell, cellIndex) in row.cells"
                    :key="cellIndex"
                    class="stroke-cell"
                  >
                    <svg
                      v-if="cell.char && getStrokeData(cell.char)?.strokes.length"
                      :class="['stroke-char-svg', cell.mode]"
                      :viewBox="strokeSvgViewBox"
                      aria-hidden="true"
                    >
                      <g :transform="strokeSvgTransform">
                        <path
                          v-for="(path, pathIndex) in getStrokeData(cell.char)?.strokes"
                          :key="pathIndex"
                          :d="path"
                        />
                      </g>
                    </svg>
                    <span
                      v-else-if="cell.mode === 'sample'"
                      class="stroke-char sample"
                    >
                      {{ cell.char }}
                    </span>
                    <span
                      v-else-if="cell.mode === 'trace'"
                      class="stroke-char trace"
                    >
                      {{ cell.char }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
          </div>
        </template>

        <template v-else-if="isPinyinStrokeOrder">
          <div
            v-for="(page, pageIndex) in pinyinStrokePages"
            :key="pageIndex"
            :class="['paper-container', { 'has-next-page': pageIndex < pinyinStrokePages.length - 1 }]"
          >
            <div class="paper-header">
              <h2>{{ paperTitle }}</h2>
              <div class="paper-info">
                <span>姓名：__________</span>
                <span>日期：__________</span>
                <span>用时：__________</span>
              </div>
            </div>

            <div class="pinyin-stroke-sheet">
              <div v-for="(row, rowIndex) in page" :key="`${row.char || 'blank'}-${rowIndex}`" class="pinyin-stroke-practice-row">
                <div class="pinyin-stroke-row">
                  <div
                    v-for="(cell, cellIndex) in row.cells"
                    :key="cellIndex"
                    class="pinyin-stroke-cell"
                  >
                    <div class="pinyin-box">
                      <span :class="['pinyin-char', cell.mode === 'sample' ? 'sample' : 'trace', { blank: cell.mode === 'blank' }]">
                        {{ cell.pinyin }}
                      </span>
                    </div>
                    <div class="tianzi-box">
                      <!-- sample: full black character -->
                      <template v-if="cell.mode === 'sample'">
                        <svg
                          v-if="cell.char && getStrokeData(cell.char)?.strokes.length"
                          class="stroke-char-svg sample"
                          :viewBox="strokeSvgViewBox"
                          aria-hidden="true"
                        >
                          <g :transform="strokeSvgTransform">
                            <path
                              v-for="(path, pathIndex) in getStrokeData(cell.char)?.strokes"
                              :key="pathIndex"
                              :d="path"
                            />
                          </g>
                        </svg>
                        <span v-else class="stroke-char sample">{{ cell.char }}</span>
                      </template>

                      <!-- stroke-step: step-by-step building character -->
                      <template v-else-if="cell.mode === 'stroke-step'">
                        <svg
                          v-if="cell.char && getStrokeData(cell.char)?.strokes.length"
                          class="stroke-char-svg step"
                          :viewBox="strokeSvgViewBox"
                          aria-hidden="true"
                        >
                          <g :transform="strokeSvgTransform">
                            <path
                              v-for="(path, pathIndex) in getStrokeData(cell.char)?.strokes.slice(0, cell.stepIndex + 1)"
                              :key="pathIndex"
                              :d="path"
                              :class="{ current: pathIndex === cell.stepIndex }"
                            />
                          </g>
                        </svg>
                      </template>

                      <!-- trace: full grey character -->
                      <template v-else-if="cell.mode === 'trace'">
                        <svg
                          v-if="cell.char && getStrokeData(cell.char)?.strokes.length"
                          class="stroke-char-svg trace"
                          :viewBox="strokeSvgViewBox"
                          aria-hidden="true"
                        >
                          <g :transform="strokeSvgTransform">
                            <path
                              v-for="(path, pathIndex) in getStrokeData(cell.char)?.strokes"
                              :key="pathIndex"
                              :d="path"
                            />
                          </g>
                        </svg>
                        <span v-else class="stroke-char trace">{{ cell.char }}</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
          </div>
        </template>

        <div v-else-if="isFourLineSquare" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="four-line-square-sheet">
            <div v-for="row in 12" :key="row" class="four-line-square-row">
              <div class="practice-line four-line-band">
              </div>
              <div class="square-band">
                <span v-for="cell in 15" :key="cell" class="square-cell"></span>
              </div>
            </div>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>

        <div v-else-if="isPinyinPaper" class="paper-container">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="pinyin-paper-sheet">
            <div v-for="row in 19" :key="row" class="practice-line pinyin-paper-line">
            </div>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>

        <div v-else-if="isComposition" class="paper-container composition-paper">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div class="composition-title-line">题目：________________________________________</div>
          <div class="composition-grid">
            <span v-for="cell in 500" :key="cell" class="composition-cell"></span>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>

        <div v-else-if="isCornellNote" class="paper-container cornell-paper">
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>主题：____________________</span>
            </div>
          </div>

          <div class="cornell-sheet">
            <div class="cornell-main">
              <div class="cornell-cues">
                <div class="cornell-label">线索</div>
                <span v-for="line in 22" :key="line" class="cornell-line"></span>
              </div>
              <div class="cornell-notes">
                <div class="cornell-label">笔记</div>
                <span v-for="line in 22" :key="line" class="cornell-line"></span>
              </div>
            </div>
            <div class="cornell-summary">
              <div class="cornell-label">总结</div>
              <span v-for="line in 5" :key="line" class="cornell-line"></span>
            </div>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>

        <div
          v-for="(page, pageIndex) in pinyinPages"
          v-else
          :key="pageIndex"
          :class="['paper-container', { 'has-next-page': pageIndex < pinyinPages.length - 1 }]"
        >
          <div class="paper-header">
            <h2>{{ paperTitle }}</h2>
            <div class="paper-info">
              <span>姓名：__________</span>
              <span>日期：__________</span>
              <span>用时：__________</span>
            </div>
          </div>

          <div :class="['pinyin-sheet', { paired: isPairedPinyin }]">
            <div v-for="row in page" :key="row.join('-')" class="pinyin-row">
              <div v-for="item in row" :key="item" class="pinyin-practice">
                <div class="pinyin-line">
                  <span
                    v-for="line in 6"
                    :key="`divider-${line}`"
                    class="pinyin-divider"
                    :style="{ left: `${(line / 7) * 100}%` }"
                  ></span>
                  <span
                    v-for="copy in 7"
                    :key="copy"
                    :class="['pinyin-text', { trace: copy > 1 && copy <= 4, blank: copy > 4 }]"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chinese-container {
  display: flex;
  gap: 24px;
  height: 100%;
}
.settings-panel {
  width: 320px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  overflow-y: auto;
}
.preview-panel {
  position: relative;
  flex-grow: 1;
  background: #f0f2f5;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 24px;
}
.generation-loading {
  position: absolute;
  inset: 24px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(240, 242, 245, 0.82);
  color: #2f7d46;
  font-weight: 700;
  pointer-events: none;
}
.paper-stack {
  display: grid;
  gap: 24px;
}
.paper-stack.exporting {
  gap: 0;
}
.paper-container {
  width: 210mm;
  height: 296mm;
  box-sizing: border-box;
  background: white;
  padding: 15mm;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 4px;
}
.paper-stack.exporting .paper-container {
  height: 296mm;
  min-height: 0;
  box-shadow: none;
  border-radius: 0;
  overflow: hidden;
}
.paper-stack.exporting .paper-container.has-next-page {
  break-after: page;
  page-break-after: always;
}
.paper-header h2 {
  text-align: center;
  font-size: 24px;
  font-family: "Kaiti", "STKaiti", serif;
  line-height: 1.2;
  margin: 0 0 6mm;
}
.paper-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6mm;
  font-size: 14px;
  line-height: 1.3;
}
.input-tip {
  margin-top: 6px;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}
.tianzi-sheet {
  display: grid;
  gap: 3.2mm;
  padding-top: 2mm;
}
.tianzi-row {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  width: 180mm;
  height: 12mm;
}
.split-tianzi-row {
  display: flex;
  justify-content: space-between;
  width: 180mm;
  height: 12mm;
}
.tianzi-block {
  display: grid;
  grid-template-columns: repeat(7, 12mm);
  width: 84mm;
  height: 12mm;
}
.tianzi-cell {
  position: relative;
  box-sizing: border-box;
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.tianzi-cell:first-child {
  border-left: 1px solid #333;
}
.tianzi-cell::before,
.tianzi-cell::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.tianzi-cell::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.tianzi-cell::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.radical-char-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Kaiti", "STKaiti", "PingFang SC", "Microsoft YaHei", "Source Han Sans CN", sans-serif;
  font-size: 28px;
  color: #111;
  z-index: 1;
}
.pinyin-sheet {
  display: grid;
  gap: 6.4mm;
}
.pinyin-sheet:not(.paired) {
  gap: 3.8mm;
}
.pinyin-row {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
}
.pinyin-sheet.paired .pinyin-row {
  grid-template-columns: 1fr 1fr;
  column-gap: 11mm;
}
.pinyin-practice {
  min-width: 0;
}
.pinyin-sheet.paired .pinyin-practice {
  min-width: 0;
}
.pinyin-line {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
  height: 10.5mm;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}
.pinyin-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 33.333%;
  width: 100%;
  border-top: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-line::after {
  content: "";
  position: absolute;
  left: 0;
  top: 66.666%;
  width: 100%;
  border-top: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-divider {
  position: absolute;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-text {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: "Andika", "Kaiti", "STKaiti", serif;
  font-size: 28px;
  line-height: 1;
  color: #333;
  transform: translateY(-3px);
}
.pinyin-text.trace {
  color: rgba(40, 40, 40, 0.32);
}
.pinyin-text.blank {
  visibility: hidden;
}
.stroke-sheet {
  display: grid;
  align-content: space-between;
  height: 231mm;
  gap: 2.8mm;
  padding-top: 1mm;
}
.stroke-practice-row {
  display: grid;
  grid-template-rows: 6.2mm 12mm;
}
.stroke-order-guide {
  display: flex;
  align-items: center;
  gap: 1.2mm;
  width: 180mm;
  height: 6.2mm;
  box-sizing: border-box;
  border: 1px solid #8fb3cf;
  border-bottom: 0;
  padding: 0 2mm;
  overflow: hidden;
  color: #333;
  font-family: "Kaiti", "STKaiti", serif;
  font-size: 14px;
  line-height: 1;
}
.stroke-order-label {
  flex: 0 0 auto;
}
.stroke-order-status {
  color: #777;
  font-size: 12px;
}
.stroke-step-svg {
  width: 5.2mm;
  height: 5.2mm;
  flex: 0 0 auto;
}
.stroke-step-svg path {
  fill: #222;
}
.stroke-step-svg path.current {
  fill: #c93b3b;
}
.stroke-count {
  margin-left: auto;
  flex: 0 0 auto;
  font-size: 14px;
  color: #222;
}
.stroke-row {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  justify-content: center;
}
.pinyin-stroke-sheet {
  display: grid;
  align-content: space-between;
  height: 231mm;
  gap: 2.8mm;
  padding-top: 1mm;
}
.pinyin-stroke-practice-row {
  display: block;
  height: 18mm;
}
.pinyin-stroke-row {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  justify-content: center;
}
.pinyin-stroke-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 12mm;
  height: 18mm;
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.pinyin-stroke-cell:first-child {
  border-left: 1px solid #333;
}
.pinyin-box {
  position: relative;
  height: 6mm;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #333;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pinyin-box::before {
  content: "";
  position: absolute;
  left: 0;
  top: 33.333%;
  width: 100%;
  border-top: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-box::after {
  content: "";
  position: absolute;
  left: 0;
  top: 66.666%;
  width: 100%;
  border-top: 1px dashed #aaa;
  pointer-events: none;
}
.pinyin-char {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: "Andika", "Kaiti", "STKaiti", serif;
  font-size: 16px;
  line-height: 1;
  color: #333;
  transform: translateY(-2px);
}
.pinyin-char.trace {
  color: rgba(40, 40, 40, 0.32);
}
.pinyin-char.blank {
  visibility: hidden;
}
.tianzi-box {
  position: relative;
  height: 12mm;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tianzi-box::before,
.tianzi-box::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.tianzi-box::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.tianzi-box::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.stroke-char-svg.step path {
  fill: rgba(100, 110, 125, 0.32);
}
.stroke-char-svg.step path.current {
  fill: #c93b3b;
}
.stroke-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 12mm;
  height: 12mm;
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.stroke-cell:first-child {
  border-left: 1px solid #333;
}
.stroke-cell::before,
.stroke-cell::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.stroke-cell::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.stroke-cell::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.stroke-char {
  position: relative;
  z-index: 1;
  font-family: "Kaiti", "STKaiti", serif;
  font-size: 28px;
  line-height: 1;
  color: #111;
}
.stroke-char.trace {
  color: rgba(100, 110, 125, 0.35);
}
.stroke-char-svg {
  position: relative;
  z-index: 1;
  width: 10.2mm;
  height: 10.2mm;
}
.stroke-char-svg path {
  fill: currentColor;
}
.stroke-char-svg.sample {
  color: #111;
}
.stroke-char-svg.trace {
  color: rgba(100, 110, 125, 0.32);
}
.four-line-square-sheet {
  display: grid;
  gap: 2.55mm;
  padding-top: 1mm;
}
.four-line-square-row {
  display: grid;
  width: 180mm;
  height: 17mm;
  grid-template-rows: 6.5mm 10.5mm;
}
.practice-line {
  position: relative;
  box-sizing: border-box;
  width: 180mm;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
}
.practice-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 33.333%;
  width: 100%;
  border-top: 1px dashed #999;
  pointer-events: none;
}
.practice-line::after {
  content: "";
  position: absolute;
  left: 0;
  top: 66.666%;
  width: 100%;
  border-top: 1px dashed #999;
  pointer-events: none;
}
.four-line-band {
  height: 6.5mm;
}
.practice-divider {
  position: absolute;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
  pointer-events: none;
}
.square-band {
  display: grid;
  grid-template-columns: repeat(15, 12mm);
  width: 180mm;
  height: 10.5mm;
}
.square-cell {
  position: relative;
  box-sizing: border-box;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.square-cell:first-child {
  border-left: 1px solid #333;
}
.square-cell::before,
.square-cell::after {
  content: "";
  position: absolute;
  pointer-events: none;
}
.square-cell::before {
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px dashed #aaa;
}
.square-cell::after {
  left: 0;
  top: 50%;
  width: 100%;
  border-top: 1px dashed #aaa;
}
.pinyin-paper-sheet {
  display: grid;
  gap: 3.5mm;
  padding-top: 2mm;
}
.pinyin-paper-line {
  height: 8.6mm;
}
.composition-paper .paper-info {
  margin-bottom: 14px;
}
.composition-title-line {
  width: 180mm;
  margin-bottom: 5mm;
  font-family: "Kaiti", "STKaiti", serif;
  font-size: 18px;
  line-height: 10mm;
}
.composition-grid {
  display: grid;
  grid-template-columns: repeat(20, 9mm);
  grid-template-rows: repeat(25, 9mm);
  width: 180mm;
  height: 225mm;
}
.composition-cell {
  box-sizing: border-box;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
}
.composition-cell:nth-child(-n + 20) {
  border-top: 1px solid #333;
}
.composition-cell:nth-child(20n + 1) {
  border-left: 1px solid #333;
}
.cornell-paper .paper-info {
  margin-bottom: 14px;
}
.cornell-sheet {
  width: 180mm;
  height: 225mm;
  border: 1px solid #333;
  box-sizing: border-box;
}
.cornell-main {
  display: grid;
  grid-template-columns: 45mm 1fr;
  height: 178mm;
  border-bottom: 1px solid #333;
}
.cornell-cues,
.cornell-notes,
.cornell-summary {
  position: relative;
  box-sizing: border-box;
  padding: 7mm 5mm 4mm;
}
.cornell-cues {
  border-right: 1px solid #333;
}
.cornell-label {
  height: 8mm;
  color: #333;
  font-size: 15px;
  font-family: "Kaiti", "STKaiti", serif;
  line-height: 8mm;
}
.cornell-line {
  display: block;
  height: 7mm;
  border-bottom: 1px solid #999;
}
.cornell-summary {
  height: 47mm;
  padding-top: 4mm;
  padding-bottom: 4mm;
}
.cornell-summary .cornell-label {
  height: 6.5mm;
  line-height: 6.5mm;
}
.cornell-summary .cornell-line {
  height: 6.4mm;
}

@media (max-width: 768px) {
  .chinese-container {
    width: 100%;
    flex-direction: column;
    gap: 12px;
    height: auto;
    min-width: 0;
    overflow: visible;
    padding-bottom: 12px;
  }

  .settings-panel {
    width: 100%;
    flex-shrink: 0;
    overflow: visible;
  }

  .settings-panel :deep(.ant-card-head) {
    min-height: 44px;
    padding: 0 16px;
  }

  .settings-panel :deep(.ant-card-body) {
    padding: 16px;
  }

  .preview-panel {
    flex: 0 0 auto;
    min-width: 0;
    min-height: 430px;
    padding: 12px;
    overflow: hidden;
    justify-content: center;
    align-items: flex-start;
  }

  .paper-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .paper-container {
    flex: 0 0 auto;
    --zoom-factor: 0.43;
    transform: scale(var(--zoom-factor));
    transform-origin: top left;
    margin-right: calc(-210mm * (1 - var(--zoom-factor)));
    margin-bottom: calc(-296mm * (1 - var(--zoom-factor)));
    border-radius: 6px;
  }

  .paper-info {
    gap: 8px 16px;
    flex-wrap: wrap;
  }
}

@media (min-width: 430px) and (max-width: 768px) {
  .paper-container {
    --zoom-factor: 0.5;
  }
}

@media (min-width: 560px) and (max-width: 768px) {
  .paper-container {
    --zoom-factor: 0.65;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  .no-print {
    display: none !important;
  }
  .chinese-container {
    display: block;
    gap: 0;
  }
  .print-full-width {
    padding: 0 !important;
    background: transparent !important;
    display: block;
    overflow: visible !important;
    border-radius: 0 !important;
  }
  .paper-stack {
    display: block !important;
    gap: 0 !important;
  }
  .paper-container {
    transform: none !important;
    zoom: 1 !important;
    box-shadow: none !important;
    width: 210mm !important;
    height: 296mm !important;
    min-height: 0 !important;
    padding: 15mm !important;
    margin: 0 auto !important;
    overflow: hidden !important;
    break-after: auto;
    page-break-after: auto;
  }
  .paper-container.has-next-page {
    break-after: page;
    page-break-after: always;
  }
}
</style>
