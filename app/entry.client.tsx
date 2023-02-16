import * as React from 'react'
import { hydrateRoot } from 'react-dom/client'

import { RemixBrowser } from '@remix-run/react'

function hydrate() {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RemixBrowser />
      </React.StrictMode>,
    )
  })
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate)
} else {
  window.setTimeout(hydrate, 1)
}

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
