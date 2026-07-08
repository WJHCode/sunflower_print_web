<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  DownloadOutlined, 
  PrinterOutlined
} from '@ant-design/icons-vue';
import { printElement, saveImageFromElement, savePdfFromElement } from '../utils/print';
import { useI18n } from '@/i18n';

const { t } = useI18n();

// Define sheet music settings state
const formState = ref({
  sheetType: 'staff' as 'staff' | 'grand' | 'guitar' | 'ukulele' | 'numbered',
  contentMode: 'blank' as 'blank' | 'song',
  selectedSong: 'twinkle' as 'twinkle' | 'ode-to-joy' | 'tigers' | 'jingle-bells' | 'painter' | 'london-bridge' | 'mary' | 'red-riding' | 'birthday' | 'red-river' | 'new-year' | 'going-home' | 'bach-minuet' | 'brahms-lullaby' | 'schubert-lullaby' | 'mozart-lullaby' | 'surprise-sym' | 'auld-lang' | 'love-dream',
  
  // Custom headers
  title: '我的乐谱',
  subtitle: '自定义练习纸',
  author: '向日葵打印',
  
  // Layout settings
  lineSpacing: 2.8, // mm (space between staff lines)
  staffSpacing: 10, // mm (space between staff systems)
  clefType: 'treble' as 'treble' | 'bass' | 'alto' | 'none',
  lineColor: 'dark-gray' as 'dark-gray' | 'green' | 'blue' | 'brown' | 'pencil-gray',
  
  // Chord diagrams settings
  showChords: 'none' as 'none' | 'common' | 'blank',
});

// Color mapping for SVG strokes
const colorMap = {
  'dark-gray': '#3a3a3a',
  'green': '#2f7d46',
  'blue': '#1a5f7a',
  'brown': '#7c582b',
  'pencil-gray': '#8e8e8e'
};

const activeColor = computed(() => colorMap[formState.value.lineColor] || '#3a3a3a');

// Pitch step indices for G clef relative to F5 (which is index 0)
const pitchSteps: Record<string, number> = {
  'G5': -1,
  'F5': 0,
  'E5': 1,
  'D5': 2,
  'C5': 3,
  'B4': 4,
  'A4': 5,
  'G4': 6,
  'F4': 7,
  'E4': 8,
  'D4': 9,
  'C4': 10,  // Middle C (needs 1 ledger line)
  'B3': 11,  // Needs 1 ledger line
  'A3': 12,  // Needs 2 ledger lines
  'G3': 13   // Needs 2 ledger lines
};

// Guitar pitch mappings in C-major (string 1 is top, string 6 is bottom)
const guitarPitchMap: Record<string, { string: number; fret: number }> = {
  'C5': { string: 2, fret: 1 },
  'B4': { string: 2, fret: 0 },
  'A4': { string: 3, fret: 2 },
  'G4': { string: 3, fret: 0 },
  'F4': { string: 4, fret: 3 },
  'E4': { string: 4, fret: 2 },
  'D4': { string: 4, fret: 0 },
  'C4': { string: 5, fret: 3 },
  'B3': { string: 5, fret: 2 },
  'A3': { string: 5, fret: 0 },
  'G3': { string: 6, fret: 3 }
};

// Ukulele pitch mappings in C-major (string 1 is top, string 4 is bottom)
const ukulelePitchMap: Record<string, { string: number; fret: number }> = {
  'C5': { string: 1, fret: 3 },
  'B4': { string: 1, fret: 2 },
  'A4': { string: 1, fret: 0 },
  'G4': { string: 2, fret: 3 },
  'F4': { string: 2, fret: 1 },
  'E4': { string: 2, fret: 0 },
  'D4': { string: 3, fret: 2 },
  'C4': { string: 3, fret: 0 },
  'B3': { string: 4, fret: 4 },
  'A3': { string: 4, fret: 2 },
  'G3': { string: 4, fret: 0 }
};

// Simple C-major Songs Data Structures
interface NoteData {
  pitch: string;
  duration: number; // 1 = quarter, 2 = half, 4 = whole, 0.5 = eighth, 1.5 = dotted quarter
  lyric?: string;
}

interface SongData {
  title: string;
  subtitle: string;
  author: string;
  timeSig: string;
  keySig: string;
  measures: NoteData[][];
}

