<script setup lang="ts">
import { computed, ref } from 'vue';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '@/utils/print';
import { useExportLoading } from '@/composables/useExportLoading';
import { useI18n } from '@/i18n';

type BackgroundType = 'solid' | 'dots' | 'grid' | 'waves' | 'flowers';
type FontFamily = 'rounded' | 'serif' | 'handwritten' | 'bold';

const { t } = useI18n();
const { isPdfLoading, isImageLoading, runExport } = useExportLoading();

const formState = ref({
  name: '王小明',
  backgroundType: 'flowers' as BackgroundType,
  backgroundColor: '#78B99C',
  patternColor: '#DFF1D8',
  textColor: '#214939',
  strokeWidth: 3,
  fontSize: 76,
  fontFamily: 'rounded' as FontFamily,
});

const backgroundImage = computed(() => {
  const { backgroundType, patternColor } = formState.value;
  const soft = `${patternColor}B8`;

  if (backgroundType === 'dots') {
    return `radial-gradient(circle, ${patternColor} 2.1mm, transparent 2.2mm)`;
  }
  if (backgroundType === 'grid') {
    return `linear-gradient(${soft} 1px, transparent 1px), linear-gradient(90deg, ${soft} 1px, transparent 1px)`;
  }
  if (backgroundType === 'waves') {
    return `radial-gradient(ellipse 12mm 5mm at 50% 0%, transparent 62%, ${soft} 63% 70%, transparent 71%)`;
  }
  if (backgroundType === 'flowers') {
    return `radial-gradient(circle at 50% 24%, ${patternColor} 0 1.35mm, transparent 1.45mm), radial-gradient(ellipse 1.9mm 4.2mm at 50% 0%, ${soft} 0 96%, transparent 100%), radial-gradient(ellipse 1.9mm 4.2mm at 50% 100%, ${soft} 0 96%, transparent 100%), radial-gradient(ellipse 4.2mm 1.9mm at 0% 50%, ${soft} 0 96%, transparent 100%), radial-gradient(ellipse 4.2mm 1.9mm at 100% 50%, ${soft} 0 96%, transparent 100%)`;
  }
  return 'none';
});

const backgroundSize = computed(() => {
  if (formState.value.backgroundType === 'dots') return '10mm 10mm';
  if (formState.value.backgroundType === 'grid') return '8mm 8mm';
  if (formState.value.backgroundType === 'flowers') return '16mm 16mm';
  if (formState.value.backgroundType === 'waves') return '24mm 12mm';
  return 'auto';
});

const faceStyle = computed(() => ({
  '--card-background': formState.value.backgroundColor,
  '--pattern-image': backgroundImage.value,
  '--pattern-size': backgroundSize.value,
  '--name-color': formState.value.textColor,
  '--stroke-width': `${formState.value.strokeWidth}px`,
  '--name-size': `${formState.value.fontSize}px`,
}));

const fontClass = computed(() => `font-${formState.value.fontFamily}`);
const displayName = computed(() => formState.value.name.trim() || t('nameCard.namePlaceholder'));
const paperTitle = computed(() => `${displayName.value}${t('nameCard.fileSuffix')}`);

const printPaper = () => printElement('printable-name-card', paperTitle.value);
const downloadPDF = async () => {
  const element = document.getElementById('printable-name-card');
  if (element) await runExport('pdf', () => savePdfFromElement(element, `${paperTitle.value}.pdf`));
};
const downloadImage = async () => {
  const element = document.getElementById('printable-name-card');
  if (element) await runExport('image', () => saveImageFromElement(element, `${paperTitle.value}.png`));
};
</script>

