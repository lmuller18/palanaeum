import { useQuery } from 'react-query'
import type { UseQueryOptions } from 'react-query'

import { removeEmpty } from '~/utils'
import { getSubscription } from '~/utils/notifications.utils'

type Result = Awaited<ReturnType<typeof getSubscription>>

const useWebPushSubscription = (
  options?: Omit<
    UseQueryOptions<Result, any, Result>,
    'refetchOnReconnect' | 'refetchOnWindowFocus'
  >,
) =>
  useQuery('web-push-subscription', getSubscription, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    ...(options ? removeEmpty(options) : {}),
  })

export default useWebPushSubscription
