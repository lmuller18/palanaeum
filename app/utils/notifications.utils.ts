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

export async function subscribe() {
  if (!('serviceWorker' in navigator)) {
    console.error('No service worker', navigator)
    return
  }

  console.log('service worker found')

  try {
    const registration = await navigator.serviceWorker.ready

    console.log('service worker ready')

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
