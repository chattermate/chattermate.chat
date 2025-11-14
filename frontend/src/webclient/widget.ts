import { createApp } from 'vue'
import WidgetBuilder from './WidgetBuilder.vue'
import './widget.css'

// Ensure the environment is defined
// @ts-ignore
if (!window.process) {
  // @ts-ignore
  window.process = { env: { NODE_ENV: 'production' } }
}

// Extract widget ID from URL
const url = new URL(window.location.href)
const widgetId = url.searchParams.get('widget_id') || undefined

const app = createApp(WidgetBuilder, {
  widgetId: widgetId,
})
app.mount('#app')
