import { Switch } from '@headlessui/react'
import { LogoutIcon } from '@heroicons/react/outline'
import { useCallback, useEffect, useState } from 'react'
import { Form, Link, useFetcher } from '@remix-run/react'

import { useUser } from '~/utils'
import useWebPushSubscription from '~/hooks/use-web-push-subscription'
import { subscribe as doSubscribe } from '~/utils/notifications.utils'

const BottomNavSection = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const user = useUser()
  const [checked, setChecked] = useState(false)
  const { data, isLoading, refetch } = useWebPushSubscription({
    onSuccess(sub) {
      setChecked(!!sub)
    },
  })

  const subFetcher = useFetcher()
  const unsubFetcher = useFetcher()

  const loading =
    isLoading || subFetcher.state !== 'idle' || unsubFetcher.state !== 'idle'

  useEffect(() => {
    if (subFetcher.type === 'done' && subFetcher.data.ok) {
      refetch()
    }
  }, [refetch, subFetcher])

  const doUnsub = useCallback(() => {
    if (data) data.unsubscribe()
  }, [data])

  useEffect(() => {
    if (unsubFetcher.type === 'done' && unsubFetcher.data.ok) {
      doUnsub()
    }
  }, [doUnsub, refetch, unsubFetcher])

  const unsubscribe = async () => {
    if (data) {
      unsubFetcher.submit(
        {
          endpoint: data.endpoint,
        },
        {
          method: 'delete',
          replace: true,
          action: '/api/subscriptions',
        },
      )
    }
  }

  const subscribe = async () => {
    const subscription = await doSubscribe()
    if (subscription) {
      subFetcher.submit(
        {
          subscription: JSON.stringify(subscription),
        },
        {
          method: 'post',
          replace: true,
          action: '/api/subscriptions',
        },
      )
    }
  }

  return (
    <div className="flex flex-shrink-0 flex-col gap-4 bg-background-primary p-4">
      <Switch.Group>
        <div className="flex items-center justify-between">
          <Switch.Label className="mr-4">Enable notifications</Switch.Label>
          <Switch
            disabled={loading}
            checked={!!checked}
            onChange={val => {
              setChecked(val)
              if (!val) unsubscribe()
              else subscribe()
            }}
            className={`${
              checked ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                checked ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>

      <div className="mx-auto h-px w-11/12 bg-background-tertiary" />

      <div className="flex items-center justify-between">
        <Link
          to={`/users/${user.id}`}
          className="group block flex-shrink-0 flex-grow"
        >
          <button className="w-full" onClick={() => setOpen(false)}>
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-10 w-10 rounded-full"
                  src={user.avatar}
                  alt="User Avatar"
                />
              </div>
              <div className="ml-3 text-left">
                <p className="text-base font-medium text-white">
                  {user.username}
                </p>
                <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                  View profile
                </p>
              </div>
            </div>
          </button>
        </Link>
        <Form action="/logout" method="post">
          <button type="submit">
            <LogoutIcon className="h-7 w-7" />
          </button>
        </Form>
      </div>
    </div>
  )
}

export default BottomNavSection
