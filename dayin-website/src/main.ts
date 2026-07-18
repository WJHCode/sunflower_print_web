import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Button from 'ant-design-vue/es/button'
import Card from 'ant-design-vue/es/card'
import Checkbox from 'ant-design-vue/es/checkbox'
import ConfigProvider from 'ant-design-vue/es/config-provider'
import Divider from 'ant-design-vue/es/divider'
import Form, { FormItem } from 'ant-design-vue/es/form'
import Input from 'ant-design-vue/es/input'
import InputNumber from 'ant-design-vue/es/input-number'
import Layout, {
  LayoutContent,
  LayoutHeader,
  LayoutSider,
} from 'ant-design-vue/es/layout'
import Menu, { MenuItem } from 'ant-design-vue/es/menu'
import Radio, { RadioButton, RadioGroup } from 'ant-design-vue/es/radio'
import Select, { SelectOption } from 'ant-design-vue/es/select'
import Slider from 'ant-design-vue/es/slider'
import Switch from 'ant-design-vue/es/switch'
import Tag from 'ant-design-vue/es/tag'
import Textarea from 'ant-design-vue/es/input/TextArea'
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