const songs: Record<string, SongData> = {
  'twinkle': {
    title: '小星星 (Twinkle Twinkle Little Star)',
    subtitle: '莫扎特经典变奏主题 / 经典儿歌',
    author: '法国民谣',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '一' },
        { pitch: 'C4', duration: 1, lyric: '闪' },
        { pitch: 'G4', duration: 1, lyric: '一' },
        { pitch: 'G4', duration: 1, lyric: '闪' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '亮' },
        { pitch: 'A4', duration: 1, lyric: '晶' },
        { pitch: 'G4', duration: 2, lyric: '晶' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '满' },
        { pitch: 'F4', duration: 1, lyric: '天' },
        { pitch: 'E4', duration: 1, lyric: '都' },
        { pitch: 'E4', duration: 1, lyric: '是' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '小' },
        { pitch: 'D4', duration: 1, lyric: '星' },
        { pitch: 'C4', duration: 2, lyric: '星' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '挂' },
        { pitch: 'G4', duration: 1, lyric: '在' },
        { pitch: 'F4', duration: 1, lyric: '天' },
        { pitch: 'F4', duration: 1, lyric: '空' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '放' },
        { pitch: 'E4', duration: 1, lyric: '光' },
        { pitch: 'D4', duration: 2, lyric: '芒' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '好' },
        { pitch: 'G4', duration: 1, lyric: '像' },
        { pitch: 'F4', duration: 1, lyric: '许' },
        { pitch: 'F4', duration: 1, lyric: '多' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '小' },
        { pitch: 'E4', duration: 1, lyric: '眼' },
        { pitch: 'D4', duration: 2, lyric: '睛' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '一' },
        { pitch: 'C4', duration: 1, lyric: '闪' },
        { pitch: 'G4', duration: 1, lyric: '一' },
        { pitch: 'G4', duration: 1, lyric: '闪' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '亮' },
        { pitch: 'A4', duration: 1, lyric: '晶' },
        { pitch: 'G4', duration: 2, lyric: '晶' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '满' },
        { pitch: 'F4', duration: 1, lyric: '天' },
        { pitch: 'E4', duration: 1, lyric: '都' },
        { pitch: 'E4', duration: 1, lyric: '是' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '小' },
        { pitch: 'D4', duration: 1, lyric: '星' },
        { pitch: 'C4', duration: 2, lyric: '星' }
      ]
    ]
  },
  'ode-to-joy': {
    title: '欢乐颂 (Ode to Joy)',
    subtitle: '贝多芬第九交响曲第四乐章主题',
    author: '贝多芬 曲',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1, lyric: '欢' },
        { pitch: 'E4', duration: 1, lyric: '乐' },
        { pitch: 'F4', duration: 1, lyric: '女' },
        { pitch: 'G4', duration: 1, lyric: '神' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '圣' },
        { pitch: 'F4', duration: 1, lyric: '洁' },
        { pitch: 'E4', duration: 1, lyric: '美' },
        { pitch: 'D4', duration: 1, lyric: '丽' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '灿' },
        { pitch: 'C4', duration: 1, lyric: '烂' },
        { pitch: 'D4', duration: 1, lyric: '光' },
        { pitch: 'E4', duration: 1, lyric: '芒' }
      ],
      [
        { pitch: 'E4', duration: 1.5, lyric: '照' },
        { pitch: 'D4', duration: 0.5, lyric: '大' },
        { pitch: 'D4', duration: 2, lyric: '地' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '我' },
        { pitch: 'E4', duration: 1, lyric: '们' },
        { pitch: 'F4', duration: 1, lyric: '心' },
        { pitch: 'G4', duration: 1, lyric: '中' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '充' },
        { pitch: 'F4', duration: 1, lyric: '满' },
        { pitch: 'E4', duration: 1, lyric: '热' },
        { pitch: 'D4', duration: 1, lyric: '情' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '来' },
        { pitch: 'C4', duration: 1, lyric: '到' },
        { pitch: 'D4', duration: 1, lyric: '你' },
        { pitch: 'E4', duration: 1, lyric: '的' }
      ],
      [
        { pitch: 'D4', duration: 1.5, lyric: '殿' },
        { pitch: 'C4', duration: 0.5, lyric: '堂' },
        { pitch: 'C4', duration: 2, lyric: '里' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '你' },
        { pitch: 'D4', duration: 1, lyric: '的' },
        { pitch: 'E4', duration: 1, lyric: '力' },
        { pitch: 'C4', duration: 1, lyric: '量' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '能' },
        { pitch: 'E4', duration: 0.5, lyric: '使' },
        { pitch: 'F4', duration: 0.5, lyric: '人' },
        { pitch: 'E4', duration: 1, lyric: '们' },
        { pitch: 'C4', duration: 1, lyric: '重' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '新' },
        { pitch: 'E4', duration: 0.5, lyric: '结' },
        { pitch: 'F4', duration: 0.5, lyric: '成' },
        { pitch: 'E4', duration: 1, lyric: '兄' },
        { pitch: 'D4', duration: 1, lyric: '弟' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '在' },
        { pitch: 'D4', duration: 1, lyric: '你' },
        { pitch: 'G3', duration: 2, lyric: '羽' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '翼' },
        { pitch: 'E4', duration: 1, lyric: '歌' },
        { pitch: 'F4', duration: 1, lyric: '声' },
        { pitch: 'G4', duration: 1, lyric: '底' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '人' },
        { pitch: 'F4', duration: 1, lyric: '人' },
        { pitch: 'E4', duration: 1, lyric: '宽' },
        { pitch: 'D4', duration: 1, lyric: '容' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '四' },
        { pitch: 'C4', duration: 1, lyric: '海' },
        { pitch: 'D4', duration: 1, lyric: '同' },
        { pitch: 'E4', duration: 1, lyric: '胞' }
      ],
      [
        { pitch: 'D4', duration: 1.5, lyric: '一家' },
        { pitch: 'C4', duration: 0.5, lyric: '亲' },
        { pitch: 'C4', duration: 2, lyric: '！' }
      ]
    ]
  },
  'tigers': {
    title: '两只老虎 (Frère Jacques)',
    subtitle: '经典轮唱少儿歌曲',
    author: '传统儿歌',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '两' },
        { pitch: 'D4', duration: 1, lyric: '只' },
        { pitch: 'E4', duration: 1, lyric: '老' },
        { pitch: 'C4', duration: 1, lyric: '虎' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '两' },
        { pitch: 'D4', duration: 1, lyric: '只' },
        { pitch: 'E4', duration: 1, lyric: '老' },
        { pitch: 'C4', duration: 1, lyric: '虎' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '跑' },
        { pitch: 'F4', duration: 1, lyric: '得' },
        { pitch: 'G4', duration: 2, lyric: '快' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '跑' },
        { pitch: 'F4', duration: 1, lyric: '得' },
        { pitch: 'G4', duration: 2, lyric: '快' }
      ],
      [
        { pitch: 'G4', duration: 0.5, lyric: '一' },
        { pitch: 'A4', duration: 0.5, lyric: '只' },
        { pitch: 'G4', duration: 0.5, lyric: '没' },
        { pitch: 'F4', duration: 0.5, lyric: '有' },
        { pitch: 'E4', duration: 1, lyric: '耳' },
        { pitch: 'C4', duration: 1, lyric: '朵' }
      ],
      [
        { pitch: 'G4', duration: 0.5, lyric: '一' },
        { pitch: 'A4', duration: 0.5, lyric: '只' },
        { pitch: 'G4', duration: 0.5, lyric: '没' },
        { pitch: 'F4', duration: 0.5, lyric: '有' },
        { pitch: 'E4', duration: 1, lyric: '尾' },
        { pitch: 'C4', duration: 1, lyric: '巴' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '真' },
        { pitch: 'G3', duration: 1, lyric: '奇' },
        { pitch: 'C4', duration: 2, lyric: '怪' }
      ]
    ]
  },
  'jingle-bells': {
    title: '铃儿响叮当 (Jingle Bells)',
    subtitle: '经典冬季童谣与儿歌',
    author: '詹姆斯·皮尔庞特 曲',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 2, lyric: '当' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 2, lyric: '当' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '铃' },
        { pitch: 'G4', duration: 1, lyric: '儿' },
        { pitch: 'C4', duration: 1.5, lyric: '响' },
        { pitch: 'D4', duration: 0.5, lyric: '叮' }
      ],
      [
        { pitch: 'E4', duration: 4, lyric: '当' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '我' },
        { pitch: 'F4', duration: 1, lyric: '们' },
        { pitch: 'F4', duration: 1.5, lyric: '滑' },
        { pitch: 'F4', duration: 0.5, lyric: '雪' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '多' },
        { pitch: 'E4', duration: 1, lyric: '快' },
        { pitch: 'E4', duration: 1, lyric: '乐' },
        { pitch: 'E4', duration: 0.5, lyric: '真' },
        { pitch: 'E4', duration: 0.5, lyric: '是' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '快' },
        { pitch: 'D4', duration: 1, lyric: '乐' },
        { pitch: 'D4', duration: 1, lyric: '无' },
        { pitch: 'E4', duration: 1, lyric: '比' }
      ],
      [
        { pitch: 'D4', duration: 2, lyric: '哈' },
        { pitch: 'G4', duration: 2, lyric: '哈' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 2, lyric: '当' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 1, lyric: '叮' },
        { pitch: 'E4', duration: 2, lyric: '当' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '铃' },
        { pitch: 'G4', duration: 1, lyric: '儿' },
        { pitch: 'C4', duration: 1.5, lyric: '响' },
        { pitch: 'D4', duration: 0.5, lyric: '叮' }
      ],
      [
        { pitch: 'E4', duration: 4, lyric: '当' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '我' },
        { pitch: 'F4', duration: 1, lyric: '们' },
        { pitch: 'F4', duration: 1.5, lyric: '滑' },
        { pitch: 'F4', duration: 0.5, lyric: '雪' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '多' },
        { pitch: 'E4', duration: 1, lyric: '快' },
        { pitch: 'E4', duration: 1, lyric: '乐' },
        { pitch: 'E4', duration: 0.5, lyric: '奔' },
        { pitch: 'E4', duration: 0.5, lyric: '向' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '幸' },
        { pitch: 'G4', duration: 1, lyric: '福' },
        { pitch: 'F4', duration: 1, lyric: '前' },
        { pitch: 'D4', duration: 1, lyric: '方' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '！' }
      ]
    ]
  },
  'painter': {
    title: '粉刷匠 (The Painter)',
    subtitle: '经典活泼儿歌',
    author: '波兰民歌',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'G4', duration: 1, lyric: '我' },
        { pitch: 'E4', duration: 1, lyric: '是' },
        { pitch: 'G4', duration: 1, lyric: '一' },
        { pitch: 'E4', duration: 1, lyric: '个' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '粉' },
        { pitch: 'G4', duration: 1, lyric: '刷' },
        { pitch: 'A4', duration: 2, lyric: '匠' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '粉' },
        { pitch: 'G4', duration: 1, lyric: '刷' },
        { pitch: 'F4', duration: 1, lyric: '本' },
        { pitch: 'D4', duration: 1, lyric: '领' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '强' },
        { pitch: 'C4', duration: 3, lyric: '。' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '我' },
        { pitch: 'E4', duration: 1, lyric: '要' },
        { pitch: 'G4', duration: 1, lyric: '把' },
        { pitch: 'E4', duration: 1, lyric: '那' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '新' },
        { pitch: 'G4', duration: 1, lyric: '房' },
        { pitch: 'A4', duration: 2, lyric: '子' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '刷' },
        { pitch: 'G4', duration: 1, lyric: '得' },
        { pitch: 'F4', duration: 1, lyric: '更' },
        { pitch: 'D4', duration: 1, lyric: '漂' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '亮' }
      ]
    ]
  },
  'london-bridge': {
    title: '伦敦大桥倒下来 (London Bridge is Falling Down)',
    subtitle: '英国传统童谣',
    author: '英国民谣',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'G4', duration: 1.5, lyric: '伦' },
        { pitch: 'A4', duration: 0.5, lyric: '敦' },
        { pitch: 'G4', duration: 1, lyric: '大' },
        { pitch: 'F4', duration: 1, lyric: '桥' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '倒' },
        { pitch: 'F4', duration: 1, lyric: '下' },
        { pitch: 'G4', duration: 2, lyric: '来' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '倒' },
        { pitch: 'E4', duration: 1, lyric: '下' },
        { pitch: 'F4', duration: 2, lyric: '来' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '倒' },
        { pitch: 'F4', duration: 1, lyric: '下' },
        { pitch: 'G4', duration: 2, lyric: '来' }
      ],
      [
        { pitch: 'G4', duration: 1.5, lyric: '伦' },
        { pitch: 'A4', duration: 0.5, lyric: '敦' },
        { pitch: 'G4', duration: 1, lyric: '大' },
        { pitch: 'F4', duration: 1, lyric: '桥' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '倒' },
        { pitch: 'F4', duration: 1, lyric: '下' },
        { pitch: 'G4', duration: 2, lyric: '来' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '朋' },
        { pitch: 'C4', duration: 3, lyric: '友' }
      ]
    ]
  },
  'mary': {
    title: '玛丽有只小羔羊 (Mary Had a Little Lamb)',
    subtitle: '经典英美童谣与儿歌',
    author: '美国民谣',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1, lyric: '玛' },
        { pitch: 'D4', duration: 1, lyric: '丽' },
        { pitch: 'C4', duration: 1, lyric: '有' },
        { pitch: 'D4', duration: 1, lyric: '只' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '小' },
        { pitch: 'E4', duration: 1, lyric: '羔' },
        { pitch: 'E4', duration: 2, lyric: '羊' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '小' },
        { pitch: 'D4', duration: 1, lyric: '羔' },
        { pitch: 'D4', duration: 2, lyric: '羊' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '小' },
        { pitch: 'G4', duration: 1, lyric: '羔' },
        { pitch: 'G4', duration: 2, lyric: '羊' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '玛' },
        { pitch: 'D4', duration: 1, lyric: '丽' },
        { pitch: 'C4', duration: 1, lyric: '有' },
        { pitch: 'D4', duration: 1, lyric: '只' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '小' },
        { pitch: 'E4', duration: 1, lyric: '羔' },
        { pitch: 'E4', duration: 1, lyric: '羊' },
        { pitch: 'E4', duration: 1, lyric: '真' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '可' },
        { pitch: 'D4', duration: 1, lyric: '爱' },
        { pitch: 'E4', duration: 1, lyric: '咩' },
        { pitch: 'D4', duration: 1, lyric: '咩' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '叫' }
      ]
    ]
  },
  'red-riding': {
    title: '小红帽 (Little Red Riding Hood)',
    subtitle: '经典童话故事主题儿歌',
    author: '巴西童谣',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '我' },
        { pitch: 'E4', duration: 1, lyric: '独' },
        { pitch: 'G4', duration: 1, lyric: '自' },
        { pitch: 'C5', duration: 1, lyric: '一' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '人' },
        { pitch: 'F4', duration: 1, lyric: '走' },
        { pitch: 'A4', duration: 1, lyric: '在' },
        { pitch: 'G4', duration: 1, lyric: '郊' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '外' },
        { pitch: 'C4', duration: 1, lyric: '的' },
        { pitch: 'E4', duration: 1, lyric: '小' },
        { pitch: 'D4', duration: 1, lyric: '路' }
      ],
      [
        { pitch: 'G4', duration: 4, lyric: '上' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '我' },
        { pitch: 'E4', duration: 1, lyric: '要' },
        { pitch: 'G4', duration: 1, lyric: '去' },
        { pitch: 'C5', duration: 1, lyric: '看' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '外' },
        { pitch: 'F4', duration: 1, lyric: '婆' },
        { pitch: 'A4', duration: 1, lyric: '把' },
        { pitch: 'G4', duration: 1, lyric: '红' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '糖' },
        { pitch: 'D4', duration: 1, lyric: '果' },
        { pitch: 'E4', duration: 1, lyric: '送' },
        { pitch: 'D4', duration: 1, lyric: '她' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '尝' }
      ]
    ]
  },
  'birthday': {
    title: '生日快乐歌 (Happy Birthday to You)',
    subtitle: '全球最著名的庆典歌曲',
    author: '米尔德里德·希尔 曲',
    timeSig: '3/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'G3', duration: 0.5, lyric: '祝' },
        { pitch: 'G3', duration: 0.5, lyric: '你' },
        { pitch: 'A3', duration: 1, lyric: '生' },
        { pitch: 'G3', duration: 1, lyric: '日' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '快' },
        { pitch: 'B3', duration: 2, lyric: '乐' }
      ],
      [
        { pitch: 'G3', duration: 0.5, lyric: '祝' },
        { pitch: 'G3', duration: 0.5, lyric: '你' },
        { pitch: 'A3', duration: 1, lyric: '生' },
        { pitch: 'G3', duration: 1, lyric: '日' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '快' },
        { pitch: 'C4', duration: 2, lyric: '乐' }
      ],
      [
        { pitch: 'G3', duration: 0.5, lyric: '祝' },
        { pitch: 'G3', duration: 0.5, lyric: '你' },
        { pitch: 'G4', duration: 1, lyric: '生' },
        { pitch: 'E4', duration: 1, lyric: '日' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '快' },
        { pitch: 'B3', duration: 1, lyric: '乐' },
        { pitch: 'A3', duration: 1, lyric: '～' }
      ],
      [
        { pitch: 'F4', duration: 0.5, lyric: '祝' },
        { pitch: 'F4', duration: 0.5, lyric: '你' },
        { pitch: 'E4', duration: 1, lyric: '生' },
        { pitch: 'C4', duration: 1, lyric: '日' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '快' },
        { pitch: 'C4', duration: 2, lyric: '乐' }
      ]
    ]
  },
  'red-river': {
    title: '红河谷 (Red River Valley)',
    subtitle: '脍炙人口的经典北美民歌',
    author: '加拿大民歌',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'G3', duration: 1, lyric: '人' },
        { pitch: 'C4', duration: 1, lyric: '们' },
        { pitch: 'C4', duration: 1, lyric: '说' },
        { pitch: 'C4', duration: 1, lyric: '你' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '将' },
        { pitch: 'D4', duration: 1, lyric: '要' },
        { pitch: 'E4', duration: 2, lyric: '走' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '离' },
        { pitch: 'D4', duration: 1, lyric: '开' },
        { pitch: 'C4', duration: 1, lyric: '这' },
        { pitch: 'D4', duration: 1, lyric: '红' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '河' },
        { pitch: 'F4', duration: 1, lyric: '谷' },
        { pitch: 'G4', duration: 2, lyric: '庄' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '看' },
        { pitch: 'A4', duration: 1, lyric: '着' },
        { pitch: 'A4', duration: 1, lyric: '你' },
        { pitch: 'A4', duration: 1, lyric: '那' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '清' },
        { pitch: 'A4', duration: 1, lyric: '楚' },
        { pitch: 'G4', duration: 2, lyric: '的' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '双' },
        { pitch: 'F4', duration: 1, lyric: '眼' },
        { pitch: 'E4', duration: 1, lyric: '和' },
        { pitch: 'D4', duration: 1, lyric: '微' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '笑' }
      ]
    ]
  },
  'new-year': {
    title: '新年好 (Happy New Year)',
    subtitle: '家喻户晓的新春拜年儿童民歌',
    author: '传统童谣',
    timeSig: '3/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '新' },
        { pitch: 'C4', duration: 1, lyric: '年' },
        { pitch: 'C4', duration: 1, lyric: '好' }
      ],
      [
        { pitch: 'G3', duration: 3, lyric: '呀' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '新' },
        { pitch: 'E4', duration: 1, lyric: '年' },
        { pitch: 'E4', duration: 1, lyric: '好' }
      ],
      [
        { pitch: 'C4', duration: 3, lyric: '呀' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '祝' },
        { pitch: 'E4', duration: 1, lyric: '贺' },
        { pitch: 'G4', duration: 1, lyric: '大' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '家' },
        { pitch: 'F4', duration: 1, lyric: '新' },
        { pitch: 'E4', duration: 1, lyric: '年' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '万' },
        { pitch: 'E4', duration: 1, lyric: '事' },
        { pitch: 'D4', duration: 1, lyric: '如' }
      ],
      [
        { pitch: 'C4', duration: 3, lyric: '意' }
      ]
    ]
  },
  'going-home': {
    title: '念故乡 (Going Home)',
    subtitle: '德沃夏克《自新大陆交响曲》第二乐章主题',
    author: '安东·德沃夏克 曲',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1.5, lyric: '念' },
        { pitch: 'E4', duration: 0.5, lyric: '故' },
        { pitch: 'G4', duration: 2, lyric: '乡' }
      ],
      [
        { pitch: 'G4', duration: 1.5, lyric: '念' },
        { pitch: 'E4', duration: 0.5, lyric: '故' },
        { pitch: 'D4', duration: 2, lyric: '乡' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '故' },
        { pitch: 'D4', duration: 1, lyric: '乡' },
        { pitch: 'E4', duration: 1, lyric: '路' },
        { pitch: 'G4', duration: 1, lyric: '上' }
      ],
      [
        { pitch: 'E4', duration: 1.5, lyric: '路' },
        { pitch: 'D4', duration: 0.5, lyric: '漫' },
        { pitch: 'D4', duration: 2, lyric: '长' }
      ],
      [
        { pitch: 'E4', duration: 1.5, lyric: '念' },
        { pitch: 'E4', duration: 0.5, lyric: '故' },
        { pitch: 'G4', duration: 2, lyric: '乡' }
      ],
      [
        { pitch: 'G4', duration: 1.5, lyric: '念' },
        { pitch: 'E4', duration: 0.5, lyric: '故' },
        { pitch: 'D4', duration: 2, lyric: '乡' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '归' },
        { pitch: 'E4', duration: 1.5, lyric: '家' },
        { pitch: 'D4', duration: 0.5, lyric: '心' },
        { pitch: 'D4', duration: 1, lyric: '切' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '切' }
      ]
    ]
  },
  'bach-minuet': {
    title: '小步舞曲 (Minuet in C)',
    subtitle: '巴赫经典键盘乐曲旋律',
    author: '约翰·塞巴斯蒂安·巴赫 曲',
    timeSig: '3/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '美' },
        { pitch: 'D4', duration: 0.5, lyric: '丽' },
        { pitch: 'E4', duration: 0.5, lyric: '的' },
        { pitch: 'F4', duration: 1, lyric: '小' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '步' },
        { pitch: 'C5', duration: 1, lyric: '舞' },
        { pitch: 'C5', duration: 1, lyric: '曲' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '欢' },
        { pitch: 'G4', duration: 0.5, lyric: '快' },
        { pitch: 'F4', duration: 0.5, lyric: '的' },
        { pitch: 'E4', duration: 1, lyric: '旋' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '律' },
        { pitch: 'E4', duration: 1, lyric: '呀' },
        { pitch: 'C4', duration: 1, lyric: '响' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '跳' },
        { pitch: 'G4', duration: 0.5, lyric: '起' },
        { pitch: 'A4', duration: 0.5, lyric: '那' },
        { pitch: 'G4', duration: 1, lyric: '轻' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '盈' },
        { pitch: 'F4', duration: 0.5, lyric: '舞' },
        { pitch: 'G4', duration: 0.5, lyric: '步' },
        { pitch: 'F4', duration: 1, lyric: '呀' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '多' },
        { pitch: 'E4', duration: 0.5, lyric: '美' },
        { pitch: 'F4', duration: 0.5, lyric: '妙' },
        { pitch: 'E4', duration: 1, lyric: '歌' }
      ],
      [
        { pitch: 'C4', duration: 3, lyric: '声' }
      ]
    ]
  },
  'brahms-lullaby': {
    title: '摇篮曲 (Brahms Lullaby)',
    subtitle: '勃拉姆斯创作的经典世界名曲',
    author: '约翰内斯·勃拉姆斯 曲',
    timeSig: '3/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1, lyric: '睡' },
        { pitch: 'E4', duration: 1, lyric: '吧' },
        { pitch: 'G4', duration: 1, lyric: '睡' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '睡' },
        { pitch: 'E4', duration: 1, lyric: '吧' },
        { pitch: 'G4', duration: 1, lyric: '睡' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '我' },
        { pitch: 'G4', duration: 1, lyric: '的' },
        { pitch: 'C5', duration: 1, lyric: '小' }
      ],
      [
        { pitch: 'B4', duration: 1, lyric: '宝' },
        { pitch: 'A4', duration: 2, lyric: '贝' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '风' },
        { pitch: 'E4', duration: 1, lyric: '儿' },
        { pitch: 'F4', duration: 1, lyric: '轻' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '风' },
        { pitch: 'E4', duration: 1, lyric: '儿' },
        { pitch: 'F4', duration: 1, lyric: '吹' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '月' },
        { pitch: 'F4', duration: 1, lyric: '亮' },
        { pitch: 'B4', duration: 1, lyric: '弯' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '弯' },
        { pitch: 'G4', duration: 2, lyric: '睡' }
      ]
    ]
  },
  'schubert-lullaby': {
    title: '摇篮曲 (Schubert Lullaby)',
    subtitle: '舒伯特创作经典艺术摇篮曲',
    author: '弗朗茨·舒伯特 曲',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1, lyric: '睡' },
        { pitch: 'E4', duration: 1, lyric: '吧' },
        { pitch: 'G4', duration: 1, lyric: '睡' },
        { pitch: 'G4', duration: 1, lyric: '吧' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '我' },
        { pitch: 'D4', duration: 1, lyric: '的' },
        { pitch: 'C4', duration: 2, lyric: '宝贝' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '睡' },
        { pitch: 'E4', duration: 1, lyric: '在' },
        { pitch: 'F4', duration: 1, lyric: '摇' },
        { pitch: 'G4', duration: 1, lyric: '篮' }
      ],
      [
        { pitch: 'E4', duration: 2, lyric: '里' },
        { pitch: 'D4', duration: 2, lyric: '多' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '香' },
        { pitch: 'E4', duration: 1, lyric: '甜' },
        { pitch: 'G4', duration: 1, lyric: '睡' },
        { pitch: 'G4', duration: 1, lyric: '吧' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '我' },
        { pitch: 'D4', duration: 1, lyric: '的' },
        { pitch: 'C4', duration: 2, lyric: '宝贝' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '快' },
        { pitch: 'E4', duration: 1, lyric: '快' },
        { pitch: 'D4', duration: 1, lyric: '入' },
        { pitch: 'B3', duration: 1, lyric: '梦' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '乡' }
      ]
    ]
  },
  'mozart-lullaby': {
    title: '摇篮曲 (Mozart Lullaby)',
    subtitle: '莫扎特摇篮曲（经典管弦乐改编版）',
    author: '伯恩哈德·弗利斯 曲',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'E4', duration: 1.5, lyric: '睡' },
        { pitch: 'G4', duration: 0.5, lyric: '吧' },
        { pitch: 'G4', duration: 2, lyric: '睡' }
      ],
      [
        { pitch: 'F4', duration: 1.5, lyric: '睡' },
        { pitch: 'A4', duration: 0.5, lyric: '吧' },
        { pitch: 'A4', duration: 2, lyric: '睡' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '我' },
        { pitch: 'F4', duration: 1, lyric: '的' },
        { pitch: 'E4', duration: 1, lyric: '小' },
        { pitch: 'D4', duration: 1, lyric: '宝' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '贝' }
      ],
      [
        { pitch: 'E4', duration: 1.5, lyric: '夜' },
        { pitch: 'G4', duration: 0.5, lyric: '已' },
        { pitch: 'G4', duration: 2, lyric: '静' }
      ],
      [
        { pitch: 'F4', duration: 1.5, lyric: '风' },
        { pitch: 'A4', duration: 0.5, lyric: '已' },
        { pitch: 'A4', duration: 2, lyric: '停' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '月' },
        { pitch: 'F4', duration: 1, lyric: '亮' },
        { pitch: 'E4', duration: 1, lyric: '挂' },
        { pitch: 'D4', duration: 1, lyric: '天' }
      ],
      [
        { pitch: 'C4', duration: 4, lyric: '空' }
      ]
    ]
  },
  'surprise-sym': {
    title: '惊愕交响曲 (Surprise Symphony Theme)',
    subtitle: '海顿最著名的交响乐主题旋律',
    author: '约瑟夫·海顿 曲',
    timeSig: '2/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '小' },
        { pitch: 'C4', duration: 1, lyric: '朋' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '友' },
        { pitch: 'E4', duration: 1, lyric: '来' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '听' },
        { pitch: 'G4', duration: 1, lyric: '交' }
      ],
      [
        { pitch: 'E4', duration: 2, lyric: '响' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '多' },
        { pitch: 'F4', duration: 1, lyric: '奇' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '妙' },
        { pitch: 'D4', duration: 1, lyric: '多' }
      ],
      [
        { pitch: 'B3', duration: 1, lyric: '好' },
        { pitch: 'B3', duration: 1, lyric: '玩' }
      ],
      [
        { pitch: 'G3', duration: 2, lyric: '呀' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '忽' },
        { pitch: 'C4', duration: 1, lyric: '然' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '间' },
        { pitch: 'E4', duration: 1, lyric: '大' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '声' },
        { pitch: 'G4', duration: 1, lyric: '响' }
      ],
      [
        { pitch: 'E4', duration: 2, lyric: '砰' }
      ],
      [
        { pitch: 'F4', duration: 1, lyric: '吓' },
        { pitch: 'F4', duration: 1, lyric: '了' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '你' },
        { pitch: 'D4', duration: 1, lyric: '一' }
      ],
      [
        { pitch: 'B3', duration: 1, lyric: '大' },
        { pitch: 'B3', duration: 1, lyric: '跳' }
      ],
      [
        { pitch: 'C4', duration: 2, lyric: '！' }
      ]
    ]
  },
  'auld-lang': {
    title: '友谊地久天长 (Auld Lang Syne)',
    subtitle: '家喻户晓的经典苏格兰民歌',
    author: '苏格兰民歌',
    timeSig: '4/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'G3', duration: 1, lyric: '怎' },
        { pitch: 'C4', duration: 1.5, lyric: '能' },
        { pitch: 'C4', duration: 0.5, lyric: '忘' },
        { pitch: 'C4', duration: 1, lyric: '记' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '旧' },
        { pitch: 'D4', duration: 1.5, lyric: '日' },
        { pitch: 'C4', duration: 0.5, lyric: '朋' },
        { pitch: 'D4', duration: 1, lyric: '友' }
      ],
      [
        { pitch: 'E4', duration: 1, lyric: '同' },
        { pitch: 'C4', duration: 1.5, lyric: '心' },
        { pitch: 'C4', duration: 0.5, lyric: '合' },
        { pitch: 'E4', duration: 1, lyric: '意' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '相' },
        { pitch: 'A4', duration: 3, lyric: '亲' }
      ],
      [
        { pitch: 'A4', duration: 1, lyric: '那' },
        { pitch: 'G4', duration: 1.5, lyric: '我' },
        { pitch: 'E4', duration: 0.5, lyric: '们' },
        { pitch: 'E4', duration: 1, lyric: '同' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '歌' },
        { pitch: 'D4', duration: 1.5, lyric: '旧' },
        { pitch: 'C4', duration: 0.5, lyric: '日' },
        { pitch: 'D4', duration: 1, lyric: '友' }
      ],
      [
        { pitch: 'A3', duration: 1, lyric: '谊' },
        { pitch: 'G3', duration: 1.5, lyric: '友' },
        { pitch: 'C4', duration: 0.5, lyric: '谊' },
        { pitch: 'E4', duration: 1, lyric: '地' }
      ],
      [
        { pitch: 'D4', duration: 1, lyric: '久' },
        { pitch: 'C4', duration: 3, lyric: '天' }
      ]
    ]
  },
  'love-dream': {
    title: '爱之梦 (Liebestraum No. 3)',
    subtitle: '李斯特浪漫主义钢琴曲主题旋律',
    author: '弗朗茨·李斯特 曲',
    timeSig: '6/4',
    keySig: 'C Major',
    measures: [
      [
        { pitch: 'C4', duration: 1, lyric: '爱' },
        { pitch: 'E4', duration: 1.5, lyric: '是' },
        { pitch: 'D4', duration: 0.5, lyric: '温' },
        { pitch: 'E4', duration: 1, lyric: '暖' },
        { pitch: 'G4', duration: 1, lyric: '微' }
      ],
      [
        { pitch: 'C5', duration: 1.5, lyric: '风' },
        { pitch: 'B4', duration: 0.5, lyric: '吹' },
        { pitch: 'C5', duration: 1, lyric: '拂' },
        { pitch: 'A4', duration: 1, lyric: '过' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '拂' },
        { pitch: 'E4', duration: 1, lyric: '去' },
        { pitch: 'D4', duration: 1, lyric: '了' },
        { pitch: 'C4', duration: 1, lyric: '悲' }
      ],
      [
        { pitch: 'D4', duration: 3, lyric: '伤' }
      ],
      [
        { pitch: 'C4', duration: 1, lyric: '爱' },
        { pitch: 'E4', duration: 1.5, lyric: '是' },
        { pitch: 'D4', duration: 0.5, lyric: '灿' },
        { pitch: 'E4', duration: 1, lyric: '烂' },
        { pitch: 'G4', duration: 1, lyric: '阳' }
      ],
      [
        { pitch: 'C5', duration: 1.5, lyric: '光' },
        { pitch: 'B4', duration: 0.5, lyric: '照' },
        { pitch: 'C5', duration: 1, lyric: '大' },
        { pitch: 'A4', duration: 1, lyric: '地' }
      ],
      [
        { pitch: 'G4', duration: 1, lyric: '照' },
        { pitch: 'E4', duration: 1, lyric: '亮' },
        { pitch: 'D4', duration: 1, lyric: '了' },
        { pitch: 'B3', duration: 1, lyric: '心' }
      ],
      [
        { pitch: 'C4', duration: 3, lyric: '房' }
      ]
    ]
  }
};

