import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/Home.vue'
import GeneratorLayout from '@/layouts/GeneratorLayout.vue'
import GeneratorView from '@/views/Generator.vue'
import ChineseGeneratorView from '@/views/ChineseGenerator.vue'
import EnglishGeneratorView from '@/views/EnglishGenerator.vue'

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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
