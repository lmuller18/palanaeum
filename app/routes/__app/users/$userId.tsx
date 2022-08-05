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
  InformationCircleIcon,
  UsersIcon,
} from '@heroicons/react/outline'

import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import SheetModal from '~/components/SheetModal'
import { requireUserId } from '~/session.server'
import { getClubsByUserId } from '~/models/clubs.server'
import { getUserById, getUserStats } from '~/models/users.server'

interface LoaderData {
  user: RequiredFuncType<typeof getUserById>
  userStats: RequiredFuncType<typeof getUserStats>
  clubs: FuncType<typeof getClubsByUserId>
  isProfile: boolean
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.userId, 'expected userId')

  const userId = await requireUserId(request)

  const user = await getUserById(params.userId)

  if (!user) throw notFound({ message: 'User not found' })

  const [userStats, clubs] = await Promise.all([
    getUserStats(user.id),
    getClubsByUserId(user.id),
  ])

  return json<LoaderData>({
    user,
    userStats,
    clubs,
    isProfile: userId === params.userId,
  })
}

type Stat = {
  id: number
  name: string
  stat: number
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
  change: number
  changeType: string
  changeText: string
}

export default function ProfilePage() {
  const { user, userStats, isProfile, clubs } = useLoaderData() as LoaderData
  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

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
        <div className="mb-2 flex items-center justify-between">
          <Text variant="title2">{user.username}</Text>
        </div>

        <div>
          <ClubsSection clubs={clubs} />
          <StatsSection userStats={userStats} />
        </div>
      </div>
    </div>
  )
}

const ClubsSection = ({ clubs }: { clubs: LoaderData['clubs'] }) => {
  return (
    <div>
      <div className="relative mb-4 flex w-full snap-x gap-6 overflow-x-auto rounded-lg bg-background-secondary p-4">
        {[...clubs, ...clubs, ...clubs, ...clubs].map((c, i) => (
          <CoverCard key={c.id + '-' + i} club={c} />
        ))}
      </div>
    </div>
  )
}

const CoverCard = ({ club }: { club: LoaderData['clubs'][number] }) => {
  const [open, setOpen] = useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const stats = [
    {
      id: 1,
      name: 'Chapters',
      stat: 26,
      icon: BookmarkIcon,
    },
    {
      id: 2,
      name: 'Members',
      stat: 4,
      icon: UsersIcon,
    },
    {
      id: 3,
      name: 'Posts',
      stat: 107,

      icon: FireIcon,
    },
    {
      id: 4,
      name: 'Discussions',
      stat: 13,
      icon: PencilAltIcon,
    },
  ]

  return (
    <div className="relative aspect-book h-[260px] w-full max-w-[180px] snap-center">
      <img
        src={club.image}
        alt={`${club.title} cover`}
        className="h-full w-full rounded-lg bg-background-primary object-cover shadow-lg"
      />
      <button
        type="button"
        onClick={openModal}
        className="absolute top-2 right-2 rounded-full bg-black/75 p-[2px]"
      >
        <InformationCircleIcon className="h-4 w-4" />
      </button>
      <SheetModal open={open} onClose={closeModal}>
        <div className="flex flex-col overflow-hidden pt-3">
          <div className="px-3 pb-4 shadow-sm">
            <div className="relative mt-2 text-center">
              <span className="font-medium">Club Details</span>
              <div className="absolute inset-y-0 right-0">
                <button
                  type="button"
                  className="mr-1 text-blue-500 focus:outline-none"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="relative py-6">
            <div
              className="absolute top-0 left-0 right-0 -bottom-6 bg-fixed"
              style={{
                backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(233, 18%, 9%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
              }}
            />
            <div className="relative mx-auto block aspect-book w-full max-w-[200px] overflow-hidden rounded-lg shadow-md ">
              <img
                className="h-full w-full object-cover"
                src={club.image}
                alt={`${club.title} cover`}
              />
            </div>
          </div>
          <div className="relative p-4 pt-0">
            <div className="mb-4">
              <Text as="h3" variant="title1" serif>
                {club.title}
              </Text>
              <Text variant="subtitle1" as="p" className="text-right">
                By {club.author}
              </Text>
            </div>

            <dl className="grid grid-cols-1 gap-5">
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
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </SheetModal>
    </div>
  )
}

const StatsSection = ({
  userStats,
}: {
  userStats: LoaderData['userStats']
}) => {
  const stats: Stat[] = [
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
    <div>
      <dl className="grid grid-cols-1 gap-5">
        {stats.map(item => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-background-secondary px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
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
                  {item.changeType === 'increase' ? 'Increased' : 'Decreased'}{' '}
                  by
                </span>
                {item.change !== 0 && item.change}
                <span className="ml-1 text-gray-300">{item.changeText}</span>
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