// Preset Chord Data (for Guitar and Ukulele)
interface ChordDiagram {
  name: string;
  guitarFrets: number[]; // e.g. [-1, 3, 2, 0, 1, 0] (strings E A D G B E, -1 = mute, 0 = open, 3 = fret)
  ukuleleFrets: number[]; // e.g. [2, 0, 1, 0] (strings G C E A)
}

const presetChords: ChordDiagram[] = [
  { name: 'C', guitarFrets: [-1, 3, 2, 0, 1, 0], ukuleleFrets: [0, 0, 0, 3] },
  { name: 'G', guitarFrets: [3, 2, 0, 0, 0, 3], ukuleleFrets: [0, 2, 3, 2] },
  { name: 'Am', guitarFrets: [-1, 0, 2, 2, 1, 0], ukuleleFrets: [2, 0, 0, 0] },
  { name: 'Em', guitarFrets: [0, 2, 2, 0, 0, 0], ukuleleFrets: [0, 4, 3, 2] },
  { name: 'F', guitarFrets: [1, 3, 3, 2, 1, 1], ukuleleFrets: [2, 0, 1, 0] },
  { name: 'D', guitarFrets: [-1, -1, 0, 2, 3, 2], ukuleleFrets: [2, 2, 2, 0] }
];

// Computed header labels depending on mode
const sheetTitle = computed(() => {
  if (formState.value.contentMode === 'song') {
    return songs[formState.value.selectedSong]?.title || '乐谱';
  }
  return formState.value.title || '自定义乐谱';
});

