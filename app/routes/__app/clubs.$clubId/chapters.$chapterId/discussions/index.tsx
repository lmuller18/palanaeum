import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import DiscussionSummary from '~/components/DiscussionSummary'
import { getDiscussionsByChapter } from '~/models/discussions.server'

interface LoaderData {
  discussions: FuncType<typeof getDiscussionsByChapter>
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  invariant(params.chapterId, 'expected chapterId')

  const discussions = await getDiscussionsByChapter(params.chapterId, userId)

  if (!discussions)
    throw new Response('Problem finding discussions', { status: 500 })

  return json({
    discussions,
  })
}

export default function DiscussionsPage() {
  const { discussions } = useLoaderData() as LoaderData

  const navigate = useNavigate()

  const toChapter = (id: string) => {
    navigate(id)
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <Header size="h4" font="serif">
          Discussions
        </Header>
        <TextLink to="new" color="blue">
          New +
        </TextLink>
      </div>
      <div className="flex flex-col gap-4">
        {discussions.map(d => (
          <button
            onClick={() => toChapter(d.discussion.id)}
            key={d.discussion.id}
            className="block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm"
          >
            <DiscussionSummary {...d} />
          </button>
        ))}
        {!discussions.length && (
          <div className="block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm">
            <Text>
              No discussions yet. Be the first to{' '}
              <TextLink to="new" color="blue">
                start the conversation
              </TextLink>{' '}
              about this chapter.
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}

export const handle = {
  backNavigation: () => '.',
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
