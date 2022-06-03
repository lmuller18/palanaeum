import { LoaderFunction } from 'remix'
import webpush, { SendResult } from 'web-push'

import { prisma } from '~/db.server'
import { createNotification } from '~/utils/notifications.utils'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const origin = new URL(request.url).origin
    const notification = createNotification({
      title: 'Hey, this is a push notification!',
      data: {
        options: {
          action: 'navigate',
          url: `${origin}/clubs`,
        },
      },
    })

    const subscriptions = await prisma.subscription.findMany()

    const notifications: Promise<SendResult>[] = []
    subscriptions.forEach(subscription => {
      notifications.push(
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          JSON.stringify(notification),
        ),
      )
    })
    await Promise.all(notifications)

    return new Response(null, { status: 200 })
  } catch (e) {
    throw new Response(JSON.stringify(e), { status: 500 })
  }
}
