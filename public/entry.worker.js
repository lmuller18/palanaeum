async function handleInstall(event) {}
async function handleActivate(event) {}

self.addEventListener('fetch', event => {
  let url = new URL(event.request.url)
  let method = event.request.method

  // any non GET request is ignored
  if (method.toLowerCase() !== 'get') return

  // If the request is for the favicons, fonts, or the built files (which are hashed in the name)
  if (url.pathname.startsWith('/images/')) {
    event.respondWith(
      // we will open the assets cache
      caches.open('assets').then(async cache => {
        // if the request is cached we will use the cache
        let cacheResponse = await cache.match(event.request)
        if (cacheResponse) return cacheResponse

        // if it's not cached we will run the fetch, cache it and return it
        // this way the next time this asset it's needed it will load from the cache
        let fetchResponse = await fetch(event.request)
        cache.put(event.request, fetchResponse.clone())

        return fetchResponse
      }),
    )
  }

  return
})

self.addEventListener('install', event => {
  event.waitUntil(handleInstall(event).then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil(handleActivate(event).then(() => self.clients.claim()))
})

self.addEventListener('push', e => {
  const { title, ...options } = e.data.json()
  self.registration.showNotification(title, options)
})

function firstWindowClient() {
  return self.clients
    .matchAll({ type: 'window' })
    .then(function (windowClients) {
      return windowClients.length
        ? windowClients[0]
        : Promise.reject('No clients')
    })
}

self.addEventListener('notificationclick', function (event) {
  var notification = event.notification

  if (!notification.data?.options) return

  var options = notification.data.options

  // Close the notification if the setting has been set to do so.

  if (options.close) event.notification.close()

  var promise = Promise.resolve()

  // Available settings for |options.action| are:
  //
  //    'default'      First try to focus an existing window for the URL, open a
  //                   new one if none could be found.
  //
  //    'focus-only'   Only try to focus existing windows for the URL, don't do
  //                   anything if none exists.
  //
  //    'message'      Sends a message to all clients about this notification
  //                   having been clicked, with the notification's information.
  //
  //    'open-only'    Do not try to find existing windows, always open a new
  //                   window for the given URL.
  //
  //    'navigate'     Always open a new window for a given URL, which is a
  //                   non-HTTP/HTTPS protocol link.

  if (options.action == 'message') {
    firstWindowClient().then(function (client) {
      var message = 'Clicked on "' + notification.title + '"'
      if (event.action || event.reply) {
        message += ' (action: "' + event.action + '", reply: '
        message += event.reply === null ? 'null' : '"' + event.reply + '"'
        message += ')'
      }
      client.postMessage(message)
    })

    return
  }

  if (options.action == 'default' || options.action == 'focus-only') {
    promise = promise
      .then(function () {
        return firstWindowClient()
      })
      .then(function (client) {
        return client.focus()
      })
    if (options.action == 'default') {
      promise = promise.catch(function () {
        self.clients.openWindow(options.url)
      })
    }
  } else if (options.action == 'open-only') {
    promise = promise.then(function () {
      self.clients.openWindow(options.url)
    })
  } else if (options.action == 'navigate') {
    promise = promise
      .then(() => firstWindowClient())
      .then(client => {
        client.focus()
        if (client && 'navigate' in client) {
          return client.navigate(options.url)
        }
        return
      })
      .catch(() => {
        self.clients.openWindow(options.url)
      })
  }

  event.waitUntil(promise)
})
