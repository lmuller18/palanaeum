import { ActionFunction } from 'remix'

import { prisma } from '~/db.server'
import { sendPush } from '~/utils/notifications.server'
import { createNotification } from '~/utils/notifications.utils'

export const action: ActionFunction = async ({ request }) => {
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

    const notifications: Promise<any>[] = []
    subscriptions.forEach(subscription => {
      notifications.push(sendPush(subscription, notification))
    })
    await Promise.allSettled(notifications)

    return new Response(null, { status: 200 })
  } catch (e) {
    throw new Response(JSON.stringify(e), { status: 500 })
  }
}
