/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import './assets/styles/main.css'
import '@/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import router from './router'
import { initializeFirebase } from './services/firebase'
import { setupPWA } from './pwa/register'
import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

/* Font Awesome imports */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

/* Add icons to the library */
library.add(fas, far, fab)

const savedTheme = localStorage.getItem('cm-theme') ?? 'dark'
const resolvedTheme = savedTheme === 'system'
  ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : savedTheme
document.documentElement.setAttribute('data-theme', resolvedTheme)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('apexchart', VueApexCharts)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(FloatingVue)

initializeFirebase()
setupPWA()

// Initialize GTM only if enterprise module is available
// Cannot use useEnterpriseFeatures() here — runs before Vue app mounts
const enterpriseAnalytics = import.meta.glob('./modules/enterprise/utils/analytics.ts')
if (Object.keys(enterpriseAnalytics).length > 0) {
  Object.values(enterpriseAnalytics)[0]().then((mod: any) => mod.initGTM?.())
}

app.mount('#app')
