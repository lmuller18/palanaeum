import clsx from 'clsx'
import { useState } from 'react'
import { motion } from 'framer-motion'
import invariant from 'tiny-invariant'

import { json, redirect } from '@remix-run/node'
import { ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/solid'
import { Disclosure, Transition } from '@headlessui/react'
import type { LoaderFunctionArgs, ActionFunction } from '@remix-run/node'
import { Form, useParams, useActionData, useLoaderData } from '@remix-run/react'

import {
  getReadChapters,
  getChaptersReadByDay,
  getNextChapterDetails,
} from '~/models/chapters.server'
import Modal from '~/components/Modal'
import Button from '~/elements/Button'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import TextButton from '~/elements/TextButton'
import { requireUserId } from '~/session.server'
import NextChapter from '~/components/NextChapter'
import AreaChart from '~/components/Chart/AreaChart'
import { getTopPostByClub } from '~/models/posts.server'
import { getClub, deleteClub } from '~/models/clubs.server'
import TopConversations from '~/components/TopConversations'
import { getTopDiscussionByClub } from '~/models/discussions.server'
import { getMembersWithProgressByClub } from '~/models/members.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const [
    nextChapter,
    counts,
    club,
    topPost,
    topDiscussion,
    readChapters,
    members,
  ] = await Promise.all([
    getNextChapterDetails(userId, params.clubId),
    getChaptersReadByDay(userId, params.clubId),
    getClub(params.clubId, userId),
    getTopPostByClub(params.clubId),
    getTopDiscussionByClub(params.clubId),
    getReadChapters(userId, params.clubId),
    getMembersWithProgressByClub(params.clubId),
  ])

  if (!club) throw new Response('Club not found', { status: 404 })
  if (!counts) throw new Response('Club not found', { status: 404 })

  return json({
    counts,
    topPost,
    members,
    nextChapter,
    readChapters,
    topDiscussion,
    isOwner: club.ownerId === userId,
  })
}

