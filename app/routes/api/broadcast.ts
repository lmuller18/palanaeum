import { LoaderFunction } from 'remix'
import webpush, { SendResult } from 'web-push'
import { prisma } from '~/db.server'

export const loader: LoaderFunction = async () => {
  try {
    const notification: NotificationOptions & { title: string } = {
      title: 'Hey, this is a push notification!',
      icon: '/images/gradient-logo-192.png',
    }

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
