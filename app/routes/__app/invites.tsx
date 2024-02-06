import type { ReactNode } from 'react'

import {
  XIcon,
  MailIcon,
  TrashIcon,
  CheckIcon,
  DotsVerticalIcon,
} from '@heroicons/react/outline'
import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'

import { useUser } from '~/utils'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '~/components/DropdownMenu'
import TextLink from '~/elements/TextLink'
import { requireUserId } from '~/session.server'
import PageHeader from '~/components/PageHeader'
import { Separator } from '~/components/Separator'
import { ScrollBar, ScrollArea } from '~/components/ScrollArea'
import { getSentInvites, getReceivedInvites } from '~/models/invites.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
  const { receivedInvites, sentInvites } = useLoaderData<typeof loader>()

  const user = useUser()
  const removeFetcher = useFetcher()
  const acceptFetcher = useFetcher()
  const declineFetcher = useFetcher()

  const declineInvite = ({
    inviterId,
    clubId,
  }: {
    inviterId: string
    clubId: string
  }) => {
    declineFetcher.submit(
      {
        inviterId,
        clubId,
      },
      {
        method: 'post',
        action: '/api/invites/decline',
      },
    )
  }

  const acceptInvite = ({
    inviterId,
    clubId,
  }: {
    inviterId: string
    clubId: string
  }) => {
    acceptFetcher.submit(
      {
        inviterId,
        clubId,
      },
      {
        method: 'post',
        action: '/api/invites/accept',
      },
    )
  }

  const removeInvite = ({
    clubId,
    inviteeId,
  }: {
    inviteeId: string
    clubId: string
  }) => {
    removeFetcher.submit(
      {
        clubId,
        inviteeId,
        inviterId: user.id,
      },
      {
        action: '/api/invites?index',
        method: 'delete',
      },
    )
  }

  return (
    <div>
      <PageHeader
        link="."
        title="Club Invites"
        description="Manage sent and received invites to clubs."
        headerImage={
          <div className="relative block w-full max-w-[200px] overflow-hidden">
            <MailIcon className="w-[200px] text-slate-700" />
          </div>
        }
      />

      <div className="content-wrapper my-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Received Invites
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {/* // TODO Copy */}
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        {receivedInvites.length > 0 ? (
          <ScrollArea>
            <div className="flex space-x-4 pb-4">
              {receivedInvites.map((inv, i) => (
                <InviteCard
                  key={`${inv.club.id}-${inv.user.id}-${i}`}
                  author={inv.club.author}
                  id={inv.club.id}
                  image={inv.club.image}
                  title={inv.club.title}
                  user={{
                    id: inv.user.id,
                    avatar: inv.user.avatar,
                    username: inv.user.username,
                  }}
                  menu={
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <DotsVerticalIcon className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-[200px]">
                        <DropdownMenuLabel>Invite Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              acceptInvite({
                                clubId: inv.club.id,
                                inviterId: inv.user.id,
                              })
                            }
                          >
                            <CheckIcon className="mr-2 h-4 w-4" />
                            <span>Accept</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              declineInvite({
                                clubId: inv.club.id,
                                inviterId: inv.user.id,
                              })
                            }
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            <span>Decline</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-200">
            {/* // TODO Copy */}
            Your inbox is currently empty.
          </p>
        )}

        <div className="mt-6 space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Sent Invites
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {/* // TODO Copy */}
            {/* Revisit old favorites and captivating discussions. */}
          </p>
        </div>
        <Separator className="my-4" />
        {sentInvites.length > 0 ? (
          <ScrollArea>
            <div className="flex space-x-4 pb-4">
              {sentInvites.map((inv, i) => (
                <InviteCard
                  key={`${inv.club.id}-${inv.user.id}-${i}`}
                  author={inv.club.author}
                  id={inv.club.id}
                  image={inv.club.image}
                  title={inv.club.title}
                  user={{
                    id: inv.user.id,
                    avatar: inv.user.avatar,
                    username: inv.user.username,
                  }}
                  menu={
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <DotsVerticalIcon className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-[200px]">
                        <DropdownMenuLabel>Invite Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                              removeInvite({
                                clubId: inv.club.id,
                                inviteeId: inv.user.id,
                              })
                            }
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            <span>Remove</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-200">
            {/* // TODO Copy */}
            No pending invites.
          </p>
        )}
      </div>
    </div>
  )
}

const InviteCard = ({
  image,
  title,
  author,
  user,
  menu,
}: {
  id: string
  image: string
  title: string
  author: string
  user: {
    id: string
    username: string
    avatar: string
  }
  menu: ReactNode
}) => {
  return (
    <div className="w-[150px] space-y-3">
      <div className="aspect-book overflow-hidden rounded-md">
        <img
          src={image}
          className="h-full w-full object-cover transition-all hover:scale-105"
          alt={`${title} cover`}
        />
      </div>
      <div className="space-y-1 text-sm">
        <div className="">
          <div className="float-right mt-[2px]">{menu}</div>
          <span className="font-medium leading-none">
            {title} but like actually long
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{author}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <img
            src={user.avatar}
            className="h-5 w-5 overflow-hidden rounded-full"
            alt={user.username}
          />
          {user.username}
        </div>
      </div>
    </div>
  )
}
