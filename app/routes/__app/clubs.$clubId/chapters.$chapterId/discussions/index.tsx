import invariant from 'tiny-invariant'
import { Link } from '@remix-run/react'
import type { LoaderArgs } from '@remix-run/node'
import { BookOpenIcon } from '@heroicons/react/outline'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'

import { pluralize } from '~/utils'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import Container from '~/components/Container'
import FormattedDate from '~/components/FormattedDate'
import { getDiscussionsByChapter } from '~/models/discussions.server'

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.chapterId, 'expected chapterId')

  const discussions = await getDiscussionsByChapter(params.chapterId, userId)

  if (!discussions)
    throw new Response('Problem finding discussions', { status: 500 })

  return typedjson({
    discussions,
  })
}

export default function DiscussionsPage() {
  const { discussions } = useTypedLoaderData<typeof loader>()

  return (
    <div>
      <div className="mt-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold leading-7 text-slate-100">
          Discussions
        </h1>

        <div className="flex items-center gap-4">
          <Link
            to="new"
            className="text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-400 active:text-indigo-600"
          >
            New +
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {discussions.map(d => (
          <DiscussionEntry key={d.discussion.id} data={d} />
        ))}
        {!discussions.length && (
          <div className="mt-6 block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm">
            <Text>
              No discussions yet. Be the first to{' '}
              <TextLink to="new" color="indigo">
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

const DiscussionEntry = ({
  data,
}: {
  data: Awaited<
    ReturnType<Awaited<ReturnType<typeof loader>>['typedjson']>
  >['discussions'][number]
}) => {
  return (
    <article
      aria-labelledby={`discussion-${data.discussion.id}-title`}
      className="py-5 sm:py-6"
    >
      <Container>
        <div className="flex flex-col items-start">
          <h2
            id={`episode-${data.discussion.id}-title`}
            className="text-lg font-bold text-slate-100"
          >
            <Link to={data.discussion.id}>{data.discussion.title}</Link>
          </h2>
          <FormattedDate
            date={new Date(data.discussion.createdAt)}
            className="order-first font-mono text-sm leading-7 text-slate-300"
          />
          <div className="mt-1 flex items-center gap-4">
            <span className="text-sm font-bold leading-6">
              <span className="mr-1 text-indigo-400">
                {data.discussion.replyCount}
              </span>{' '}
              {pluralize('Reply', 'Replies', data.discussion.replyCount)}
            </span>

            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>

            <span className="flex items-center text-sm font-bold leading-6">
              <span className="mr-2 block text-indigo-400">
                <BookOpenIcon className="h-4 w-4" />
              </span>
              {data.chapter.title}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Link
              to={`../chapters/${data.chapter.id}`}
              className="flex items-center text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-300 active:text-indigo-500"
              aria-label={`Chapter for discussion ${data.discussion.title}`}
            >
              View Chapter
            </Link>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>
            <Link
              to={`../chapters/${data.chapter.id}/discussions/${data.discussion.id}`}
              className="flex items-center text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-300 active:text-indigo-500"
              aria-label={`Full discussion for ${data.discussion.title}`}
            >
              View Discussion
            </Link>
          </div>
        </div>
      </Container>
    </article>
  )
}

export const handle = {
  backNavigation: () => '.',
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