const sheetSubtitle = computed(() => {
  if (formState.value.contentMode === 'song') {
    return songs[formState.value.selectedSong]?.subtitle || '';
  }
  return formState.value.subtitle || '';
});

const sheetAuthor = computed(() => {
  if (formState.value.contentMode === 'song') {
    return songs[formState.value.selectedSong]?.author || '';
  }
  return formState.value.author || '';
});

// A4 Dimensions: 210mm x 297mm.
// Safe margins: Left/Right = 15mm, Top = 18mm, Bottom = 18mm.
// Music systems use a slightly wider span to balance the visual weight of clefs on the left.
// Printable area height = 297 - 36 = 261mm.
const marginX = 15;
const marginTop = 22; // extra room for headers
const width = 186;
const printableHeight = 260;

// Determine how many lines are in a single system/staff block
const linesPerStaff = computed(() => {
  if (formState.value.sheetType === 'guitar') return 6;
  if (formState.value.sheetType === 'ukulele') return 4;
  if (formState.value.sheetType === 'numbered') return 1; // single line grid
  return 5; // staff, grand
});

// Calculate total height needed for a single system block (including lines, titles, tabs)
const getSystemHeight = (type: string, spacing: number) => {
  const lineSpacing = spacing;
  if (type === 'grand') {
    // Grand staff has two 5-line staves, a spacing between them, plus spacing below
    return (2 * 4 * lineSpacing) + 12 + 16; // 12mm between treble/bass, 16mm below system
  }
  if (type === 'guitar') {
    // Guitar has 6 lines (5 * spacing)
    return (5 * lineSpacing) + 20; 
  }
  if (type === 'ukulele') {
    // Ukulele has 4 lines (3 * spacing)
    return (3 * lineSpacing) + 20;
  }
  if (type === 'numbered') {
    return 16; // simple grid line height
  }
  // Standard 5-line staff
  return (4 * lineSpacing) + 20;
};

const getSystemStepHeight = (visualHeight: number, spacing: number) => {
  return visualHeight + Math.max(4, spacing - 6);
};

const getSystemsPerPage = (startY: number, visualHeight: number, stepHeight: number) => {
  const availableHeight = printableHeight - startY - visualHeight;
  return Math.max(1, Math.floor(availableHeight / stepHeight) + 1);
};

const positionSystemsOnPage = (
  systems: StaffSystem[],
  startY: number,
  stepHeight: number,
) => {
  return systems.map((system, index) => ({
    ...system,
    yOffset: startY + (index * stepHeight),
  }));
};

// Calculate and generate layout pagination dynamically!
interface StaffSystem {
  index: number;
  yOffset: number; // Y position relative to page printable start
  isGrandTreble?: boolean;
  isGrandBass?: boolean;
  measures?: NoteData[][]; // Measures containing notes if in song mode
  measureIndexStart?: number;
}

interface PageData {
  pageIndex: number;
  systems: StaffSystem[];
  showChords: boolean;
}

const pages = computed(() => {
  const sheetType = formState.value.sheetType;
  const contentMode = formState.value.contentMode;
  const lineSpacing = formState.value.lineSpacing;
  const staffSpacing = formState.value.staffSpacing;
  
  const systemVisualHeight = getSystemHeight(sheetType, lineSpacing);
  const systemStepHeight = getSystemStepHeight(systemVisualHeight, staffSpacing);
  
  // Calculate how many systems we can fit on Page 1 (which has header) and Page 2+ (which doesn't)
  const headerHeight = 22; // Titles, subtitle heights
  const chordHeaderHeight = formState.value.showChords !== 'none' ? 24 : 0;
  
  const generatedPages: PageData[] = [];
  
  if (contentMode === 'blank') {
    const startY = marginTop + headerHeight + chordHeaderHeight;
    const systemsOnPage = getSystemsPerPage(startY, systemVisualHeight, systemStepHeight);
    const pageSystems = Array.from({ length: systemsOnPage }, (_, index) => ({
      index,
      yOffset: 0,
    }));

    generatedPages.push({
      pageIndex: 0,
      systems: positionSystemsOnPage(pageSystems, startY, systemStepHeight),
      showChords: formState.value.showChords !== 'none'
    });
  } else {
    // Song Notation Mode: Group notes/measures into lines
    const song = songs[formState.value.selectedSong];
    if (!song) return [];
    
    const songMeasures = song.measures;
    // We group measures into lines. For simple songs, 4 measures per line is standard.
    const measuresPerLine = 4;
    const linesNeeded = Math.ceil(songMeasures.length / measuresPerLine);

    const allSystems: StaffSystem[] = [];

    for (let i = 0; i < linesNeeded; i++) {
      const mStart = i * measuresPerLine;
      const mEnd = Math.min((i + 1) * measuresPerLine, songMeasures.length);
      const lineMeasures = songMeasures.slice(mStart, mEnd);

      allSystems.push({
        index: i,
        yOffset: 0,
        measures: lineMeasures,
        measureIndexStart: mStart
      });
    }

    const pageCapacities: number[] = [];
    let remainingSystems = allSystems.length;

    while (remainingSystems > 0) {
      const pageIndex = pageCapacities.length;
      const startY = pageIndex === 0
        ? marginTop + headerHeight + chordHeaderHeight
        : marginTop;
      const systemsOnPage = getSystemsPerPage(startY, systemVisualHeight, systemStepHeight);
      pageCapacities.push(systemsOnPage);
      remainingSystems -= systemsOnPage;
    }

    let nextSystemIndex = 0;

    pageCapacities.forEach((systemsOnPage, currentPageIndex) => {
      const startY = currentPageIndex === 0
        ? marginTop + headerHeight + chordHeaderHeight
        : marginTop;
      const pageSystems = allSystems.slice(nextSystemIndex, nextSystemIndex + systemsOnPage);

      generatedPages.push({
        pageIndex: currentPageIndex,
        systems: positionSystemsOnPage(pageSystems, startY, systemStepHeight),
        showChords: currentPageIndex === 0 && formState.value.showChords !== 'none'
      });

      nextSystemIndex += pageSystems.length;
    });
  }
  
  return generatedPages;
});

// Calculate ledger line vertical position relative to top line F5
const getLedgerLines = (step: number) => {
  const lines = [];
  if (step >= 10) {
    // Under bottom line E4 (index 8). Bottom line is index 8.
    // C4 is index 10. Draw ledger line at index 10.
    lines.push(10);
  }
  if (step >= 12) {
    // A3 is index 12. Draw ledger line at index 12.
    lines.push(12);
  }
  if (step <= -2) {
    // Above top line F5 (index 0). G5 is index -1, A5 is index -2.
    lines.push(-2);
  }
  return lines;
};

// Calculate horizontal spacing of notes inside a system
const getNotePosition = (
  _measureIndex: number, 
  noteIndex: number, 
  measureNotes: NoteData[],
  measureWidth: number,
  measureStartX: number
) => {
  // Pad the measure start and end so notes don't overlap the measure boundaries
  const paddingLeft = 6;
  const paddingRight = 4;
  const usableWidth = measureWidth - paddingLeft - paddingRight;
  
  // Calculate the start beat of each note in the measure
  let totalBeats = 0;
  for (let i = 0; i < noteIndex; i++) {
    totalBeats += measureNotes[i].duration;
  }
  
  // Normal measures have 4 beats (4/4 time). Proportional position:
  const offsetRatio = totalBeats / 4;
  const x = measureStartX + paddingLeft + (offsetRatio * usableWidth);
  return x;
};

// SVG Treble Clef Path (scaled and repositioned)
const trebleClefPath = "M12.1,38.2 C11.5,35.7 10.8,33.4 10.2,31.2 C14.2,27.4 17.4,22.4 17.5,14.3 C17.5,10.1 17.0,5.0 13.0,-0.5 C11.8,-2.1 9.6,-2.5 7.9,-1.4 C4.0,1.2 0.0,7.5 0.0,15.5 C0.0,19.3 0.7,23.7 1.8,28.4 C1.0,29.0 0.1,29.6 -0.8,30.3 C-7.1,34.7 -15.0,40.2 -15.0,53.0 C-15.0,67.1 -3.6,75.5 7.5,75.5 C9.7,75.5 11.7,75.3 13.7,74.8 C13.7,75.1 13.7,75.3 13.7,75.5 C13.7,78.3 11.4,80.5 8.7,80.5 C7.4,80.5 6.1,80.0 5.2,79.0 L-0.2,84.3 C2.2,86.7 5.3,88.0 8.7,88.0 C15.6,88.0 21.2,82.4 21.2,75.5 C21.2,74.4 21.1,73.2 21.0,72.0 C26.5,68.6 30.0,63.2 30.0,56.8 C30.0,46.7 22.1,38.5 12.1,38.2 Z M9.2,8.3 C9.9,10.2 10.0,12.1 10.0,14.2 C10.0,17.4 9.3,19.9 8.1,21.9 C7.7,19.6 7.5,17.4 7.5,15.5 C7.5,12.6 8.3,10.2 9.2,8.3 Z M7.5,68.0 C0.2,68.0 -7.5,62.7 -7.5,53.0 C-7.5,44.1 -2.7,40.7 3.5,36.4 C3.6,36.3 3.7,36.3 3.8,36.2 C4.1,37.3 4.4,38.5 4.8,39.7 C-0.1,42.3 -3.8,47.5 -3.8,53.0 C-3.8,56.3 -2.5,59.5 -0.2,61.8 L5.2,56.5 C4.2,55.6 3.7,54.3 3.7,53.0 C3.7,50.9 5.1,48.6 7.0,47.2 C7.1,47.2 7.2,47.4 7.2,47.6 C9.3,54.6 11.4,61.6 12.6,67.4 C11.1,67.8 9.3,68.0 7.5,68.0 Z M19.5,63.7 C18.2,58.2 16.4,52.2 14.5,46.0 C19.1,47.4 22.5,51.7 22.5,56.8 C22.5,60.7 21.3,64.2 19.5,63.7 Z";

