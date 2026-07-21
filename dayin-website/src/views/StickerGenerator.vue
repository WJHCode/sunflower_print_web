<script setup lang="ts">
import { computed, ref } from 'vue';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '../utils/print';
import { useI18n } from '@/i18n';
import { useExportLoading } from '../composables/useExportLoading';

const { t } = useI18n();
const { isPdfLoading, isImageLoading, runExport } = useExportLoading();

type StickerSize = 'large' | 'medium' | 'small';
type StickerShape = 'none' | 'rounded' | 'circle' | 'cloud';
type StickerPalette = 'candy' | 'sunny' | 'ocean' | 'garden';
type StickerFont = 'rounded' | 'hand' | 'bold';

type StickerItem = {
  text: string;
  color: string;
  accent: string;
  background: string;
};

const stickerText = ref('māo\napple\nA\n生日快乐\nzhōng guó\nHello');
const stickerSize = ref<StickerSize>('medium');
const stickerShape = ref<StickerShape>('rounded');
const stickerPalette = ref<StickerPalette>('candy');
const stickerFont = ref<StickerFont>('rounded');
const showCutLine = ref(true);
const showDecorations = ref(true);
const strokeWidth = ref(9);

const sizeOptions: Record<StickerSize, { labelKey: string; columns: number; rows: number; fontBase: number }> = {
  large: { labelKey: 'options.largeSticker', columns: 2, rows: 4, fontBase: 48 },
  medium: { labelKey: 'options.mediumSticker', columns: 3, rows: 5, fontBase: 38 },
  small: { labelKey: 'options.smallSticker', columns: 4, rows: 6, fontBase: 29 },
};

const paletteColors: Record<StickerPalette, Array<{ color: string; accent: string; background: string }>> = {
  candy: [
    { color: '#ff6f9f', accent: '#ffd166', background: '#fff0f6' },
    { color: '#55b6ff', accent: '#ff9f1c', background: '#eef8ff' },
    { color: '#7c6cff', accent: '#7bdff2', background: '#f2f0ff' },
    { color: '#18a999', accent: '#ffcf56', background: '#ebfbf6' },
  ],
  sunny: [
    { color: '#f6a400', accent: '#ef476f', background: '#fff7d6' },
    { color: '#f15bb5', accent: '#fee440', background: '#fff0fa' },
    { color: '#2a9d8f', accent: '#f4a261', background: '#ecfbf6' },
    { color: '#e76f51', accent: '#8ecae6', background: '#fff1eb' },
  ],
  ocean: [
    { color: '#168aad', accent: '#80ffdb', background: '#e8f9ff' },
    { color: '#4361ee', accent: '#4cc9f0', background: '#eef2ff' },
    { color: '#00a6a6', accent: '#ffd166', background: '#e9fbfa' },
    { color: '#277da1', accent: '#f9c74f', background: '#edf8fd' },
  ],
  garden: [
    { color: '#2f9e44', accent: '#ffd43b', background: '#effbea' },
    { color: '#74b816', accent: '#ff8787', background: '#f4fce3' },
    { color: '#12b886', accent: '#ffa94d', background: '#e6fcf5' },
    { color: '#5c940d', accent: '#91a7ff', background: '#f4fce3' },
  ],
};

const fontFamilies: Record<StickerFont, string> = {
  rounded: '"Arial Rounded MT Bold", "Trebuchet MS", "Microsoft YaHei", sans-serif',
  hand: '"Comic Sans MS", "Andika", "Kaiti", "STKaiti", cursive',
  bold: 'Impact, "Arial Black", "Microsoft YaHei", sans-serif',
};

const paperTitle = computed(() => t('home.categories.sticker.title'));
const activeSize = computed(() => sizeOptions[stickerSize.value]);
const stickersPerPage = computed(() => activeSize.value.columns * activeSize.value.rows);

