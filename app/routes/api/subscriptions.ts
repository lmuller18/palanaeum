import invariant from 'tiny-invariant'

import { json } from '@remix-run/node'
import type { ActionArgs } from '@remix-run/node'

import {
  createNewSubscription,
  removeSubscriptionsByUser,
} from '~/models/subscriptions.server'
import { requireUserId } from '~/session.server'
import { getErrorMessage, parseStringFormData } from '~/utils'
import { toWebNotification } from '~/utils/notifications.utils'

export const action = async ({ request }: ActionArgs) => {
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

        await removeSubscriptionsByUser(endpoint, userId)

        return json({ ok: true })
      } catch (error) {
        return json({ error: getErrorMessage(error) }, { status: 500 })
      }
    default:
      throw new Response('Invalid method', { status: 405 })
  }
}