// Trigger PDF Generation
const handleDownloadPdf = () => {
  const element = document.getElementById('music-print-container');
  if (!element) return;

  savePdfFromElement(element, `${sheetTitle.value || '乐谱'}.pdf`, { paperHeightMm: 296.6 });
};

const handleDownloadImage = () => {
  const element = document.getElementById('music-print-container');
  if (!element) return;

  saveImageFromElement(element, `${sheetTitle.value || '乐谱'}.png`, { paperHeightMm: 296.6 });
};

const handlePrint = () => {
  printElement('music-print-container', sheetTitle.value, { paperHeightMm: 297 });
};
</script>

<template>
  <div class="music-generator-view">
    <!-- Settings Panel -->
    <a-card class="settings-panel no-print" :bordered="false" :title="t('common.settings')">
      <a-form layout="vertical">
        <a-form-item :label="t('generatorSettings.categoryOptions')">
          <a-radio-group v-model:value="formState.sheetType" option-type="button" button-style="solid">
            <a-radio-button value="staff">{{ t('options.staff') }}</a-radio-button>
            <a-radio-button value="grand">{{ t('options.grand') }}</a-radio-button>
            <a-radio-button value="guitar">{{ t('options.guitar') }}</a-radio-button>
            <a-radio-button value="ukulele">{{ t('options.ukulele') }}</a-radio-button>
            <a-radio-button value="numbered">{{ t('options.numbered') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.contentMode')">
          <a-radio-group v-model:value="formState.contentMode" option-type="button" button-style="solid">
            <a-radio-button value="blank">{{ t('options.blankSheet') }}</a-radio-button>
            <a-radio-button value="song">{{ t('options.classicSongs') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="formState.contentMode === 'song'" :label="t('generatorSettings.selectSong')">
          <a-select v-model:value="formState.selectedSong" :placeholder="t('generatorSettings.selectSongPlaceholder')">
            <a-select-option value="twinkle">{{ t('songOptions.twinkle') }}</a-select-option>
            <a-select-option value="ode-to-joy">{{ t('songOptions.odeToJoy') }}</a-select-option>
            <a-select-option value="tigers">{{ t('songOptions.tigers') }}</a-select-option>
            <a-select-option value="jingle-bells">{{ t('songOptions.jingleBells') }}</a-select-option>
            <a-select-option value="painter">{{ t('songOptions.painter') }}</a-select-option>
            <a-select-option value="london-bridge">{{ t('songOptions.londonBridge') }}</a-select-option>
            <a-select-option value="mary">{{ t('songOptions.mary') }}</a-select-option>
            <a-select-option value="red-riding">{{ t('songOptions.redRiding') }}</a-select-option>
            <a-select-option value="birthday">{{ t('songOptions.birthday') }}</a-select-option>
            <a-select-option value="red-river">{{ t('songOptions.redRiver') }}</a-select-option>
            <a-select-option value="new-year">{{ t('songOptions.newYear') }}</a-select-option>
            <a-select-option value="going-home">{{ t('songOptions.goingHome') }}</a-select-option>
            <a-select-option value="bach-minuet">{{ t('songOptions.bachMinuet') }}</a-select-option>
            <a-select-option value="brahms-lullaby">{{ t('songOptions.brahmsLullaby') }}</a-select-option>
            <a-select-option value="schubert-lullaby">{{ t('songOptions.schubertLullaby') }}</a-select-option>
            <a-select-option value="mozart-lullaby">{{ t('songOptions.mozartLullaby') }}</a-select-option>
            <a-select-option value="surprise-sym">{{ t('songOptions.surpriseSym') }}</a-select-option>
            <a-select-option value="auld-lang">{{ t('songOptions.auldLang') }}</a-select-option>
            <a-select-option value="love-dream">{{ t('songOptions.loveDream') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-divider style="margin: 12px 0;" />

        <template v-if="formState.contentMode === 'blank'">
          <a-form-item :label="t('common.mainTitle')">
            <a-input v-model:value="formState.title" :placeholder="t('common.mainTitle')" />
          </a-form-item>
          <a-form-item :label="t('common.subtitle')">
            <a-input v-model:value="formState.subtitle" :placeholder="t('common.subtitle')" />
          </a-form-item>
        </template>
        <template v-else>
          <div class="info-alert" style="margin-bottom: 12px;">
            {{ t('generatorSettings.songModeHint') }}
          </div>
        </template>

        <a-divider style="margin: 12px 0;" />

        <a-form-item v-if="formState.sheetType === 'staff'" :label="t('generatorSettings.clefType')">
          <a-select v-model:value="formState.clefType">
            <a-select-option value="treble">{{ t('options.treble') }}</a-select-option>
            <a-select-option value="bass">{{ t('options.bass') }}</a-select-option>
            <a-select-option value="alto">{{ t('options.alto') }}</a-select-option>
            <a-select-option value="none">{{ t('options.noClef') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.lineSpacing')">
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <a-slider 
              v-model:value="formState.lineSpacing" 
              :min="2.0" 
              :max="4.5" 
              :step="0.1" 
              style="flex-grow: 1; margin: 0 6px;"
            />
            <a-input-number 
              v-model:value="formState.lineSpacing" 
              :min="2.0" 
              :max="4.5" 
              :step="0.1" 
              style="width: 70px; flex-shrink: 0;" 
            />
          </div>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.staffSpacing')">
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <a-slider 
              v-model:value="formState.staffSpacing" 
              :min="10" 
              :max="30" 
              :step="1" 
              style="flex-grow: 1; margin: 0 6px;"
            />
            <a-input-number 
              v-model:value="formState.staffSpacing" 
              :min="10" 
              :max="30" 
              :step="1" 
              style="width: 70px; flex-shrink: 0;" 
            />
          </div>
        </a-form-item>

        <a-form-item :label="t('generatorSettings.lineColor')">
          <a-select v-model:value="formState.lineColor">
            <a-select-option value="dark-gray">{{ t('options.darkGray') }}</a-select-option>
            <a-select-option value="pencil-gray">{{ t('options.pencilGray') }}</a-select-option>
            <a-select-option value="green">{{ t('options.green') }}</a-select-option>
            <a-select-option value="blue">{{ t('options.blue') }}</a-select-option>
            <a-select-option value="brown">{{ t('options.brown') }}</a-select-option>
          </a-select>
        </a-form-item>

        <!-- Guitar/Ukulele chord box display options -->
        <a-form-item v-if="formState.sheetType === 'guitar' || formState.sheetType === 'ukulele'" :label="t('generatorSettings.chordCharts')">
          <a-select v-model:value="formState.showChords">
            <a-select-option value="none">{{ t('options.noChords') }}</a-select-option>
            <a-select-option value="common">{{ t('options.commonChords') }}</a-select-option>
            <a-select-option value="blank">{{ t('options.blankChords') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-divider style="margin: 16px 0;" />
        <div class="action-buttons">
          <a-button type="primary" block size="large" @click="handlePrint">
            <template #icon><PrinterOutlined /></template>
            {{ t('common.print') }}
          </a-button>
          <div class="export-buttons">
            <a-button block size="large" @click="handleDownloadPdf">
              <template #icon><DownloadOutlined /></template>
              {{ t('common.downloadPdf') }}
            </a-button>
            <a-button block size="large" @click="handleDownloadImage">
              <template #icon><DownloadOutlined /></template>
              {{ t('common.downloadImage') }}
            </a-button>
          </div>
        </div>
      </a-form>
    </a-card>

    <!-- Right Paper Workspace Preview -->
    <div class="preview-area scroll-y">
      <div id="music-print-container" class="paper-stack">
        <!-- Render Pages Dynamically -->
        <div 
          v-for="(page, pageIdx) in pages" 
          :key="page.pageIndex" 
          class="paper-container a4-size"
          :class="{ 'has-next-page': pageIdx < pages.length - 1 }"
        >
          <!-- A4 Page Container (internal margins handled in SVG coordinates) -->
          <svg 
            class="a4-svg-canvas" 
            viewBox="0 0 210 297" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Header (Printed only on Page 1) -->
            <g v-if="pageIdx === 0" class="page-header">
              <!-- Title -->
              <text 
                x="105" 
                y="14" 
                text-anchor="middle" 
                font-size="6.8" 
                font-weight="bold" 
                fill="#222222"
                font-family="Georgia, serif"
              >
                {{ sheetTitle }}
              </text>
              <!-- Subtitle -->
              <text 
                v-if="sheetSubtitle"
                x="105" 
                y="19" 
                text-anchor="middle" 
                font-size="3.2" 
                fill="#666666"
                font-family="sans-serif"
              >
                {{ sheetSubtitle }}
              </text>
              <!-- Arranger/Author (right aligned) -->
              <text 
                v-if="sheetAuthor"
                x="195" 
                y="19" 
                text-anchor="end" 
                font-size="3.0" 
                fill="#444444"
                font-family="sans-serif"
              >
                {{ sheetAuthor }}
              </text>

              <!-- Standard key/time signatures for songs -->
              <g v-if="formState.contentMode === 'song'" transform="translate(15, 16.5)" font-size="2.6" fill="#555" font-family="sans-serif">
                <text x="0" y="2.5">Key: {{ songs[formState.selectedSong]?.keySig }}</text>
                <text x="25" y="2.5">Time: {{ songs[formState.selectedSong]?.timeSig }}</text>
              </g>
            </g>

            <!-- Chord Diagrams Grid (at top of Page 1 if active) -->
            <g v-if="page.showChords && (formState.sheetType === 'guitar' || formState.sheetType === 'ukulele')" transform="translate(15, 24)">
              <!-- Draw 6 Chord Boxes -->
              <g 
                v-for="(chord, idx) in presetChords" 
                :key="chord.name"
                :transform="`translate(${idx * 28}, 0)`"
              >
                <!-- Chord Name -->
                <text x="10" y="0" text-anchor="middle" font-size="3.2" font-weight="bold" fill="#333">{{ chord.name }}</text>
                
                <!-- Guitar Chord Box (6 vertical lines, 5 horizontal lines) -->
                <g v-if="formState.sheetType === 'guitar'" transform="translate(2, 3)">
                  <!-- 5 horizontal lines (frets) spaced by 2.6mm -->
                  <line 
                    v-for="f in 5" 
                    :key="f" 
                    x1="0" 
                    :y1="(f-1)*2.6" 
                    x2="15" 
                    :y2="(f-1)*2.6" 
                    stroke="#555555" 
                    :stroke-width="f === 1 ? 0.6 : 0.2" 
                  />
                  <!-- 6 vertical lines (strings) spaced by 3mm -->
                  <line 
                    v-for="s in 6" 
                    :key="s" 
                    :x1="(s-1)*3" 
                    y1="0" 
                    :x2="(s-1)*3" 
                    y2="10.4" 
                    stroke="#555555" 
                    stroke-width="0.2" 
                  />
                  
                  <!-- Chord Fret Dots if common mode -->
                  <template v-if="formState.showChords === 'common'">
                    <g v-for="(fret, strIdx) in chord.guitarFrets" :key="strIdx">
                      <!-- Muted string X -->
                      <text v-if="fret === -1" :x="strIdx*3" y="-1.5" text-anchor="middle" font-size="2.2" fill="#d9534f">x</text>
                      <!-- Open string O -->
                      <text v-else-if="fret === 0" :x="strIdx*3" y="-1.5" text-anchor="middle" font-size="2.2" fill="#5cb85c">o</text>
                      <!-- Press Dot -->
                      <circle v-else :cx="strIdx*3" :cy="(fret - 0.5)*2.6" r="1.0" fill="#2f7d46" />
                    </g>
                  </template>
                </g>

                <!-- Ukulele Chord Box (4 vertical lines, 5 horizontal lines) -->
                <g v-else transform="translate(4, 3)">
                  <!-- 5 horizontal lines (frets) spaced by 2.6mm -->
                  <line 
                    v-for="f in 5" 
                    :key="f" 
                    x1="0" 
                    :y1="(f-1)*2.6" 
                    x2="12" 
                    :y2="(f-1)*2.6" 
                    stroke="#555555" 
                    :stroke-width="f === 1 ? 0.6 : 0.2" 
                  />
                  <!-- 4 vertical lines (strings) spaced by 4mm -->
                  <line 
                    v-for="s in 4" 
                    :key="s" 
                    :x1="(s-1)*4" 
                    y1="0" 
                    :x2="(s-1)*4" 
                    y2="10.4" 
                    stroke="#555555" 
                    stroke-width="0.2" 
                  />
                  
                  <!-- Chord Fret Dots if common mode -->
                  <template v-if="formState.showChords === 'common'">
                    <g v-for="(fret, strIdx) in chord.ukuleleFrets" :key="strIdx">
                      <text v-if="fret === 0" :x="strIdx*4" y="-1.5" text-anchor="middle" font-size="2.2" fill="#5cb85c">o</text>
                      <circle v-else-if="fret > 0" :cx="strIdx*4" :cy="(fret - 0.5)*2.6" r="1.0" fill="#2f7d46" />
                    </g>
                  </template>
                </g>
              </g>
            </g>

            <!-- Render systems/staves inside this page -->
            <g v-for="system in page.systems" :key="system.index" :transform="`translate(${marginX}, ${system.yOffset})`">
              <!-- Grid Background for Numbered Notation (简谱) -->
              <g v-if="formState.sheetType === 'numbered'">
                <!-- Border horizontal lines -->
                <line x1="0" y1="0" :x2="width" y2="0" :stroke="activeColor" stroke-width="0.3" />
                <line x1="0" y1="11" :x2="width" y2="11" :stroke="activeColor" stroke-width="0.15" stroke-dasharray="0.8 0.8" />
                <line x1="0" y1="16" :x2="width" y2="16" :stroke="activeColor" stroke-width="0.35" />
                <!-- Vertical box edges -->
                <line x1="0" y1="0" x2="0" y2="16" :stroke="activeColor" stroke-width="0.4" />
                <line :x1="width" y1="0" :x2="width" y2="16" :stroke="activeColor" stroke-width="0.4" />
                
                <!-- Blank vertical division lines -->
                <g v-if="formState.contentMode === 'blank'">
                  <line 
                    v-for="divIdx in 3" 
                    :key="divIdx" 
                    :x1="(width / 4) * divIdx" 
                    y1="0" 
                    :x2="(width / 4) * divIdx" 
                    y2="16" 
                    :stroke="activeColor" 
                    stroke-width="0.25" 
                  />
                </g>
                <g v-else>
                  <!-- Draw measures in song mode -->
                  <g v-for="(measure, mIdx) in system.measures" :key="mIdx">
                    <!-- Measure division line -->
                    <line 
                      v-if="mIdx > 0"
                      :x1="(width / 4) * mIdx" 
                      y1="0" 
                      :x2="(width / 4) * mIdx" 
                      y2="16" 
                      :stroke="activeColor" 
                      stroke-width="0.3" 
                    />
                    
                    <!-- Render simple numbered notation inside measure -->
                    <g 
                      v-for="(note, nIdx) in measure" 
                      :key="nIdx"
                      :transform="`translate(${getNotePosition(mIdx, nIdx, measure, width/4, (width/4)*mIdx)}, 0)`"
                    >
                      <!-- Number mappings for pitches in C major: C4=1, D4=2, E4=3, F4=4, G4=5, A4=6, B4=7, C5=1+, G3=5- -->
                      <!-- Pitch text -->
                      <text x="0" y="9" text-anchor="middle" font-size="4.2" font-weight="bold" fill="#222">
                        {{ 
                          note.pitch === 'C4' ? '1' :
                          note.pitch === 'D4' ? '2' :
                          note.pitch === 'E4' ? '3' :
                          note.pitch === 'F4' ? '4' :
                          note.pitch === 'G4' ? '5' :
                          note.pitch === 'A4' ? '6' :
                          note.pitch === 'B4' ? '7' :
                          note.pitch === 'C5' ? '1' :
                          note.pitch === 'G3' ? '5' : '1'
                        }}
                      </text>
                      
                      <!-- Dot above for high notes (C5) -->
                      <circle v-if="note.pitch === 'C5'" cx="0" cy="4.2" r="0.4" fill="#222" />
                      <!-- Dot below for low notes (G3) -->
                      <circle v-if="note.pitch === 'G3'" cx="0" cy="10.4" r="0.4" fill="#222" />
                      
                      <!-- Underlines for short notes (0.5 duration gets single line) -->
                      <line v-if="note.duration === 0.5" x1="-2.5" y1="10.8" x2="2.5" y2="10.8" stroke="#222" stroke-width="0.4" />
                      
                      <!-- Dashes to the right for long notes (2 duration gets 1 dash, 4 duration gets 3 dashes) -->
                      <g v-if="note.duration >= 2" transform="translate(5, 7.8)">
                        <line x1="0" y1="0" x2="2.5" y2="0" stroke="#222" stroke-width="0.4" />
                        <line v-if="note.duration >= 4" x1="4" y1="0" x2="6.5" y2="0" stroke="#222" stroke-width="0.4" />
                        <line v-if="note.duration >= 4" x1="8" y1="0" x2="10.5" y2="0" stroke="#222" stroke-width="0.4" />
                      </g>
                      
                      <!-- Lyric text -->
                      <text x="0" y="14.8" text-anchor="middle" font-size="2.6" fill="#555">{{ note.lyric }}</text>
                    </g>
                  </g>
                  
                  <!-- End of line double bar line if last measure of song -->
                  <g v-if="system.measureIndexStart !== undefined && (system.measureIndexStart + system.measures!.length >= songs[formState.selectedSong].measures.length)">
                    <line :x1="width" y1="0" :x2="width" y2="16" :stroke="activeColor" stroke-width="0.8" />
                    <line :x1="width - 1.2" y1="0" :x2="width - 1.2" y2="16" :stroke="activeColor" stroke-width="0.25" />
                  </g>
                </g>
              </g>

              <!-- Standard 5-Line Staff and Clefs -->
              <g v-else-if="formState.sheetType === 'staff'">
                <!-- Draw 5 horizontal lines -->
                <line 
                  v-for="l in 5" 
                  :key="l" 
                  x1="0" 
                  :y1="(l-1)*formState.lineSpacing" 
                  :x2="width" 
                  :y2="(l-1)*formState.lineSpacing" 
                  :stroke="activeColor" 
                  stroke-width="0.22" 
                />
                
                <!-- Start/End vertical staves lines -->
                <line x1="0" y1="0" x2="0" :y2="4*formState.lineSpacing" :stroke="activeColor" stroke-width="0.4" />
                <line :x1="width" y1="0" :x2="width" :y2="4*formState.lineSpacing" :stroke="activeColor" stroke-width="0.4" />

                <!-- Clefs rendering -->
                <g v-if="formState.clefType === 'treble'" transform="translate(2, 0)">
                  <path 
                    :d="trebleClefPath" 
                    :fill="activeColor" 
                    :transform="`translate(2, ${4*formState.lineSpacing - 60 * ((7*formState.lineSpacing)/95)}) scale(${(7*formState.lineSpacing)/95})`"
                  />
                </g>
                <g v-else-if="formState.clefType === 'bass'" :transform="`translate(4, ${formState.lineSpacing - 18 * (formState.lineSpacing/8)}) scale(${formState.lineSpacing/8})`" :fill="activeColor">
                  <!-- Bass Clef Symbol -->
                  <circle cx="12" cy="18" r="2.8" />
                  <path d="M12,18 C12,10 23,8 23,17 C23,26 15,32 10,37" fill="none" :stroke="activeColor" stroke-width="2.2" stroke-linecap="round" />
                  <circle cx="27" cy="14" r="1.6" />
                  <circle cx="27" cy="22" r="1.6" />
                </g>
                <g v-else-if="formState.clefType === 'alto'" :transform="`translate(4, ${2*formState.lineSpacing - 20 * (formState.lineSpacing/8)}) scale(${formState.lineSpacing/8})`" :fill="activeColor">
                  <!-- Alto Clef Symbol -->
                  <rect x="10" y="5" width="2.4" height="30" rx="0.5" />
                  <rect x="13.5" y="5" width="0.8" height="30" />
                  <path d="M14.3,8 C18,8 21.5,11 21.5,15 C21.5,18 19,20 16,20 C19,20 21.5,22 21.5,25 C21.5,29 18,32 14.3,32" fill="none" :stroke="activeColor" stroke-width="1.8" stroke-linecap="round" />
                </g>

                <!-- Measure Lines / Song Rendering -->
                <g v-if="formState.contentMode === 'blank'">
                  <!-- Blank Sheet: Draw simple measure lines in the middle (e.g. 4 measures) -->
                  <line 
                    v-for="mIdx in 3" 
                    :key="mIdx" 
                    :x1="(width / 4) * mIdx" 
                    y1="0" 
                    :x2="(width / 4) * mIdx" 
                    :y2="4*formState.lineSpacing" 
                    :stroke="activeColor" 
                    stroke-width="0.25" 
                  />
                </g>
                <g v-else>
                  <!-- Song Mode: Render Notes -->
                  <g v-for="(measure, mIdx) in system.measures" :key="mIdx">
                    <!-- Measure line -->
                    <line 
                      v-if="mIdx > 0"
                      :x1="(width / 4) * mIdx" 
                      y1="0" 
                      :x2="(width / 4) * mIdx" 
                      :y2="4*formState.lineSpacing" 
                      :stroke="activeColor" 
                      stroke-width="0.3" 
                    />
                    
                    <!-- Loop Notes in Measure -->
                    <g 
                      v-for="(note, nIdx) in measure" 
                      :key="nIdx"
                      :transform="`translate(${getNotePosition(mIdx, nIdx, measure, width/4, (width/4)*mIdx)}, 0)`"
                    >
                      <g v-if="pitchSteps[note.pitch] !== undefined">
                        <!-- Y Offset for pitch relative to top line F5 -->
                        <!-- Pitch step height = step * 0.5 * lineSpacing -->
                        <g :transform="`translate(0, ${pitchSteps[note.pitch] * 0.5 * formState.lineSpacing})`">
                          <!-- 1. Note Head -->
                          <!-- Whole Note -->
                          <ellipse 
                            v-if="note.duration === 4" 
                            cx="0" 
                            cy="0" 
                            :rx="formState.lineSpacing * 0.75" 
                            :ry="formState.lineSpacing * 0.5" 
                            transform="rotate(-15, 0, 0)" 
                            fill="white" 
                            :stroke="activeColor" 
                            stroke-width="0.45" 
                          />
                          <!-- Half Note -->
                          <ellipse 
                            v-else-if="note.duration === 2" 
                            cx="0" 
                            cy="0" 
                            :rx="formState.lineSpacing * 0.65" 
                            :ry="formState.lineSpacing * 0.45" 
                            transform="rotate(-15, 0, 0)" 
                            fill="white" 
                            :stroke="activeColor" 
                            stroke-width="0.4" 
                          />
                          <!-- Quarter Note or shorter -->
                          <ellipse 
                            v-else 
                            cx="0" 
                            cy="0" 
                            :rx="formState.lineSpacing * 0.6" 
                            :ry="formState.lineSpacing * 0.42" 
                            transform="rotate(-15, 0, 0)" 
                            :fill="activeColor" 
                          />

                          <!-- 2. Stem (Not for Whole Note) -->
                          <template v-if="note.duration < 4">
                            <!-- Up stem (for lower notes, step >= 4) -->
                            <line 
                              v-if="pitchSteps[note.pitch] >= 4"
                              :x1="formState.lineSpacing * 0.58" 
                              y1="0" 
                              :x2="formState.lineSpacing * 0.58" 
                              :y2="-formState.lineSpacing * 3.3" 
                              :stroke="activeColor" 
                              stroke-width="0.3" 
                            />
                            <!-- Down stem (for higher notes, step < 4) -->
                            <line 
                              v-else
                              :x1="-formState.lineSpacing * 0.58" 
                              y1="0" 
                              :x2="-formState.lineSpacing * 0.58" 
                              :y2="formState.lineSpacing * 3.3" 
                              :stroke="activeColor" 
                              stroke-width="0.3" 
                            />

                            <!-- 3. Eighth Flag (if duration === 0.5) -->
                            <template v-if="note.duration === 0.5">
                              <!-- Flag on Up Stem -->
                              <path 
                                v-if="pitchSteps[note.pitch] >= 4"
                                :d="`M ${formState.lineSpacing * 0.58} ${-formState.lineSpacing * 3.3} c ${formState.lineSpacing * 0.6} ${formState.lineSpacing * 0.8} ${formState.lineSpacing * 1.2} ${formState.lineSpacing * 1.2} ${formState.lineSpacing * 0.9} ${formState.lineSpacing * 2.4} c -0.15 -0.4 -0.6 -0.7 -0.9 -0.9`" 
                                :fill="activeColor" 
                              />
                              <!-- Flag on Down Stem -->
                              <path 
                                v-else
                                :d="`M ${-formState.lineSpacing * 0.58} ${formState.lineSpacing * 3.3} c ${formState.lineSpacing * 0.6} ${-formState.lineSpacing * 0.8} ${formState.lineSpacing * 1.2} ${-formState.lineSpacing * 1.2} ${formState.lineSpacing * 0.9} ${-formState.lineSpacing * 2.4} c -0.15 0.4 -0.6 0.7 -0.9 0.9`" 
                                :fill="activeColor" 
                                transform="scale(1, -1) translate(0, 0)"
                              />
                            </template>
                          </template>

                          <!-- 4. Dot (if duration === 1.5) -->
                          <circle 
                            v-if="note.duration === 1.5"
                            :cx="formState.lineSpacing * 1.1" 
                            :cy="-formState.lineSpacing * 0.3" 
                            r="0.5" 
                            :fill="activeColor" 
                          />
                        </g>

                        <!-- 5. Ledger Lines (relative to staff, not pitch) -->
                        <g v-for="ledgerStep in getLedgerLines(pitchSteps[note.pitch])" :key="ledgerStep">
                          <line 
                            :x1="-formState.lineSpacing * 1.1" 
                            :y1="ledgerStep * 0.5 * formState.lineSpacing" 
                            :x2="formState.lineSpacing * 1.1" 
                            :y2="ledgerStep * 0.5 * formState.lineSpacing" 
                            :stroke="activeColor" 
                            stroke-width="0.25" 
                          />
                        </g>
                      </g>

                      <!-- Lyric text centered below staff -->
                      <text 
                        v-if="note.lyric"
                        x="0" 
                        :y="4*formState.lineSpacing + 8" 
                        text-anchor="middle" 
                        font-size="2.8" 
                        fill="#333333"
                        font-family="sans-serif"
                      >
                        {{ note.lyric }}
                      </text>
                    </g>
                  </g>

                  <!-- End double bar line -->
                  <g v-if="system.measureIndexStart !== undefined && (system.measureIndexStart + system.measures!.length >= songs[formState.selectedSong].measures.length)">
                    <line :x1="width" y1="0" :x2="width" :y2="4*formState.lineSpacing" :stroke="activeColor" stroke-width="0.8" />
                    <line :x1="width - 1.2" y1="0" :x2="width - 1.2" :y2="4*formState.lineSpacing" :stroke="activeColor" stroke-width="0.25" />
                  </g>
                </g>
              </g>

              <!-- Piano Grand Staff (Treble + Bass pair linked by curly brace) -->
              <g v-else-if="formState.sheetType === 'grand'">
                <!-- System bracket line / brace connector at left -->
                <path 
                  :d="`M -2.5 0 L -4 0 C -6 0 -7.5 4 -7.5 ${4*formState.lineSpacing + 6} C -7.5 ${4*formState.lineSpacing + 8} -6 ${4*formState.lineSpacing + 12} -8.5 ${4*formState.lineSpacing + 12} C -6 ${4*formState.lineSpacing + 12} -5.0 ${4*formState.lineSpacing + 16} -5.0 ${4*formState.lineSpacing + 18} C -5.0 ${2*4*formState.lineSpacing + 12 - 4} -3.5 ${2*4*formState.lineSpacing + 12} -1 ${2*4*formState.lineSpacing + 12} L -2.5 ${2*4*formState.lineSpacing + 12}`" 
                  fill="none" 
                  :stroke="activeColor" 
                  stroke-width="0.5" 
                  stroke-linecap="round"
                />
                
                <!-- Vertical bar lines linking both staves -->
                <line x1="0" y1="0" x2="0" :y2="2*4*formState.lineSpacing + 12" :stroke="activeColor" stroke-width="0.4" />
                <line :x1="width" y1="0" :x2="width" :y2="2*4*formState.lineSpacing + 12" :stroke="activeColor" stroke-width="0.4" />

                <!-- 1. Treble Staff (Top) -->
                <g>
                  <line 
                    v-for="l in 5" 
                    :key="l" 
                    x1="0" 
                    :y1="(l-1)*formState.lineSpacing" 
                    :x2="width" 
                    :y2="(l-1)*formState.lineSpacing" 
                    :stroke="activeColor" 
                    stroke-width="0.22" 
                  />
                  <!-- Treble Clef -->
                  <g transform="translate(2, 0)">
                    <path 
                      :d="trebleClefPath" 
                      :fill="activeColor" 
                      :transform="`translate(2, ${4*formState.lineSpacing - 60 * ((7*formState.lineSpacing)/95)}) scale(${(7*formState.lineSpacing)/95})`"
                    />
                  </g>
                </g>

                <!-- 2. Bass Staff (Bottom) - Offset by 4*lineSpacing + 12mm -->
                <g :transform="`translate(0, ${4*formState.lineSpacing + 12})`">
                  <line 
                    v-for="l in 5" 
                    :key="l" 
                    x1="0" 
                    :y1="(l-1)*formState.lineSpacing" 
                    :x2="width" 
                    :y2="(l-1)*formState.lineSpacing" 
                    :stroke="activeColor" 
                    stroke-width="0.22" 
                  />
                  <!-- Bass Clef -->
                  <g :transform="`translate(4, ${formState.lineSpacing - 18 * (formState.lineSpacing/8)}) scale(${formState.lineSpacing/8})`" :fill="activeColor">
                    <circle cx="12" cy="18" r="2.8" />
                    <path d="M12,18 C12,10 23,8 23,17 C23,26 15,32 10,37" fill="none" :stroke="activeColor" stroke-width="2.2" stroke-linecap="round" />
                    <circle cx="27" cy="14" r="1.6" />
                    <circle cx="27" cy="22" r="1.6" />
                  </g>
                </g>

                <!-- Measure Lines & Notation Rendering -->
                <g v-if="formState.contentMode === 'blank'">
                  <!-- Blank: standard vertical divider lines linking both staves -->
                  <line 
                    v-for="mIdx in 3" 
                    :key="mIdx" 
                    :x1="(width / 4) * mIdx" 
                    y1="0" 
                    :x2="(width / 4) * mIdx" 
                    :y2="2*4*formState.lineSpacing + 12" 
                    :stroke="activeColor" 
                    stroke-width="0.25" 
                  />
                </g>
                <g v-else>
                  <!-- Song Mode: Render Notes on Treble Staff (Melody) -->
                  <g v-for="(measure, mIdx) in system.measures" :key="mIdx">
                    <!-- Measure line across staves -->
                    <line 
                      v-if="mIdx > 0"
                      :x1="(width / 4) * mIdx" 
                      y1="0" 
                      :x2="(width / 4) * mIdx" 
                      :y2="2*4*formState.lineSpacing + 12" 
                      :stroke="activeColor" 
                      stroke-width="0.3" 
                    />
                    
                    <!-- Render Notes on Treble Staff -->
                    <g 
                      v-for="(note, nIdx) in measure" 
                      :key="nIdx"
                      :transform="`translate(${getNotePosition(mIdx, nIdx, measure, width/4, (width/4)*mIdx)}, 0)`"
                    >
                      <g v-if="pitchSteps[note.pitch] !== undefined">
                        <!-- Note layout on Treble -->
                        <g :transform="`translate(0, ${pitchSteps[note.pitch] * 0.5 * formState.lineSpacing})`">
                          <ellipse 
                            v-if="note.duration === 4" 
                            cx="0" cy="0" 
                            :rx="formState.lineSpacing * 0.75" 
                            :ry="formState.lineSpacing * 0.5" 
                            transform="rotate(-15, 0, 0)" 
                            fill="white" :stroke="activeColor" stroke-width="0.45" 
                          />
                          <ellipse 
                            v-else-if="note.duration === 2" 
                            cx="0" cy="0" 
                            :rx="formState.lineSpacing * 0.65" 
                            :ry="formState.lineSpacing * 0.45" 
                            transform="rotate(-15, 0, 0)" 
                            fill="white" :stroke="activeColor" stroke-width="0.4" 
                          />
                          <ellipse 
                            v-else 
                            cx="0" cy="0" 
                            :rx="formState.lineSpacing * 0.6" 
                            :ry="formState.lineSpacing * 0.42" 
                            transform="rotate(-15, 0, 0)" 
                            :fill="activeColor" 
                          />

                          <!-- Stem -->
                          <template v-if="note.duration < 4">
                            <line 
                              v-if="pitchSteps[note.pitch] >= 4"
                              :x1="formState.lineSpacing * 0.58" y1="0" :x2="formState.lineSpacing * 0.58" :y2="-formState.lineSpacing * 3.3" 
                              :stroke="activeColor" stroke-width="0.3" 
                            />
                            <line 
                              v-else
                              :x1="-formState.lineSpacing * 0.58" y1="0" :x2="-formState.lineSpacing * 0.58" :y2="formState.lineSpacing * 3.3" 
                              :stroke="activeColor" stroke-width="0.3" 
                            />

                            <!-- Flag -->
                            <template v-if="note.duration === 0.5">
                              <path 
                                v-if="pitchSteps[note.pitch] >= 4"
                                :d="`M ${formState.lineSpacing * 0.58} ${-formState.lineSpacing * 3.3} c ${formState.lineSpacing * 0.6} ${formState.lineSpacing * 0.8} ${formState.lineSpacing * 1.2} ${formState.lineSpacing * 1.2} ${formState.lineSpacing * 0.9} ${formState.lineSpacing * 2.4} c -0.15 -0.4 -0.6 -0.7 -0.9 -0.9`" 
                                :fill="activeColor" 
                              />
                              <path 
                                v-else
                                :d="`M ${-formState.lineSpacing * 0.58} ${formState.lineSpacing * 3.3} c ${formState.lineSpacing * 0.6} ${-formState.lineSpacing * 0.8} ${formState.lineSpacing * 1.2} ${-formState.lineSpacing * 1.2} ${formState.lineSpacing * 0.9} ${-formState.lineSpacing * 2.4} c -0.15 0.4 -0.6 0.7 -0.9 0.9`" 
                                :fill="activeColor" 
                              />
                            </template>
                          </template>
                          
                          <!-- Dotted -->
                          <circle v-if="note.duration === 1.5" :cx="formState.lineSpacing * 1.1" :cy="-formState.lineSpacing * 0.3" r="0.5" :fill="activeColor" />
                        </g>

                        <!-- Ledger Lines -->
                        <g v-for="ledgerStep in getLedgerLines(pitchSteps[note.pitch])" :key="ledgerStep">
                          <line 
                            :x1="-formState.lineSpacing * 1.1" :y1="ledgerStep * 0.5 * formState.lineSpacing" :x2="formState.lineSpacing * 1.1" :y2="ledgerStep * 0.5 * formState.lineSpacing" 
                            :stroke="activeColor" stroke-width="0.25" 
                          />
                        </g>
                      </g>

                      <!-- Lyric text below treble staff, inside the system gap -->
                      <text 
                        v-if="note.lyric"
                        x="0" 
                        :y="4*formState.lineSpacing + 7" 
                        text-anchor="middle" 
                        font-size="2.6" 
                        fill="#333333"
                        font-family="sans-serif"
                      >
                        {{ note.lyric }}
                      </text>
                    </g>
                  </g>

                  <!-- End Double Line -->
                  <g v-if="system.measureIndexStart !== undefined && (system.measureIndexStart + system.measures!.length >= songs[formState.selectedSong].measures.length)">
                    <line :x1="width" y1="0" :x2="width" :y2="2*4*formState.lineSpacing + 12" :stroke="activeColor" stroke-width="0.8" />
                    <line :x1="width - 1.2" y1="0" :x2="width - 1.2" :y2="2*4*formState.lineSpacing + 12" :stroke="activeColor" stroke-width="0.25" />
                  </g>
                </g>
              </g>

              <!-- Guitar 6-Line Tab (or Ukulele 4-Line Tab) -->
              <g v-else-if="formState.sheetType === 'guitar' || formState.sheetType === 'ukulele'">
                <!-- Draw staves lines -->
                <line 
                  v-for="l in linesPerStaff" 
                  :key="l" 
                  x1="0" 
                  :y1="(l-1)*formState.lineSpacing" 
                  :x2="width" 
                  :y2="(l-1)*formState.lineSpacing" 
                  :stroke="activeColor" 
                  stroke-width="0.22" 
                />
                
                <!-- Start/End vertical staves lines -->
                <line x1="0" y1="0" x2="0" :y2="(linesPerStaff-1)*formState.lineSpacing" :stroke="activeColor" stroke-width="0.4" />
                <line :x1="width" y1="0" :x2="width" :y2="(linesPerStaff-1)*formState.lineSpacing" :stroke="activeColor" stroke-width="0.4" />

                <!-- TAB Vertical text at start -->
                <g transform="translate(4, 0)" font-family="sans-serif" font-weight="900" :fill="activeColor" text-anchor="middle">
                  <template v-if="formState.sheetType === 'guitar'">
                    <text x="0" :y="formState.lineSpacing * 0.8" font-size="3.5">T</text>
                    <text x="0" :y="formState.lineSpacing * 2.6" font-size="3.5">A</text>
                    <text x="0" :y="formState.lineSpacing * 4.4" font-size="3.5">B</text>
                  </template>
                  <template v-else>
                    <text x="0" :y="formState.lineSpacing * 0.6" font-size="3.5">T</text>
                    <text x="0" :y="formState.lineSpacing * 1.6" font-size="3.5">A</text>
                    <text x="0" :y="formState.lineSpacing * 2.6" font-size="3.5">B</text>
                  </template>
                </g>

                <!-- Measure Dividers -->
                <g v-if="formState.contentMode === 'blank'">
                  <line 
                    v-for="mIdx in 3" 
                    :key="mIdx" 
                    :x1="(width / 4) * mIdx" 
                    y1="0" 
                    :x2="(width / 4) * mIdx" 
                    :y2="(linesPerStaff-1)*formState.lineSpacing" 
                    :stroke="activeColor" 
                    stroke-width="0.25" 
                  />
                </g>
                <g v-else>
                  <!-- Song Mode: Render Notes as fret numbers or blank tabs under melody staves -->
                  <!-- For ease of learning, we render a combined double staff: -->
                  <!-- Top: Melody on 5-line staff -->
                  <!-- Bottom: Guitar/Ukulele Tab lines (6/4 lines) linked together! -->
                  <g v-for="(measure, mIdx) in system.measures" :key="mIdx">
                    <!-- Divider line -->
                    <line 
                      v-if="mIdx > 0"
                      :x1="(width / 4) * mIdx" 
                      y1="0" 
                      :x2="(width / 4) * mIdx" 
                      :y2="(linesPerStaff-1)*formState.lineSpacing" 
                      :stroke="activeColor" 
                      stroke-width="0.3" 
                    />
                    
                    <!-- Simple note/beat guide marks on Tab lines -->
                    <g 
                      v-for="(note, nIdx) in measure" 
                      :key="nIdx"
                      :transform="`translate(${getNotePosition(mIdx, nIdx, measure, width/4, (width/4)*mIdx)}, 0)`"
                    >
                      <!-- Draw a tiny vertical tick for rhythmic indication on the tab lines -->
                      <line x1="0" y1="0" x2="0" :y2="(linesPerStaff-1)*formState.lineSpacing" stroke="#bbbbbb" stroke-dasharray="0.5 0.5" stroke-width="0.2" />
                      
                      <!-- Render Fret Number for Guitar -->
                      <g v-if="formState.sheetType === 'guitar' && guitarPitchMap[note.pitch]">
                        <rect 
                          :x="-1.5" 
                          :y="(guitarPitchMap[note.pitch].string - 1) * formState.lineSpacing - 1.2" 
                          width="3.0" 
                          height="2.4" 
                          fill="white" 
                        />
                        <text 
                          x="0" 
                          :y="(guitarPitchMap[note.pitch].string - 1) * formState.lineSpacing + 0.8" 
                          text-anchor="middle" 
                          font-size="2.6" 
                          font-weight="bold" 
                          fill="#222"
                        >
                          {{ guitarPitchMap[note.pitch].fret }}
                        </text>
                      </g>

                      <!-- Render Fret Number for Ukulele -->
                      <g v-if="formState.sheetType === 'ukulele' && ukulelePitchMap[note.pitch]">
                        <rect 
                          :x="-1.5" 
                          :y="(ukulelePitchMap[note.pitch].string - 1) * formState.lineSpacing - 1.2" 
                          width="3.0" 
                          height="2.4" 
                          fill="white" 
                        />
                        <text 
                          x="0" 
                          :y="(ukulelePitchMap[note.pitch].string - 1) * formState.lineSpacing + 0.8" 
                          text-anchor="middle" 
                          font-size="2.6" 
                          font-weight="bold" 
                          fill="#222"
                        >
                          {{ ukulelePitchMap[note.pitch].fret }}
                        </text>
                      </g>

                      <!-- Lyric text below Tab lines -->
                      <text 
                        v-if="note.lyric"
                        x="0" 
                        :y="(linesPerStaff-1)*formState.lineSpacing + 8" 
                        text-anchor="middle" 
                        font-size="2.8" 
                        fill="#333"
                        font-family="sans-serif"
                      >
                        {{ note.lyric }}
                      </text>
                    </g>
                  </g>

                  <!-- End double bar line -->
                  <g v-if="system.measureIndexStart !== undefined && (system.measureIndexStart + system.measures!.length >= songs[formState.selectedSong].measures.length)">
                    <line :x1="width" y1="0" :x2="width" :y2="(linesPerStaff-1)*formState.lineSpacing" :stroke="activeColor" stroke-width="0.8" />
                    <line :x1="width - 1.2" y1="0" :x2="width - 1.2" :y2="(linesPerStaff-1)*formState.lineSpacing" :stroke="activeColor" stroke-width="0.25" />
                  </g>
                </g>
              </g>
            </g>
            <text
              x="195"
              y="289"
              text-anchor="end"
              font-size="2.65"
              fill="#8a8a8a"
              font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
            >
              向日葵打印　https://sunflower.ccwu.cc
            </text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-generator-view {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f7f5ef;
}

/* Configuration Sidebar */
.settings-panel {
  width: 340px;
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(60, 54, 38, 0.08);
  overflow-y: auto;
  background: #fffdf7;
}

.settings-panel :deep(.ant-card-body) {
  padding: 16px;
}

.scroll-y {
  overflow-y: auto;
  scrollbar-width: thin;
}

.scroll-y::-webkit-scrollbar {
  width: 6px;
}
.scroll-y::-webkit-scrollbar-thumb {
  background: rgba(47, 125, 70, 0.15);
  border-radius: 3px;
}

.settings-panel :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  background: #2f7d46 !important;
  border-color: #2f7d46 !important;
  color: #ffffff !important;
}

.settings-panel :deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover) {
  background: #235d34 !important;
  border-color: #235d34 !important;
  color: #ffffff !important;
}

.settings-panel :deep(.ant-radio-button-wrapper:hover) {
  color: #2f7d46;
}

:deep(.ant-form-item) {
  margin-bottom: 12px;
}

:deep(.ant-form-item-label > label) {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.info-alert {
  background: #f4f9f4;
  border: 1px solid #e2eee2;
  color: #2f7d46;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.action-buttons {
  margin-top: 12px;
}

.action-buttons :deep(.ant-btn-primary) {
  background: #2f7d46;
  border-color: #2f7d46;
}

.action-buttons :deep(.ant-btn-primary:hover) {
  background: #235d34;
  border-color: #235d34;
}

.btn-secondary {
  color: #2f7d46;
  border-color: #2f7d46;
}
.btn-secondary:hover {
  color: #235d34;
  border-color: #235d34;
}

/* Right Paper Workspace Preview */
.preview-area {
  flex: 1;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  background: #f7f5ef;
}

.paper-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  align-items: center;
}

.paper-container {
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(58, 74, 62, 0.08), 0 2px 4px rgba(58, 74, 62, 0.04);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* High Fidelity 210mm x 297mm A4 aspect ratio rendering */
.a4-size {
  width: 210mm;
  height: 297mm;
  min-height: 297mm;
}

.a4-svg-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Mobile Responsiveness */
@media (max-width: 992px) {
  .music-generator-view {
    flex-direction: column;
    overflow: auto;
  }

  .settings-panel {
    width: 100%;
    max-height: none;
    flex-shrink: 0;
  }

  .preview-area {
    width: 100%;
    min-height: 430px;
    padding: 12px;
    overflow: hidden;
    justify-content: center;
    align-items: flex-start;
  }

  .a4-size {
    height: 296mm;
    min-height: 296mm;
  }

  .paper-container {
    flex: 0 0 auto;
    --zoom-factor: 0.85;
    transform: scale(var(--zoom-factor));
    transform-origin: top left;
    margin-right: calc(-210mm * (1 - var(--zoom-factor)));
    margin-bottom: calc(-296mm * (1 - var(--zoom-factor)));
    border-radius: 6px;
  }
}

@media (max-width: 768px) {
  .paper-container {
    --zoom-factor: 0.45;
  }
}

@media (max-width: 480px) {
  .paper-container {
    --zoom-factor: 0.38;
  }
}

/* Print Overrides */
@media print {
  .no-print {
    display: none !important;
  }
  
  .music-generator-view {
    display: block !important;
    background: #fff !important;
    height: auto !important;
    width: auto !important;
    overflow: visible !important;
  }

  .preview-area {
    padding: 0 !important;
    background: #fff !important;
    overflow: visible !important;
    width: auto !important;
    height: auto !important;
    display: block !important;
  }

  .paper-stack {
    display: block !important;
    gap: 0 !important;
    width: 100% !important;
  }

  .paper-container {
    transform: none !important;
    zoom: 1 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 auto !important;
    padding: 0 !important;
    width: 210mm !important;
    height: 296mm !important;
    overflow: hidden !important;
    background: #fff !important;
    page-break-after: avoid;
    break-after: auto;
  }
  
  .paper-container.has-next-page {
    page-break-after: always;
    break-after: page;
  }
}

.paper-stack.exporting {
  display: block !important;
  gap: 0 !important;
  width: 210mm !important;
  margin: 0 auto !important;
  padding: 0 !important;
  background: #fff !important;
  align-items: stretch !important;
}

.paper-stack.exporting .paper-container {
  position: relative !important;
  transform: none !important;
  transform-origin: top left !important;
  zoom: 1 !important;
  width: 210mm !important;
  height: 297mm !important;
  min-height: 297mm !important;
  padding: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  overflow: hidden !important;
  background: #fff !important;
  margin: 0 auto !important;
  margin-right: auto !important;
  margin-bottom: 0 !important;
}

.paper-stack.exporting .paper-container.has-next-page {
  break-after: page;
  page-break-after: always;
}
</style>
