import clsx from 'clsx'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { LoaderFunction } from '@remix-run/node'
import { ChevronUpIcon } from '@heroicons/react/solid'
import { Disclosure, Transition } from '@headlessui/react'
import { useLoaderData, useParams } from '@remix-run/react'
import { InformationCircleIcon } from '@heroicons/react/solid'

import Post from '~/components/Post'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { getClub } from '~/models/clubs.server'
import { requireUserId } from '~/session.server'
import { getTopPostByClub } from '~/models/posts.server'
import AreaChart from '~/components/Chart/AreaChart'
import DiscussionSummary from '~/components/DiscussionSummary'
import { getTopDiscussionByClub } from '~/models/discussions.server'
import NextChapterSection from '~/components/NextChapterSection_Old'
import {
  getReadChapters,
  getChaptersReadByDay,
  getNextChapterDetails,
} from '~/models/chapters.server'

interface LoaderData {
  isOwner: boolean
  topPost: FuncType<typeof getTopPostByClub>
  readChapters: FuncType<typeof getReadChapters>
  nextChapter: FuncType<typeof getNextChapterDetails>
  counts: RequiredFuncType<typeof getChaptersReadByDay>
  topDiscussion: FuncType<typeof getTopDiscussionByClub>
}

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)

  const [nextChapter, counts, club, topPost, topDiscussion, readChapters] =
    await Promise.all([
      getNextChapterDetails(userId, params.clubId),
      getChaptersReadByDay(userId, params.clubId),
      getClub(params.clubId, userId),
      getTopPostByClub(params.clubId),
      getTopDiscussionByClub(params.clubId),
      getReadChapters(userId, params.clubId),
    ])

  if (!club) throw new Response('Club not found', { status: 404 })
  if (!counts) throw new Response('Club not found', { status: 404 })

  return json<LoaderData>({
    counts,
    topPost,
    nextChapter,
    readChapters,
    topDiscussion,
    isOwner: club.ownerId === userId,
  })
}

export default function ClubPage() {
  const { clubId } = useParams()
  const { counts, topPost, isOwner, nextChapter, readChapters, topDiscussion } =
    useLoaderData() as LoaderData

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <>
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
                    <TextLink to="." color="default">
                      Edit Club
                    </TextLink>
                    <TextLink to="members/manage" color="default">
                      Manage Members
                    </TextLink>
                    <div className="flex flex-grow items-center justify-end">
                      <TextLink to="." color="rose">
                        Delete Club
                      </TextLink>
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          )}
        </Disclosure>
      )}

      {/* Next Chapter Block */}
      <NextChapterSection chapter={nextChapter} isOwner={isOwner} />

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

      {/* Top Post Block */}
      <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Top Post
        </Text>

        {topPost ? (
          <div className="relative">
            <div
              className={clsx(
                !readChapters.includes(topPost.chapter.id) && 'blur-sm',
              )}
            >
              <Post
                clubId={clubId}
                user={topPost.user}
                chapter={topPost.chapter}
                post={topPost.post}
              />
            </div>
            {!readChapters.includes(topPost.chapter.id) && (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center text-center">
                <Text variant="title2" serif>
                  Spoilers! Catch up to your friends to view this post.
                </Text>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <Text variant="title2" as="p" className="-mt-6" serif>
              No Posts Yet.
            </Text>
          </div>
        )}
      </div>

      {/* Top Discussion Block */}
      <div className="mb-6 border-b border-t-2 border-emerald-400 border-b-background-tertiary bg-gradient-to-b from-emerald-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Hottest Discussion
        </Text>
        {topDiscussion ? (
          <div className="relative">
            <div
              className={clsx(
                !readChapters.includes(topDiscussion.chapter.id) && 'blur-sm',
              )}
            >
              <DiscussionSummary
                user={topDiscussion?.user}
                chapter={topDiscussion?.chapter}
                discussion={topDiscussion?.discussion}
              />
            </div>
            {!readChapters.includes(topDiscussion.chapter.id) && (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center text-center">
                <Text variant="title2" serif>
                  Spoilers! Catch up to your friends to view this post.
                </Text>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <Text variant="title2" as="p" className="-mt-6" serif>
              No Discussions Yet.
            </Text>
          </div>
        )}
      </div>
    </>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
