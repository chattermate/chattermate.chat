import { mergeConfig } from 'vite'
import widgetConfig from './vite.widget.config'

// The widget build, written where the Docker image picks the bundle up.
export default mergeConfig(widgetConfig, {
  build: {
    outDir: '/app/backend-assets',
  },
})
