import webpush from 'web-push'
import invariant from 'tiny-invariant'

import type { Subscription } from '@prisma/client'

import { removeSubscription } from '~/models/subscriptions.server'

import type { AppNotification } from './notifications.utils'

// fail early on build
invariant(process.env.VAPID_PUBLIC_KEY, 'VAPID_PUBLIC_KEY must be set')
invariant(process.env.VAPID_PRIVATE_KEY, 'VAPID_PRIVATE_KEY must be set')

export function registerWebPush() {
  // make typescript happy
  invariant(process.env.VAPID_PUBLIC_KEY, 'VAPID_PUBLIC_KEY must be set')
  invariant(process.env.VAPID_PRIVATE_KEY, 'VAPID_PRIVATE_KEY must be set')

  webpush.setVapidDetails(
    'mailto:ardent.palanaeum@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export function sendPush(
  subscription: Subscription,
  notification: AppNotification,
) {
  return webpush
    .sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.auth,
          p256dh: subscription.p256dh,
        },
      },
      JSON.stringify(notification),
    )
    .catch(() => removeSubscription(subscription.endpoint))
}
