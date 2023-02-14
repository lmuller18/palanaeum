import clsx from 'clsx'
import { DateTime } from 'luxon'
import { Fragment } from 'react'
import type { ReactNode } from 'react'

import {
  TrashIcon as InactiveTrashIcon,
  DotsVerticalIcon,
} from '@heroicons/react/outline'
import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Tab, Menu, Transition } from '@headlessui/react'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { TrashIcon as ActiveTrashIcon } from '@heroicons/react/outline'

import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import { useUser, toLuxonDate } from '~/utils'
import { requireUserId } from '~/session.server'
import { getSentInvites, getReceivedInvites } from '~/models/invites.server'

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const [sentInvites, receivedInvites] = await Promise.all([
    getSentInvites(userId),
    getReceivedInvites(userId),
  ])

  return json({
    sentInvites,
    receivedInvites,
  })
}

export default function InvitesPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="content-wrapper my-4">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-background-secondary/70 p-1">
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
                'focus:outline-none',
                selected
                  ? 'bg-background-tertiary shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
              )
            }
          >
            Received Invites
          </Tab>

          <Tab
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
                'focus:outline-none',
                selected
                  ? 'bg-background-tertiary shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
              )
            }
          >
            Sent Invites
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={clsx(
              'rounded-xl bg-background-tertiary p-3',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
            )}
          >
            <div className="grid gap-4">
              {!data.receivedInvites ||
                (data.receivedInvites.length === 0 && (
                  <div className="flex items-center justify-center py-6">
                    <Text variant="title3" serif>
                      No Invites Found
                    </Text>
                  </div>
                ))}
              {data.receivedInvites.map((inv, i) => (
                <InviteCard
                  key={`${inv.club.id}-${inv.user.id}-${i}`}
                  invite={inv}
                >
                  <InviteActions invite={inv} />
                </InviteCard>
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel
            className={clsx(
              'rounded-xl bg-background-tertiary p-3',
              'focus:outline-none',
            )}
          >
            <div className="grid gap-4">
              {!data.sentInvites ||
                (data.sentInvites.length === 0 && (
                  <div className="flex items-center justify-center py-6">
                    <Text variant="title3" serif>
                      No Invites Found
                    </Text>
                  </div>
                ))}
              {data.sentInvites.map((inv, i) => (
                <SentInviteCard
                  key={`${inv.club.id}-${inv.user.id}-${i}`}
                  invite={inv}
                />
              ))}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

const SentInviteCard = ({
  invite,
}: {
  invite: Serialized<RequiredFuncType<typeof getReceivedInvites>[number]>
}) => {
  const user = useUser()
  const removeFetcher = useFetcher()

  const declineInvite = () => {
    removeFetcher.submit(
      {
        clubId: invite.club.id,
        inviteeId: invite.user.id,
        inviterId: user.id,
      },
      {
        action: '/api/invites?index',
        method: 'delete',
      },
    )
  }

  return (
    <InviteCard
      invite={invite}
      menuItems={[
        {
          activeIcon: (
            <ActiveTrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          ),
          inactiveIcon: (
            <InactiveTrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          ),
          name: 'Remove Invite',
          onClick: () => {
            declineInvite()
          },
        },
      ]}
    />
  )
}

const InviteActions = ({
  invite,
}: {
  invite: Serialized<RequiredFuncType<typeof getReceivedInvites>[number]>
}) => {
  const acceptFetcher = useFetcher()
  const declineFetcher = useFetcher()

  const declineInvite = () => {
    declineFetcher.submit(
      {
        inviterId: invite.user.id,
        clubId: invite.club.id,
      },
      {
        method: 'post',
        action: '/api/invites/decline',
      },
    )
  }

  const acceptInvite = () => {
    acceptFetcher.submit(
      {
        inviterId: invite.user.id,
        clubId: invite.club.id,
      },
      {
        method: 'post',
        action: '/api/invites/accept',
      },
    )
  }

  const isSubmitting =
    acceptFetcher.state !== 'idle' || declineFetcher.state !== 'idle'

  return (
    <div className="mt-4 flex items-center gap-4">
      <Button
        type="button"
        fullWidth
        variant="secondary"
        disabled={isSubmitting}
        onClick={declineInvite}
      >
        {declineFetcher.state !== 'idle' ? 'Declining' : 'Decline'} Invite
      </Button>
      <Button
        type="button"
        fullWidth
        disabled={isSubmitting}
        onClick={acceptInvite}
      >
        {acceptFetcher.state !== 'idle' ? 'Accepting' : 'Accept'} Invite
      </Button>
    </div>
  )
}

const InviteCard = ({
  invite,
  menuItems,
  children,
}: {
  invite: Serialized<RequiredFuncType<typeof getSentInvites>[number]>
  menuItems?: {
    activeIcon: JSX.Element
    inactiveIcon: JSX.Element
    name: string
    onClick: Function
  }[]
  children?: ReactNode
}) => (
  <div className="rounded-lg bg-background-secondary p-4 pt-3">
    <div className="flex items-start justify-between gap-2">
      <Text variant="title3" as="p" className="mb-2 line-clamp-2" serif>
        {invite.club.title}
      </Text>
      {menuItems && <InviteMenu menuItems={menuItems} />}
    </div>

    <div className="grid grid-cols-[1fr,2fr] gap-6">
      <div className="mx-auto aspect-book w-full overflow-hidden rounded-lg shadow-md">
        <img
          className="h-full w-full object-cover"
          src={invite.club.image}
          alt="selected cover"
        />
      </div>
      <div className="flex flex-col justify-between">
        <Text variant="subtitle2" as="p" className="line-clamp-1">
          By {invite.club.author}
        </Text>

        <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
          <Text variant="body2">Chapters</Text>
          <Text variant="caption">{invite.club._count.chapters}</Text>
          <Text variant="body2">Members</Text>
          <Text variant="caption">{invite.club._count.members}</Text>
          <Text variant="body2">Club Created</Text>
          <Text variant="caption">
            {toLuxonDate(invite.club.createdAt).toLocaleString(
              DateTime.DATE_MED,
            )}
          </Text>
        </div>

        <div className="flex flex-col justify-end">
          <Link
            to={`/users/${invite.user.id}`}
            className="flex w-fit items-center justify-start gap-2"
          >
            <img
              src={invite.user.avatar}
              className="h-10 w-10 flex-shrink-0 rounded-full"
              alt={`${invite.user.username} avatar`}
            />
            <div>
              <Text as="p" variant="subtitle2">
                {invite.user.username}
              </Text>
            </div>
          </Link>
        </div>
      </div>
    </div>
    {children}
  </div>
)

const InviteMenu = ({
  menuItems,
}: {
  menuItems: {
    activeIcon: JSX.Element
    inactiveIcon: JSX.Element
    name: string
    onClick: Function
  }[]
}) => (
  <Menu as="div" className="relative inline-block text-left">
    <div>
      <Menu.Button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
        <DotsVerticalIcon className="mt-[5px] h-5 w-5" />
      </Menu.Button>
    </div>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="px-1 py-1 ">
          {menuItems.map(item => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-violet-500 text-white' : 'text-gray-100'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={() => item.onClick()}
                >
                  {active ? item.activeIcon : item.inactiveIcon}
                  {item.name}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Transition>
  </Menu>
)
