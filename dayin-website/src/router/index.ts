import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ref } from 'vue'

export const isRouteLoading = ref(false)

const HomeView = () => import('@/views/Home.vue')
const GeneratorLayout = () => import('@/layouts/GeneratorLayout.vue')
const GeneratorView = () => import('@/views/Generator.vue')
const ChineseGeneratorView = () => import('@/views/ChineseGenerator.vue')
const PinyinReadingGeneratorView = () => import('@/views/PinyinReadingGenerator.vue')
const EnglishGeneratorView = () => import('@/views/EnglishGenerator.vue')
const NoteGeneratorView = () => import('@/views/NoteGenerator.vue')
const DrawingGeneratorView = () => import('@/views/DrawingGenerator.vue')
const StickerGeneratorView = () => import('@/views/StickerGenerator.vue')
const MusicGeneratorView = () => import('@/views/MusicGenerator.vue')
const TimetableGeneratorView = () => import('@/views/TimetableGenerator.vue')
const NameCardGeneratorView = () => import('@/views/NameCardGenerator.vue')
const FeedbackView = () => import('@/views/Feedback.vue')
const AboutView = () => import('@/views/About.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/generator',
    name: 'GeneratorLayout',
    component: GeneratorLayout,
    children: [
      {
        path: '',
        name: 'Generator',
        redirect: '/generator/math'
      },
      {
        path: 'math',
        name: 'MathGenerator',
        component: GeneratorView
      },
      {
        path: 'chinese',
        name: 'ChineseGenerator',
        component: ChineseGeneratorView
      },
      {
        path: 'pinyin-reading',
        name: 'PinyinReadingGenerator',
        component: PinyinReadingGeneratorView
      },
      {
        path: 'english',
        name: 'EnglishGenerator',
        component: EnglishGeneratorView
      },
      {
        path: 'note',
        name: 'NoteGenerator',
        component: NoteGeneratorView
      },
      {
        path: 'drawing',
        name: 'DrawingGenerator',
        component: DrawingGeneratorView
      },
      {
        path: 'sticker',
        name: 'StickerGenerator',
        component: StickerGeneratorView
      },
      {
        path: 'music',
        name: 'MusicGenerator',
        component: MusicGeneratorView
      },
      {
        path: 'timetable',
        name: 'TimetableGenerator',
        component: TimetableGeneratorView
      },
      {
        path: 'name-card',
        name: 'NameCardGenerator',
        component: NameCardGeneratorView
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: FeedbackView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(() => {
  isRouteLoading.value = true
})

router.afterEach(() => {
  isRouteLoading.value = false
})

router.onError(() => {
  isRouteLoading.value = false
})

export const preloadCommonRoutes = () => Promise.all([
  import('@/layouts/GeneratorLayout.vue'),
  import('@/views/Generator.vue'),
  import('@/views/ChineseGenerator.vue'),
  import('@/views/PinyinReadingGenerator.vue'),
  import('@/views/TimetableGenerator.vue'),
  import('@/views/NameCardGenerator.vue'),
])

export default router