<template>
  <div class="name-card-generator">
    <a-card class="settings-panel no-print" :bordered="false" :title="t('nameCard.settingsTitle')">
      <a-form layout="vertical" :model="formState">
        <a-form-item :label="t('nameCard.name')">
          <a-input v-model:value="formState.name" :maxlength="14" :placeholder="t('nameCard.namePlaceholder')" />
        </a-form-item>

        <a-form-item :label="t('nameCard.backgroundType')">
          <a-select v-model:value="formState.backgroundType">
            <a-select-option value="solid">{{ t('nameCard.backgroundTypes.solid') }}</a-select-option>
            <a-select-option value="flowers">{{ t('nameCard.backgroundTypes.flowers') }}</a-select-option>
            <a-select-option value="dots">{{ t('nameCard.backgroundTypes.dots') }}</a-select-option>
            <a-select-option value="grid">{{ t('nameCard.backgroundTypes.grid') }}</a-select-option>
            <a-select-option value="waves">{{ t('nameCard.backgroundTypes.waves') }}</a-select-option>
          </a-select>
        </a-form-item>

        <div class="color-row">
          <a-form-item :label="t('nameCard.backgroundColor')">
            <label class="color-control"><input v-model="formState.backgroundColor" type="color" /><a-input v-model:value="formState.backgroundColor" /></label>
          </a-form-item>
          <a-form-item v-if="formState.backgroundType !== 'solid'" :label="t('nameCard.patternColor')">
            <label class="color-control"><input v-model="formState.patternColor" type="color" /><a-input v-model:value="formState.patternColor" /></label>
          </a-form-item>
        </div>

        <a-divider />
        <a-form-item :label="t('nameCard.textColor')">
          <label class="color-control"><input v-model="formState.textColor" type="color" /><a-input v-model:value="formState.textColor" /></label>
        </a-form-item>
        <a-form-item :label="t('nameCard.font')">
          <a-select v-model:value="formState.fontFamily">
            <a-select-option value="rounded">{{ t('nameCard.fonts.rounded') }}</a-select-option>
            <a-select-option value="bold">{{ t('nameCard.fonts.bold') }}</a-select-option>
            <a-select-option value="serif">{{ t('nameCard.fonts.serif') }}</a-select-option>
            <a-select-option value="handwritten">{{ t('nameCard.fonts.handwritten') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('nameCard.fontSize')">
          <a-slider v-model:value="formState.fontSize" :min="36" :max="112" :step="1" />
        </a-form-item>
        <a-form-item :label="t('generatorSettings.strokeWidth')">
          <a-slider v-model:value="formState.strokeWidth" :min="0" :max="8" :step="0.5" />
        </a-form-item>

        <p class="folding-hint">{{ t('nameCard.foldingHint') }}</p>
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
      <article id="printable-name-card" class="name-card-paper" :style="faceStyle">
        <section class="name-card-face inverted-face" :class="fontClass">
          <div class="face-inner">
            <h1>{{ displayName }}</h1>
          </div>
        </section>
        <div class="fold-line" aria-label="fold line"><span>{{ t('nameCard.foldLine') }}</span></div>
        <section class="name-card-face" :class="fontClass">
          <div class="face-inner">
            <h1>{{ displayName }}</h1>
          </div>
        </section>
      </article>
    </div>
  </div>
</template>

<style scoped>
.name-card-generator { display: flex; gap: 24px; height: 100%; }
.settings-panel { width: 320px; flex: 0 0 320px; overflow-y: auto; background: #fffdf7; border-radius: 8px; box-shadow: 0 12px 30px rgba(60, 54, 38, .08); }
.color-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.color-row :deep(.ant-form-item) { min-width: 0; }.color-control { display: flex; align-items: center; gap: 8px; }.color-control > input[type='color'] { flex: 0 0 30px; width: 30px; height: 30px; padding: 2px; border: 1px solid #d9d9d9; border-radius: 5px; cursor: pointer; }.color-control :deep(.ant-input) { min-width: 0; padding-inline: 6px; font-size: 12px; }
.folding-hint { margin: 18px 0 14px; padding: 10px 12px; color: #536056; font-size: 13px; line-height: 1.65; background: #f3f7f0; border-radius: 7px; }
.action-buttons, .export-buttons { display: grid; gap: 10px; }.export-buttons { grid-template-columns: 1fr 1fr; }
.preview-panel { flex: 1; min-width: 0; overflow: auto; display: flex; justify-content: center; padding: 24px; border-radius: 8px; background: #eee8dc; }
.name-card-paper { position: relative; flex: 0 0 auto; width: 210mm; height: 296mm; overflow: hidden; background: #fff; box-shadow: 0 18px 44px rgba(60, 54, 38, .16); print-color-adjust: exact; -webkit-print-color-adjust: exact; }
.name-card-face { position: relative; height: 148mm; overflow: hidden; background-color: var(--card-background); background-image: var(--pattern-image); background-size: var(--pattern-size); color: var(--name-color); }
.face-inner { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 18mm; border: 4mm solid transparent; outline: 1.2mm solid rgba(255,255,255,.72); outline-offset: -8mm; }
.name-card-face h1 { max-width: 100%; margin: 0; color: var(--name-color); font-size: var(--name-size); font-weight: 900; line-height: 1.18; letter-spacing: .08em; text-align: center; overflow-wrap: anywhere; -webkit-text-stroke: var(--stroke-width) #fff; paint-order: stroke fill; text-shadow: 0 2px 0 rgba(25, 65, 49, .1); }
.inverted-face .face-inner { transform: rotate(180deg); }
.font-rounded h1 { font-family: ui-rounded, "PingFang SC", "Microsoft YaHei", sans-serif; }.font-bold h1 { font-family: "Arial Black", "PingFang SC", sans-serif; }.font-serif h1 { font-family: "Songti SC", STSong, "SimSun", serif; }.font-handwritten h1 { font-family: "Kaiti SC", KaiTi, STKaiti, cursive; }
.fold-line { position: absolute; z-index: 2; top: calc(148mm - .4mm); left: 0; display: flex; align-items: center; justify-content: center; width: 100%; height: .8mm; border-top: .45mm dashed rgba(38, 58, 45, .9); }.fold-line span { position: absolute; padding: 0 4mm; color: #32463a; font-size: 9px; font-weight: 800; letter-spacing: 1px; background: rgba(255,255,255,.9); }
@media (max-width: 768px) { .name-card-generator { display: block; height: auto; padding-bottom: 12px; }.settings-panel { width: 100%; }.preview-panel { margin-top: 12px; min-height: 430px; padding: 12px; overflow: hidden; justify-content: flex-start; }.name-card-paper { --zoom-factor: .43; transform: scale(var(--zoom-factor)); transform-origin: top left; margin-right: calc(-210mm * (1 - var(--zoom-factor))); margin-bottom: calc(-296mm * (1 - var(--zoom-factor))); border-radius: 6px; } }
@media (min-width: 430px) and (max-width: 768px) { .name-card-paper { --zoom-factor: .5; } }
@media (min-width: 560px) and (max-width: 768px) { .name-card-paper { --zoom-factor: .65; } }
@media print { @page { size: A4 portrait; margin: 0; } .no-print { display: none !important; }.name-card-generator, .preview-panel { display: block !important; padding: 0 !important; background: transparent !important; overflow: visible !important; }.name-card-paper { width: 210mm !important; height: 296mm !important; margin: 0 auto !important; box-shadow: none !important; transform: none !important; }.fold-line { display: flex !important; } }
</style>
