import { ActionFunction } from "@remix-run/node";

import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'
import { sendPush } from '~/utils/notifications.server'
import { createNotification } from '~/utils/notifications.utils'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  try {
    const notification = createNotification({
      title: 'Hey, this is a push notification!',
      data: {
        options: {
          action: 'navigate',
          url: '/clubs',
        },
      },
    })

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    })

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