export default function ClubPage() {
  const { clubId } = useParams()
  const {
    counts,
    topPost,
    isOwner,
    nextChapter,
    readChapters,
    topDiscussion,
    members,
  } = useLoaderData<typeof loader>()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const openDeleteModal = () => setDeleteOpen(true)

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <div>
      {/* Owner Actions */}
      {isOwner && (
        <Disclosure>
          {({ open }) => (
            <div className="mb-6 w-full overflow-hidden rounded-lg bg-background-secondary">
              <Disclosure.Button className="flex w-full justify-between p-4">
                <div className="flex items-center gap-3">
                  <InformationCircleIcon
                    className="mt-[2px] h-5 w-5 text-blue-400"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-blue-400">
                    Admin Actions
                  </span>
                </div>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-white`}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="bg-background-secondary p-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <TextLink to="manage" color="default">
                      Edit Club
                    </TextLink>
                    <TextLink to="members/manage" color="default">
                      Manage Members
                    </TextLink>
                    <div className="flex flex-grow items-center justify-end">
                      <TextButton onClick={openDeleteModal} color="rose">
                        Delete Club
                      </TextButton>
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          )}
        </Disclosure>
      )}

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {/* Next Chapter Block */}
        <div className="mb-6 border-b border-t-2 border-emerald-500 border-b-background-tertiary bg-gradient-to-b from-teal-400/10 p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <Text variant="title2" as="h3">
              Next Chapter
            </Text>
            <TextLink to="chapters" variant="caption">
              More Chapters
            </TextLink>
          </div>
          <NextChapter chapter={nextChapter} />
        </div>

        {/* Chart Block */}
        <div className="mb-6 border-b border-t-2 border-indigo-500 border-b-background-tertiary bg-gradient-to-b from-indigo-400/10 via-transparent">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231e222a' fill-opacity='1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            <div className="px-4 pt-4">
              <Text variant="title2" as="h3" className="mb-3">
                Reading Trajectory
              </Text>
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <Text variant="title1">{counts.read}</Text>{' '}
                  <Text variant="subtitle1">Chapters</Text>
                </div>
                <div>
                  <Text variant="caption">{counts.remaining} Remaining</Text>
                </div>
              </div>
            </div>
            <div className="h-52">
              <AreaChart
                data={counts.countsByDay}
                disabled={
                  !counts.countsByDay ||
                  counts.countsByDay.length === 0 ||
                  counts.read === 0
                }
              />
            </div>
          </div>
        </div>

        {/* Member Progress Block */}
        <div className="mb-6 border-b border-t-2 border-pink-500 border-b-background-tertiary bg-gradient-to-b from-pink-300/10 via-transparent p-4">
          <Text variant="title2" as="h3" className="mb-4">
            Member Progress
          </Text>
          <div className="flex flex-col gap-4">
            {members.map(m => (
              <div key={m.user.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={m.user.avatar}
                      className="mr-3 h-7 w-7 overflow-hidden rounded-full"
                      alt={`${m.user.username} avatar`}
                    />

                    <Text variant="body1">{m.user.username}</Text>
                  </div>

                  <div>
                    <Text
                      variant="caption"
                      className="tracking-widest text-gray-100/70"
                    >
                      {m.chapterCount} / {counts.total}
                    </Text>
                  </div>
                </div>
                <div className="mx-4 flex flex-auto rounded-full bg-background-tertiary">
                  <motion.div
                    className={clsx(
                      'h-2 flex-none rounded-l-full  bg-pink-600/70',
                      m.chapterCount === counts.total
                        ? 'rounded-r-full'
                        : 'rounded-r-[1px]',
                    )}
                    animate={{
                      width: `${(m.chapterCount / counts.total) * 100}%`,
                    }}
                  />
                  <motion.div className="-my-[0.3125rem] ml-0.5 h-[1.125rem] w-1 rounded-full bg-pink-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Conversatinos Block */}
        <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 p-4">
          <TopConversations
            readChapters={readChapters}
            topDiscussion={topDiscussion}
            topPost={topPost}
          />
        </div>

        <DeleteClubModal open={deleteOpen} setOpen={setDeleteOpen} />
      </div>
    </div>
  )
}

const DeleteClubModal = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const actionData = useActionData() as ActionData

  const onClose = () => setOpen(false)

  return (
    <Modal
      open={open}
      onClose={onClose}
      scaleBackground
      backdropColor="rgba(244,63,94,0.7)"
    >
      <div className="flex flex-col pt-3">
        <div className="px-3 pb-4 shadow-sm">
          <div className="relative mt-2 text-center">
            <span className="font-medium">Delete Club</span>
            <div className="absolute inset-y-0 right-0">
              <button
                type="button"
                className="mr-1 text-blue-500 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Form
            method="delete"
            noValidate
            className="flex flex-col gap-6 p-2 text-center"
          >
            <div className="px-4">
              <Text as="p">
                Are you sure you want to delete this club and all related
                discussions and posts?
              </Text>
            </div>
            <div>
              <Button name="_action" variant="warning" fullWidth>
                Delete Club
              </Button>
              {actionData?.errors?.delete && (
                <div className="pt-1 text-red-500" id="delete-error">
                  {actionData.errors.delete}
                </div>
              )}
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

type ActionData =
  | {
      errors: {
        delete?: string
      }
      success?: never
    }
  | { errors?: never; success: true }

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  const { clubId } = params

  invariant(clubId, 'expected clubId')

  const method = request.method.toLowerCase()

  switch (method) {
    case 'delete': {
      const club = await getClub(clubId, userId)

      if (!club)
        return json<ActionData>(
          { errors: { delete: 'Error deleting club' } },
          { status: 404 },
        )
      if (club.ownerId !== userId)
        return json<ActionData>(
          { errors: { delete: 'Not allowed to delete club' } },
          { status: 400 },
        )

      try {
        await deleteClub(clubId)
        return redirect('/clubs')
      } catch {
        return json<ActionData>(
          { errors: { delete: 'Error deleting club' } },
          { status: 500 },
        )
      }
    }

    default:
      throw new Response('Invalid method', { status: 405 })
  }
}
