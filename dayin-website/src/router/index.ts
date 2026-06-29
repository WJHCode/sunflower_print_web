import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const HomeView = () => import('@/views/Home.vue')
const GeneratorLayout = () => import('@/layouts/GeneratorLayout.vue')
const GeneratorView = () => import('@/views/Generator.vue')
const ChineseGeneratorView = () => import('@/views/ChineseGenerator.vue')
const EnglishGeneratorView = () => import('@/views/EnglishGenerator.vue')
const NoteGeneratorView = () => import('@/views/NoteGenerator.vue')
const DrawingGeneratorView = () => import('@/views/DrawingGenerator.vue')
const StickerGeneratorView = () => import('@/views/StickerGenerator.vue')
const MusicGeneratorView = () => import('@/views/MusicGenerator.vue')
const FeedbackView = () => import('@/views/Feedback.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
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

export default router
