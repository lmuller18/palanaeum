import { DateTime } from 'luxon'
import invariant from 'tiny-invariant'
import type { ComponentProps } from 'react'

import { json } from '@remix-run/node'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useParams, useLoaderData } from '@remix-run/react'

import { toLuxonDate } from '~/utils'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import { getTopPostByChapter } from '~/models/posts.server'
import TopConversations from '~/components/TopConversations'
import { getChapterDetails } from '~/models/chapters.server'
import { getCompletedMembersByChapter } from '~/models/members.server'
import { getTopDiscussionByChapter } from '~/models/discussions.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.clubId, 'expected clubId')
  invariant(params.chapterId, 'expected chapterId')
  const userId = await requireUserId(request)

  const [members, chapter, topPost, topDiscussion] = await Promise.all([
    getCompletedMembersByChapter(params.clubId, params.chapterId),
    getChapterDetails(params.chapterId, userId),
    getTopPostByChapter(params.chapterId),
    getTopDiscussionByChapter(params.chapterId),
  ])

  if (!chapter) throw new Response('Chapter not found', { status: 404 })
  if (!members) throw new Response('Error fetching members', { status: 500 })

  return json({ members, chapter, topPost, topDiscussion })
}

export default function ChapterHome() {
  const { clubId } = useParams()
  const { members, chapter, topPost, topDiscussion } =
    useLoaderData<typeof loader>()

  if (!clubId) throw new Error('Club Id Not Found')

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {/* Member Progress Block */}
      <div className="mb-6 border-b border-t-2 border-pink-500 border-b-background-tertiary bg-gradient-to-b from-pink-300/10 via-transparent p-4">
        <Text variant="title2" as="h3" className="mb-4">
          Member Progress
        </Text>
        <div className="flex flex-col divide-y divide-slate-700">
          {members.map(m => (
            <div
              key={m.user.id}
              className="flex flex-col gap-2 py-2 first-of-type:pt-0 last-of-type:pb-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={m.user.avatar}
                    className="mr-3 h-7 w-7 overflow-hidden rounded-full"
                    alt={`${m.user.username} avatar`}
                  />

                  <Text variant="body1">{m.user.username}</Text>
                </div>

                <div className="flex items-center gap-2">
                  <Text
                    variant="caption"
                    className="tracking-widest text-gray-100/70"
                  >
                    {m.progress &&
                      toLuxonDate(m.progress.createdAt).toLocaleString(
                        DateTime.DATE_MED,
                      )}
                  </Text>
                  <ReadIcon
                    read={!!m.progress}
                    className="h-5 w-5 fill-pink-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Conversatinos Block */}
      <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 p-4">
        <TopConversations
          readChapters={chapter.status === 'complete' ? [chapter.id] : []}
          topDiscussion={topDiscussion}
          topPost={topPost}
        />
      </div>
    </div>
  )
}

function ReadIcon({
  read,
  ...props
}: { read: boolean } & ComponentProps<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" {...props}>
      {read ? (
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      ) : (
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      )}
    </svg>
  )
}

export const handle = {
  backNavigation: () => '..',
}
