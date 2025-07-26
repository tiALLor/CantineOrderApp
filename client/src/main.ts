import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserAuthStore } from './stores/user'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.userAuthStore = useUserAuthStore()
}
