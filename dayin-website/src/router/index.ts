import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/Home.vue'
import GeneratorLayout from '@/layouts/GeneratorLayout.vue'
import GeneratorView from '@/views/Generator.vue'
import ChineseGeneratorView from '@/views/ChineseGenerator.vue'
import EnglishGeneratorView from '@/views/EnglishGenerator.vue'
import NoteGeneratorView from '@/views/NoteGenerator.vue'
import DrawingGeneratorView from '@/views/DrawingGenerator.vue'
import StickerGeneratorView from '@/views/StickerGenerator.vue'
import MusicGeneratorView from '@/views/MusicGenerator.vue'
import FeedbackView from '@/views/Feedback.vue'

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
