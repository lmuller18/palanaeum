import { ActionFunction, json } from "@remix-run/node";
import invariant from 'tiny-invariant'

import { getErrorMessage, parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'
import { prisma } from '~/db.server'

interface WebNotification {
  endpoint: string
  expirationTime?: number
  keys: {
    auth: string
    p256dh: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const { subscription } = await parseStringFormData(request)
        invariant(subscription, 'expected subscription')
        const subscriptionObj = toWebNotification(subscription)

        const addedSubscription = await createNewSubscription(
          subscriptionObj,
          userId,
        )

        return json({ ok: true, subscription: addedSubscription })
      } catch (error) {
        return json({ error: getErrorMessage(error) }, { status: 500 })
      }
    case 'delete':
      try {
        const { endpoint } = await parseStringFormData(request)
        invariant(endpoint, 'expected endpoint')

        await removeSubscription(endpoint, userId)

        return json({ ok: true })
      } catch (error) {
        return json({ error: getErrorMessage(error) }, { status: 500 })
      }
    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

async function removeSubscription(endpoint: string, userId: string) {
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

async function createNewSubscription(
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

function toWebNotification(subStr: string): WebNotification {
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
