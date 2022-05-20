import invariant from 'tiny-invariant'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import { json, Link, LoaderFunction, useLoaderData } from 'remix'

import { toRelative } from '~/utils'
import { prisma } from '~/db.server'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import DiscussionReplyComposer from '~/components/DiscussionReplyComposer'

interface Comment {
  id: string
  content: string

  parentId: string | null
  rootId: string | null
  discussionId: string
  replies: Comment[]
}

interface LoaderData {
  discussion: {
    id: string
    title: string
    content: string | null
    image: string | null
    createdAt: Date

    comments: Comment[]
    user: {
      id: string
      username: string
      avatar: string
    }
  }
  chapter: {
    id: string
    clubId: string
    title: string
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.discussionId, userId)

  const discussionData = await getDiscussion(params.discussionId, userId)

  if (!discussionData)
    throw new Response('Discussion Not Found', { status: 404 })

  return json<LoaderData>(discussionData)
}

export default function DiscussionPage() {
  const data = useLoaderData<LoaderData>()

  return (
    <>
      <div className="mb-4 bg-background-secondary">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-4">
          <TextLink
            to={`/clubs/${data.chapter.clubId}/chapters/${data.chapter.id}`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </TextLink>
          <TextLink
            variant="title2"
            className="block"
            to={`/clubs/${data.chapter.clubId}/chapters/${data.chapter.id}`}
          >
            {data.chapter.title}
          </TextLink>
        </div>
      </div>

      <div className="relative mx-auto max-w-lg px-4">
        <div className="mb-4 flex items-center gap-3">
          <Link
            to={`/user/${data.discussion.user.id}`}
            onClick={e => e.stopPropagation()}
          >
            <img
              className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full object-cover"
              src={data.discussion.user.avatar}
              alt="user avatar"
            />
          </Link>

          <div className="flex flex-col">
            <TextLink to={`/user/${data.discussion.user.id}`} variant="body2">
              {data.discussion.user.username}
            </TextLink>

            <Text variant="caption" className="-mt-1 text-right text-gray-500">
              {toRelative(data.discussion.createdAt)}
            </Text>
          </div>
        </div>

        <Text variant="title3" as="p">
          {data.discussion.title}
        </Text>

        <div
          className="prose prose-sm prose-invert prose-violet clear-both mb-4 max-w-none py-4"
          dangerouslySetInnerHTML={{ __html: data.discussion.content ?? '' }}
        />

        {/* <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <MessageCircle className="h-5 w-5" />
            <Text variant="subtitle1">21</Text>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <HeartIcon className="h-5 w-5" />
            <Text variant="subtitle1">4</Text>
          </div>
        </div> */}

        <DiscussionReplyComposer discussionId={data.discussion.id} />
      </div>
    </>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'

async function getDiscussion(discussionId: string, userId: string) {
  const dbDiscussion = await prisma.discussion.findFirst({
    where: {
      id: discussionId,
      chapter: { club: { members: { some: { userId } } } },
    },
    select: {
      id: true,
      image: true,
      title: true,
      content: true,
      createdAt: true,
      member: {
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
      chapter: {
        select: {
          id: true,
          title: true,
          clubId: true,
        },
      },
    },
  })

  if (!dbDiscussion) return null

  return {
    discussion: {
      id: dbDiscussion.id,
      title: dbDiscussion.title,
      image: dbDiscussion.image,
      content: dbDiscussion.content,
      createdAt: dbDiscussion.createdAt,
      user: {
        id: dbDiscussion.member.user.id,
        avatar: dbDiscussion.member.user.avatar,
        username: dbDiscussion.member.user.username,
      },
      comments: [],
    },
    chapter: {
      id: dbDiscussion.chapter.id,
      title: dbDiscussion.chapter.title,
      clubId: dbDiscussion.chapter.clubId,
    },
  }
}
