import invariant from 'tiny-invariant'

export interface AppNotification extends NotificationOptions {
  title: string
  data: {
    options: {
      action?: 'default' | 'focus-only' | 'message' | 'open-only' | 'navigate'
      close?: boolean
      notificationCloseEvent?: boolean
      url: string
    }
  }
}

export function createNotification(
  notification: AppNotification,
): AppNotification {
  const { data, ...rest } = notification
  return {
    icon: '/images/gradient-logo-192.png',
    badge: '/icons/badge.png',
    ...rest,
    data: {
      ...data,
      options: {
        action: data.options.action ?? 'default',
        close: data.options.close ?? true,
        notificationCloseEvent: data.options.notificationCloseEvent ?? false,
        url: data.options.url,
      },
    },
  }
}

// Copied from the web-push documentation
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  // eslint-disable-next-line no-useless-escape
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function getSubscription() {
  if (!('serviceWorker' in navigator)) {
    console.error('No service worker', navigator)
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    return registration.pushManager.getSubscription()
  } catch (e) {
    console.error('error registering subscription: ', e)
  }
}

export async function subscribe() {
  if (!('serviceWorker' in navigator)) {
    console.error('No service worker', navigator)
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(window.ENV.VAPID_PUBLIC_KEY),
    })

    return subscription
  } catch (e) {
    console.error('error registering subscription: ', e)
  }
}

export interface WebNotification {
  endpoint: string
  expirationTime?: number
  keys: {
    auth: string
    p256dh: string
  }
}

export function toWebNotification(subStr: string): WebNotification {
  let subObj
  try {
    const object = JSON.parse(subStr)
    subObj = object
  } catch (e) {
    throw new Error('Error parsing notification: ' + e)
  }

  if (subObj == null || typeof subObj !== 'object')
    throw new Error('Error parsing web notification: ' + subObj)

  invariant(
    subObj.endpoint && typeof subObj.endpoint === 'string',
    'endpoint expected',
  )
  invariant(subObj.keys, 'keys expected')
  invariant(
    subObj.keys.auth && typeof subObj.keys.auth === 'string',
    'auth expected',
  )
  invariant(
    subObj.keys.p256dh && typeof subObj.keys.p256dh === 'string',
    'p256dh expected',
  )

  let expirationTime = subObj.expirationTime

  if (typeof expirationTime === 'string') {
    const expNumber = Number(expirationTime)
    if (!isNaN(expNumber)) expirationTime = expNumber
  } else if (expirationTime != null) {
    throw new Error('Invalid expiration time: ' + expirationTime)
  }

  return {
    endpoint: subObj.endpoint,
    expirationTime: subObj.expirationTime,
    keys: {
      auth: subObj.keys.auth,
      p256dh: subObj.keys.p256dh,
    },
  }
}
