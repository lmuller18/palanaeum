import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { forbidden, notFound } from 'remix-utils'
import { PlusSmIcon } from '@heroicons/react/solid'
import { Form, useLoaderData } from '@remix-run/react'
import type { LoaderFunction, ActionFunction } from '@remix-run/node'

import { useUser } from '~/utils'
import { prisma } from '~/db.server'
import Text from '~/elements/Typography/Text'
import { sendPush } from '~/utils/notifications.server'
import { requireUser, requireUserId } from '~/session.server'
import { createNotification } from '~/utils/notifications.utils'

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)

  invariant(params.clubId, 'expected clubId')

  const club = await getClub(params.clubId, userId)

  if (!club) throw notFound({ message: 'Club not found' })

  if (club.ownerId !== userId)
    throw forbidden({ message: 'Not authorized to manage members' })

  return json({
    members: club.members,
  })
}

interface LoaderData {
  members: {
    id: string
    avatar: string
    username: string
  }[]
}

export default function ManageMembersPage() {
  const data = useLoaderData() as LoaderData

  const { id } = useUser()

  return (
    <div className="px-4">
      <div>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <Text variant="title3" as="h2" className="mt-2">
            Manage Members
          </Text>
          <Text as="p" variant="body2" className="mt-1 text-sm text-gray-100">
            As club owner, you have permission to add or remove other members.
          </Text>
        </div>
        <Form method="post" className="mt-6 flex">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="block w-full rounded-md border-background-tertiary bg-background-secondary text-white placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter an email"
          />
          <button
            type="submit"
            className="ml-4 flex-shrink-0 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send invite
          </button>
        </Form>
      </div>
      <div className="mt-10">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-100">
          Club Members
        </h3>
        <ul className="mt-4 divide-y divide-background-tertiary border-t border-b border-background-tertiary">
          {data.members.map(user => (
            <li
              key={user.id}
              className="flex items-center justify-between space-x-3 py-4"
            >
              <div className="flex min-w-0 flex-1 items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.avatar}
                    alt=""
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-100">
                    {user.username}
                  </p>
                  <p className="truncate text-sm font-medium text-gray-400">
                    {user.id === id ? 'Owner' : 'Member'}
                  </p>
                </div>
              </div>
              {user.id !== id && (
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-transparent bg-background-secondary py-2 px-3 hover:bg-background-secondary/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <PlusSmIcon
                      className="-ml-1 mr-0.5 h-5 w-5 text-gray-300"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-100">
                      {' '}
                      Invite <span className="sr-only">
                        {user.username}
                      </span>{' '}
                    </span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

interface ActionData {
  errors?: {
    email?: string
  }
  success?: boolean
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const clubId = params.clubId

  invariant(clubId, 'expected clubId')

  const email = await (await request.formData()).get('email')

  if (typeof email !== 'string' || email.length === 0) {
    return json<ActionData>(
      { errors: { email: 'email is required' } },
      { status: 400 },
    )
  }

  const invitee = await findUser(email)

  if (!invitee)
    throw notFound({ message: 'No user found with email: ' + email })

  const invite = await createInvite({
    clubId,
    inviterId: user.id,
    inviteeId: invitee.id,
  })

  await notifyNewInvite(invite)

  return json({
    success: true,
  })
}

async function notifyNewInvite(
  invite: Awaited<ReturnType<typeof createInvite>>,
) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: invite.inviteeId,
    },
  })

  const notification = createNotification({
    title: `New Club Invite: ${invite.club.title}`,
    body: `${invite.inviter.username} invited you to read ${invite.club.title} by ${invite.club.author}`,
    icon: invite.inviter.avatar,
    image: invite.club.image,
    data: {
      options: {
        action: 'navigate',
        url: `/invites`,
      },
    },
  })

  const notifications: Promise<any>[] = []
  subscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, notification))
  })
  return Promise.allSettled(notifications)
}

async function createInvite({
  clubId,
  inviteeId,
  inviterId,
}: {
  clubId: string
  inviterId: string
  inviteeId: string
}) {
  return prisma.clubInvite.upsert({
    where: {
      inviterId_inviteeId_clubId: {
        clubId,
        inviteeId,
        inviterId,
      },
    },
    create: {
      clubId,
      inviteeId,
      inviterId,
    },
    update: {},
    select: {
      club: {
        select: {
          id: true,
          image: true,
          title: true,
          author: true,
        },
      },
      inviter: {
        select: {
          avatar: true,
          id: true,
          username: true,
        },
      },
      inviteeId: true,
    },
  })
}

async function findUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  return user
}

async function getClub(clubId: string, userId: string) {
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      members: { some: { userId } },
    },
    select: {
      ownerId: true,
      members: {
        select: {
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
    },
  })

  if (!club) return null

  return {
    ownerId: club.ownerId,
    members: club.members.map(member => ({
      ...member.user,
    })),
  }
}
