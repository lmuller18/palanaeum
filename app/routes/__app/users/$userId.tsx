import clsx from 'clsx'
import { useState } from 'react'
import { json } from '@remix-run/node'
import { notFound } from 'remix-utils'
import invariant from 'tiny-invariant'
import { useLoaderData } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/node'
import {
  MinusSmIcon,
  ArrowSmUpIcon,
  ArrowSmDownIcon,
} from '@heroicons/react/solid'
import {
  FireIcon,
  BookOpenIcon,
  BookmarkIcon,
  PencilAltIcon,
} from '@heroicons/react/outline'

import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import SheetModal from '~/components/SheetModal'
import { requireUserId } from '~/session.server'
import { getUserById, getUserStats } from '~/models/users.server'

interface LoaderData {
  user: RequiredFuncType<typeof getUserById>
  userStats: RequiredFuncType<typeof getUserStats>
  isProfile: boolean
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.userId, 'expected userId')

  const userId = await requireUserId(request)

  const user = await getUserById(params.userId)

  if (!user) throw notFound({ message: 'User not found' })

  const [userStats] = await Promise.all([getUserStats(user.id)])

  return json<LoaderData>({
    user,
    userStats,
    isProfile: userId === params.userId,
  })
}

export default function ProfilePage() {
  const { user, userStats, isProfile } = useLoaderData() as LoaderData
  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const stats = [
    {
      id: 1,
      name: 'Books Read',
      stat: userStats.bookTotal,
      icon: BookOpenIcon,
      change: userStats.book30Days,
      changeType: userStats.book30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
    {
      id: 2,
      name: 'Chapters Read',
      stat: userStats.chapterTotal,
      icon: BookmarkIcon,
      change: userStats.chapter30Days,
      changeType: userStats.chapter30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
    {
      id: 3,
      name: 'Posts Created',
      stat: userStats.postTotal,
      icon: FireIcon,
      change: userStats.posts30Days,
      changeType: userStats.posts30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
    {
      id: 4,
      name: 'Discussions Created',
      stat: userStats.discussionTotal,
      icon: PencilAltIcon,
      change: userStats.discussions30Days,
      changeType: userStats.discussions30Days ? 'increase' : 'none',
      changeText: 'in the last 30 days',
    },
  ]

  return (
    <div className="mx-auto max-w-lg">
      <div className="h-36 w-full overflow-hidden xs:max-h-64 sm:mt-4 sm:rounded-lg">
        <div
          className={clsx('h-full w-full bg-cover bg-center bg-no-repeat')}
          style={{
            backgroundImage: user.background
              ? `url("${user.background}")`
              : 'url("https://www.tor.com/wp-content/uploads/2016/08/WoK-wallpaper-iphone-horizontal-960x640.jpg")',
            // `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
          }}
        />
      </div>
      <div className="-mt-14 flex items-center justify-between gap-4 px-4 xs:-mt-16">
        <img
          src={user.avatar}
          className="mb-2 h-28 w-28 rounded-full border-[4px] border-background-primary xs:h-32 xs:w-32"
          alt="user avatar"
        />
        {isProfile && (
          <div className="mt-8 pt-4">
            <Button onClick={openModal} type="button" variant="secondary">
              Edit Profile
            </Button>
            <SheetModal open={open} onClose={closeModal}>
              <Button onClick={closeModal}>Close</Button>
            </SheetModal>
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <Text variant="title2">{user.username}</Text>
        </div>

        <div>
          <div>
            <dl className="mt-5 grid grid-cols-1 gap-5">
              {stats.map(item => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-lg bg-background-secondary px-4 py-5 shadow sm:px-6 sm:py-6"
                >
                  <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                      <item.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-300">
                      {item.name}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold">{item.stat}</p>
                    <p
                      className={clsx(
                        item.changeType === 'increase'
                          ? 'text-green-600'
                          : 'text-red-600',
                        'ml-2 flex items-baseline text-sm font-semibold',
                      )}
                    >
                      {item.changeType === 'increase' && (
                        <ArrowSmUpIcon
                          className="h-5 w-5 flex-shrink-0 self-start text-green-500"
                          aria-hidden="true"
                        />
                      )}

                      {item.changeType === 'none' && (
                        <MinusSmIcon
                          className="h-5 w-5 flex-shrink-0 self-start text-gray-500"
                          aria-hidden="true"
                        />
                      )}

                      {item.changeType === 'decrease' && (
                        <ArrowSmDownIcon
                          className="h-5 w-5 flex-shrink-0 self-start text-red-500"
                          aria-hidden="true"
                        />
                      )}

                      <span className="sr-only">
                        {item.changeType === 'increase'
                          ? 'Increased'
                          : 'Decreased'}{' '}
                        by
                      </span>
                      {item.change !== 0 && item.change}
                      <span className="ml-1 text-gray-300">
                        {item.changeText}
                      </span>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
