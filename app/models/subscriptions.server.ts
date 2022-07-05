import { prisma } from '~/db.server'
import type { WebNotification } from '~/utils/notifications.utils'

export async function removeSubscription(endpoint: string) {
  return prisma.subscription
    .delete({
      where: { endpoint },
    })
    .catch()
}

export async function removeSubscriptionsByUser(
  endpoint: string,
  userId: string,
) {
  const sub = await prisma.subscription.findFirst({
    where: {
      endpoint,
      userId,
    },
  })

  if (!sub) return null

  return prisma.subscription
    .delete({
      where: { endpoint },
    })
    .catch()
}

export async function createNewSubscription(
  subscription: WebNotification,
  userId: string,
) {
  const dbSubscription = await prisma.subscription.create({
    data: {
      userId,
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
    },
  })

  return dbSubscription
}