const rawItems = computed(() =>
  stickerText.value
    .split(/[\n,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 72)
);

const stickerItems = computed<StickerItem[]>(() => {
  const colors = paletteColors[stickerPalette.value];
  return rawItems.value.map((text, index) => {
    const tone = colors[index % colors.length];
    return { text, ...tone };
  });
});

const stickerPages = computed(() => {
  const pages: StickerItem[][] = [];
  const pageSize = stickersPerPage.value;
  for (let i = 0; i < stickerItems.value.length; i += pageSize) {
    pages.push(stickerItems.value.slice(i, i + pageSize));
  }
  if (!pages.length) pages.push([]);
  return pages.map((page) => {
    const padded = [...page];
    while (padded.length < pageSize) {
      padded.push({ text: '', color: '#d9d9d9', accent: '#f0f0f0', background: '#ffffff' });
    }
    return padded;
  });
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${activeSize.value.columns}, 1fr)`,
  gridTemplateRows: `repeat(${activeSize.value.rows}, 1fr)`,
}));

const splitStickerLines = (text: string) => {
  if (text.length <= 7) return [text];
  const normalized = text.replace(/\s+/g, ' ');
  if (normalized.includes(' ')) {
    const parts = normalized.split(' ');
    if (parts.length <= 3) return parts;
  }
  const size = text.length > 12 ? Math.ceil(text.length / 3) : Math.ceil(text.length / 2);
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    lines.push(text.slice(i, i + size));
  }
  return lines.slice(0, 3);
};

const fontSizeFor = (text: string) => {
  const lines = splitStickerLines(text);
  const longest = Math.max(...lines.map((line) => line.length), 1);
  const base = activeSize.value.fontBase;
  if (longest <= 2) return base * 1.28;
  if (longest <= 4) return base * 1.08;
  if (longest <= 7) return base * 0.9;
  return base * 0.72;
};

const textY = (lineCount: number, index: number) => {
  if (lineCount === 1) return 88;
  if (lineCount === 2) return 72 + index * 38;
  return 58 + index * 32;
};

const printPaper = () => {
  printElement('sticker-printable-paper', paperTitle.value, { pagebreak: true });
};

const downloadPDF = async () => {
  const element = document.getElementById('sticker-printable-paper');
  if (!element) return;
  await runExport('pdf', () => savePdfFromElement(element, `${paperTitle.value}.pdf`, { pagebreak: true }));
};

const downloadImage = async () => {
  const element = document.getElementById('sticker-printable-paper');
  if (!element) return;
  await runExport('image', () => saveImageFromElement(element, `${paperTitle.value}.png`, { pagebreak: true }));
};
</script>

<template>
  <div class="sticker-container">
    <a-card class="settings-panel no-print" :bordered="false" :title="t('common.settings')">
      <a-form layout="vertical">
        <a-form-item :label="t('generatorSettings.stickerText')">
          <a-textarea
            v-model:value="stickerText"
            :rows="8"
            :maxlength="720"
            :placeholder="t('generatorSettings.stickerTextPlaceholder')"
            show-count
          />
          <div class="form-hint">{{ t('generatorSettings.stickerCount', { count: rawItems.length }) }}</div>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.stickerSize')">
          <a-select v-model:value="stickerSize">
            <a-select-option value="large">{{ t('options.largeSticker') }}</a-select-option>
            <a-select-option value="medium">{{ t('options.mediumSticker') }}</a-select-option>
            <a-select-option value="small">{{ t('options.smallSticker') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.stickerShape')">
          <a-radio-group v-model:value="stickerShape" button-style="solid">
            <a-radio-button value="rounded">{{ t('options.rounded') }}</a-radio-button>
            <a-radio-button value="circle">{{ t('options.circle') }}</a-radio-button>
            <a-radio-button value="cloud">{{ t('options.cloud') }}</a-radio-button>
            <a-radio-button value="none">{{ t('options.none') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.stickerFont')">
          <a-select v-model:value="stickerFont">
            <a-select-option value="rounded">{{ t('options.roundedFont') }}</a-select-option>
            <a-select-option value="hand">{{ t('options.handFont') }}</a-select-option>
            <a-select-option value="bold">{{ t('options.boldFont') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.palette')">
          <a-select v-model:value="stickerPalette">
            <a-select-option value="candy">{{ t('options.candy') }}</a-select-option>
            <a-select-option value="sunny">{{ t('options.sunny') }}</a-select-option>
            <a-select-option value="ocean">{{ t('options.ocean') }}</a-select-option>
            <a-select-option value="garden">{{ t('options.garden') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.strokeWidth')">
          <a-slider v-model:value="strokeWidth" :min="4" :max="16" />
        </a-form-item>

        <a-form-item :label="t('generatorSettings.printAssist')">
          <div class="switch-row">
            <span>{{ t('generatorSettings.cutLine') }}</span>
            <a-switch v-model:checked="showCutLine" />
          </div>
          <div class="switch-row">
            <span>{{ t('generatorSettings.decorations') }}</span>
            <a-switch v-model:checked="showDecorations" />
          </div>
        </a-form-item>

        <a-divider />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="printPaper">
            <template #icon><PrinterOutlined /></template>
            {{ t('common.print') }}
          </a-button>
          <div class="export-buttons">
            <a-button block size="large" :loading="isPdfLoading" :disabled="isImageLoading" @click="downloadPDF">
              <template #icon><DownloadOutlined /></template>
              {{ isPdfLoading ? t('common.processing') : t('common.downloadPdf') }}
            </a-button>
            <a-button block size="large" :loading="isImageLoading" :disabled="isPdfLoading" @click="downloadImage">
              <template #icon><DownloadOutlined /></template>
              {{ isImageLoading ? t('common.processing') : t('common.downloadImage') }}
            </a-button>
          </div>
        </div>
      </a-form>
    </a-card>

    <div class="preview-panel print-full-width">
      <div class="paper-stack" id="sticker-printable-paper">
        <div
          v-for="(page, pageIndex) in stickerPages"
          :key="pageIndex"
          class="paper-container"
          :class="{ 'has-next-page': pageIndex < stickerPages.length - 1 }"
        >
          <div class="paper-heading">
            <h2>{{ paperTitle }}</h2>
            <span>{{ t(sizeOptions[stickerSize].labelKey) }}</span>
          </div>

          <div class="sticker-grid" :style="gridStyle">
            <div
              v-for="(item, index) in page"
              :key="`${item.text}-${index}`"
              class="sticker-cell"
              :class="{ 'with-cut-line': showCutLine, empty: !item.text }"
            >
              <svg
                v-if="item.text"
                class="sticker-svg"
                viewBox="0 0 260 160"
                role="img"
                :aria-label="item.text"
              >
                <defs>
                  <filter :id="`shadow-${pageIndex}-${index}`" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="3" flood-color="#000000" flood-opacity="0.16" />
                  </filter>
                </defs>

                <rect
                  v-if="stickerShape === 'rounded'"
                  x="16"
                  y="20"
                  width="228"
                  height="120"
                  rx="34"
                  :fill="item.background"
                  :stroke="item.accent"
                  stroke-width="5"
                  :filter="`url(#shadow-${pageIndex}-${index})`"
                />
                <circle
                  v-else-if="stickerShape === 'circle'"
                  cx="130"
                  cy="80"
                  r="66"
                  :fill="item.background"
                  :stroke="item.accent"
                  stroke-width="5"
                  :filter="`url(#shadow-${pageIndex}-${index})`"
                />
                <path
                  v-else-if="stickerShape === 'cloud'"
                  d="M58 126c-24 0-42-16-42-36 0-17 13-31 31-35 8-24 32-39 59-33 13-15 37-18 55-6 12 8 19 20 20 33 32 2 56 19 56 41 0 21-20 36-46 36H58z"
                  :fill="item.background"
                  :stroke="item.accent"
                  stroke-width="5"
                  :filter="`url(#shadow-${pageIndex}-${index})`"
                />

                <g v-if="showDecorations">
                  <circle cx="44" cy="39" r="8" :fill="item.accent" opacity="0.9" />
                  <circle cx="218" cy="119" r="7" :fill="item.accent" opacity="0.75" />
                  <path d="M216 36l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" :fill="item.accent" opacity="0.82" />
                  <path d="M52 115c-9-8-15-14-15-22 0-7 5-12 12-12 4 0 8 2 10 6 2-4 6-6 10-6 7 0 12 5 12 12 0 8-6 14-15 22l-7 6z" :fill="item.accent" opacity="0.72" />
                </g>

                <text
                  v-for="(line, lineIndex) in splitStickerLines(item.text)"
                  :key="`${line}-${lineIndex}`"
                  x="130"
                  :y="textY(splitStickerLines(item.text).length, lineIndex)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  :font-family="fontFamilies[stickerFont]"
                  :font-size="fontSizeFor(item.text)"
                  font-weight="900"
                  letter-spacing="0"
                  :fill="item.color"
                  stroke="#ffffff"
                  :stroke-width="strokeWidth"
                  stroke-linejoin="round"
                  paint-order="stroke fill"
                >
                  {{ line }}
                </text>
              </svg>
            </div>
          </div>

          <div class="paper-footer">向日葵打印　https://sunflower.ccwu.cc</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sticker-container {
  display: flex;
  gap: 24px;
  height: 100%;
}

.settings-panel {
  width: 330px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  overflow-y: auto;
}

.form-hint {
  margin-top: 6px;
  color: #8c8c8c;
  font-size: 12px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  color: #4b5b4d;
}

.preview-panel {
  flex-grow: 1;
  background: #f0f2f5;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  padding: 24px;
}

.paper-stack {
  display: grid;
  gap: 24px;
}

.paper-stack.exporting {
  gap: 0;
}

.paper-container {
  position: relative;
  width: 210mm;
  height: 296mm;
  box-sizing: border-box;
  background: #fffdf8;
  padding: 12mm 13mm 14mm;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.paper-stack.exporting .paper-container {
  height: 296mm;
  min-height: 0;
  box-shadow: none;
  border-radius: 0;
}

.paper-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 13mm;
  margin-bottom: 7mm;
  border-bottom: 1px solid #f0dca8;
}

.paper-heading h2 {
  margin: 0;
  color: #233126;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: 0;
}

.paper-heading span {
  color: #7c6b45;
  font-size: 13px;
  line-height: 2;
}

.sticker-grid {
  display: grid;
  gap: 4mm;
  width: 184mm;
  height: 241mm;
}

.sticker-cell {
  min-width: 0;
  min-height: 0;
  border-radius: 4mm;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  forced-color-adjust: none;
}

.sticker-cell.with-cut-line {
  outline: 1px dashed #d8d0bd;
  outline-offset: -1px;
}

.sticker-cell.empty {
  outline-color: transparent;
}

.sticker-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  forced-color-adjust: none;
}

@media (max-width: 768px) {
  .sticker-container {
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

  .sticker-container {
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
    margin: 0 auto !important;
    overflow: hidden !important;
    border-radius: 0 !important;
    break-after: auto;
    page-break-after: auto;
  }

  .sticker-cell,
  .sticker-svg {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    forced-color-adjust: none !important;
  }
}
</style>
