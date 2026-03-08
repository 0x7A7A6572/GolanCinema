
import { createApp } from 'vue'
import App from './views/App.vue'

console.log('[Golan] Content script loaded')

/**
 * Mount the Vue app to the DOM.
 */
function mountApp() {
  const container = document.createElement('div')
  container.id = 'golan-cinema-root'
  document.body.appendChild(container)
  const app = createApp(App)
  app.mount(container)
}

mountApp()
