import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { useEffect, useRef } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { forbidden, notFound } from 'remix-utils'
import type { LoaderFunction, ActionFunction } from '@remix-run/node'
import { useFetcher, useLoaderData, useParams } from '@remix-run/react'

import { useUser } from '~/utils'
import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import { getUserByEmail } from '~/models/users.server'
import { requireUser, requireUserId } from '~/session.server'
import { getClubWithUserMembers } from '~/models/clubs.server'
import { notifyNewInvite } from '~/models/notifications.server'
import { createInvite, getInvitesWithInvitee } from '~/models/invites.server'

interface LoaderData {
  members: RequiredFuncType<typeof getClubWithUserMembers>['members']
  invites: FuncType<typeof getInvitesWithInvitee>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)

  invariant(params.clubId, 'expected clubId')

  const [club, invites] = await Promise.all([
    getClubWithUserMembers(params.clubId, userId),
    getInvitesWithInvitee(params.clubId),
  ])

  if (!club) throw notFound({ message: 'Club not found' })

  if (club.ownerId !== userId)
    throw forbidden({ message: 'Not authorized to manage members' })

  return json<LoaderData>({
    members: club.members,
    invites,
  })
}

export default function ManageMembersPage() {
  const data = useLoaderData() as LoaderData

  const inviteRef = useRef<HTMLFormElement>(null)
  const inviteFetcher = useFetcher()

  useEffect(() => {
    if (inviteFetcher.type === 'done' && inviteFetcher.data.ok) {
      inviteRef.current?.reset()
    }
  }, [inviteFetcher])

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
        <inviteFetcher.Form method="post" className="mt-6 flex" ref={inviteRef}>
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
            disabled={inviteFetcher.state === 'submitting'}
            className="ml-4 flex-shrink-0 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send invite
          </button>
        </inviteFetcher.Form>
        {inviteFetcher.type === 'done' ? (
          inviteFetcher.data.ok ? (
            <Text as="p" className="mt-2 ml-2">
              Invite Sent!
            </Text>
          ) : inviteFetcher.data.error ? (
            <Text as="p" className="mt-2 ml-2 text-red-500">
              {inviteFetcher.data.error}
            </Text>
          ) : null
        ) : null}
      </div>
      <div className="mt-10">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-100">
          Club Members
        </h3>
        <ul className="mt-4 divide-y divide-background-tertiary border-t border-b border-background-tertiary">
          {data.members.map(user => (
            <MemberRow key={`member-${user.id}`} user={user} />
          ))}
          {data.invites.map(user => (
            <MemberRow key={`invite-${user.id}`} user={user} invite />
          ))}
        </ul>
      </div>
    </div>
  )
}

const MemberRow = ({
  user,
  invite = false,
}: {
  user: LoaderData['members'][number]
  invite?: boolean
}) => {
  const { id } = useUser()
  const { clubId } = useParams()

  const removeFetcher = useFetcher()

  const remove = () => {
    if (!clubId) return
    if (invite) {
      removeFetcher.submit(
        {
          clubId,
          inviteeId: user.id,
          inviterId: id,
        },
        {
          action: '/api/invites?index',
          method: 'delete',
        },
      )
    } else {
      removeFetcher.submit(
        {
          clubId,
          userId: user.id,
        },
        {
          action: '/api/club/members',
          method: 'delete',
        },
      )
    }
  }

  return (
    <li
      key={user.id}
      className="flex items-center justify-between space-x-3 py-4"
    >
      <div className="flex min-w-0 flex-1 items-center space-x-3">
        <div className="flex-shrink-0">
          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-100">
            {user.username}
          </p>
          <p className="truncate text-sm font-medium text-gray-400">
            {user.id === id ? 'Owner' : invite ? 'Invited' : 'Member'}
          </p>
        </div>
      </div>
      {user.id !== id && (
        <div className="flex-shrink-0">
          <Button
            variant="secondary"
            type="button"
            onClick={remove}
            disabled={removeFetcher.state !== 'idle'}
            // className="inline-flex items-center rounded-full border border-transparent bg-background-secondary py-2 px-3 hover:bg-background-secondary/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <XIcon
              className="-ml-1 mr-0.5 h-5 w-5 text-gray-300"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-gray-100">
              {' '}
              Remove <span className="sr-only">{user.username}</span>{' '}
            </span>
          </Button>
        </div>
      )}
    </li>
  )
}

interface ActionData {
  error?: string
  ok?: boolean
}

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const clubId = params.clubId

  invariant(clubId, 'expected clubId')

  const email = await (await request.formData()).get('email')

  if (typeof email !== 'string' || email.length === 0) {
    return json<ActionData>({ error: 'Email is required.' }, { status: 400 })
  }

  const invitee = await getUserByEmail(email)

  if (!invitee) return json<ActionData>({ error: 'No user found.' })

  const invite = await createInvite({
    clubId,
    inviterId: user.id,
    inviteeId: invitee.id,
  })

  await notifyNewInvite(invite)

  return json({
    ok: true,
  })
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
