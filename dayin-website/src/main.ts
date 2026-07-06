import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Form,
  FormItem,
  Input,
  InputNumber,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Menu,
  MenuItem,
  Radio,
  RadioButton,
  RadioGroup,
  Select,
  SelectOption,
  Slider,
  Switch,
  Tag,
  Textarea,
} from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import router from './router'
import { createPinia } from 'pinia'
import { initClarity } from './utils/clarity'

const app = createApp(App)
const pinia = createPinia()
const antComponents = [
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Form,
  FormItem,
  Input,
  InputNumber,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutSider,
  Menu,
  MenuItem,
  Radio,
  RadioButton,
  RadioGroup,
  Select,
  SelectOption,
  Slider,
  Switch,
  Tag,
  Textarea,
]

initClarity()

antComponents.forEach((component) => {
  app.use(component)
})
app.use(pinia)
app.use(router)

app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error)
    })
  })
}
