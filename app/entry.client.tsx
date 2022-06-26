import { hydrate } from 'react-dom'
import { RemixBrowser } from "@remix-run/react";

hydrate(<RemixBrowser />, document)

if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/entry.worker.js', { type: 'module' })
      .then(() => navigator.serviceWorker.ready)
      .catch(error => {
        console.error('Service worker registration failed', error)
      })
  })
}
