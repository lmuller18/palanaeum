import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { useMemo, useState } from 'react'

import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { toRelative } from '~/utils'
import Modal from '~/components/Modal'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import TextButton from '~/elements/TextButton'
import { requireUserId } from '~/session.server'
import type { ThreadedComment } from '~/models/comments.server'
import { getThreadedDiscussion } from '~/models/discussions.server'
import CommentReplyComposer from '~/components/CommentReplyComposer'
import DiscussionReplyComposer from '~/components/DiscussionReplyComposer'

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.discussionId, userId)

  const discussion = await getThreadedDiscussion(params.discussionId, userId)

  if (!discussion) throw new Response('Discussion Not Found', { status: 404 })

  return json({ discussion })
}

export default function DiscussionPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Link
          to={`/users/${data.discussion.user.id}`}
          onClick={e => e.stopPropagation()}
        >
          <img
            className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full object-cover"
            src={data.discussion.user.avatar}
            alt="user avatar"
          />
        </Link>

        <div className="flex flex-col">
          <TextLink to={`/users/${data.discussion.user.id}`} variant="body2">
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

      <div className="mt-4">
        {data.discussion.comments.map(comment => (
          <ThreadedCommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  )
}

const ThreadedCommentItem = ({ comment }: { comment: ThreadedComment }) => {
  const [open, setOpen] = useState(false)

  const isRoot = comment.parentId == null

  const nestedComments = useMemo(
    () =>
      (comment.replies || [])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map(comment => {
          return <ThreadedCommentItem key={comment.id} comment={comment} />
        }),
    [comment.replies],
  )

  return (
    <>
      <div
        className={clsx(
          'grid overflow-hidden pt-2',
          isRoot ? 'grid-cols-[32px,1fr]' : 'grid-cols-[24px,1fr]',
        )}
      >
        <div className="mt-[5px] flex flex-col">
          <Link to={`/users/${comment.user.id}`} className="flex-shrink-0">
            <img
              src={comment.user.avatar}
              className={clsx(
                'rounded-full object-cover',
                isRoot ? 'h-8 w-8' : 'h-6 w-6',
              )}
              alt={`${comment.user.username} avatar`}
            />
          </Link>

          <div className="mt-1 flex flex-grow">
            <ThreadLine />
          </div>
        </div>

        <div className="ml-2">
          <TextLink
            underline
            variant="caption"
            to={`/users/${comment.user.id}`}
          >
            {comment.user.username}
          </TextLink>

          <Text variant="caption" className="ml-2 text-gray-500">
            {toRelative(comment.createdAt)}
          </Text>

          <div
            className="prose prose-sm prose-invert prose-violet max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />

          <div>
            <TextButton
              variant="caption"
              underline
              type="button"
              onClick={() => setOpen(true)}
            >
              Reply
            </TextButton>
          </div>
        </div>

        <ThreadLine />

        {nestedComments.length > 0 && (
          <div className="col-start-2">
            <div>{nestedComments}</div>
          </div>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col pt-3">
          <div className="px-3 pb-4 shadow-sm">
            <div className="relative mt-2 text-center">
              <span className="font-medium">Reply</span>
              <div className="absolute inset-y-0 right-0">
                <button
                  className="mr-1 text-blue-500 focus:outline-none"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-scroll">
            <div className="p-2">
              <CommentReplyComposer
                discussionId={comment.discussionId}
                parentId={comment.id}
                rootId={comment.rootId ?? comment.id}
                onSubmit={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

const ThreadLine = () => (
  <div className="group flex flex-grow justify-center">
    <div className="w-[2px] bg-background-tertiary group-hover:bg-[#303643]" />
  </div>
)

export const handle = {
  backNavigation: () => 'discussions',
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
