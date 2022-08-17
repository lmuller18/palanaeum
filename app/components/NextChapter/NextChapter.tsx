import { Link, useFetcher } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'

import { pluralize } from '~/utils'
import Button from '~/elements/Button'
import TextLink from '~/elements/TextLink'

interface NextChapterProps {
  chapter: {
    id: string
    title: string
    membersCompleted: number
    totalMembers: number
    status: 'incomplete' | 'not_started'
    postCount: number
    discussionCount: number
  } | null
}

const NextChapter = ({ chapter }: NextChapterProps) => {
  return (
    <div>
      <AnimatePresence initial={false} exitBeforeEnter>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={chapter?.id ?? 'complete'}
          className="flex-grow rounded-lg text-gray-100"
        >
          {chapter ? <UpcomingChapter chapter={chapter} /> : <NoChapter />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface UpcomingChapterProps {
  chapter: NonNullable<NextChapterProps['chapter']>
}

const UpcomingChapter = ({ chapter }: UpcomingChapterProps) => {
  const nextChapterFetcher = useFetcher()

  const state: 'idle' | 'success' | 'error' | 'submitting' =
    nextChapterFetcher.submission
      ? 'submitting'
      : nextChapterFetcher.data?.ok
      ? 'success'
      : nextChapterFetcher.data?.error
      ? 'error'
      : 'idle'

  return (
    <>
      <div className="mb-2 text-3xl font-bold">
        <div className="flex w-fit flex-col gap-1">
          <Link to={`chapters/${chapter.id}`}>{chapter.title}</Link>
        </div>
      </div>

      {chapter.status === 'incomplete' && (
        <div className="mb-2">
          <p className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg">
            Completed by{' '}
            {chapter.membersCompleted === chapter.totalMembers - 1 ? (
              <span className="font-bold">all other members.</span>
            ) : (
              <>
                <span className="text-3xl font-bold">
                  {chapter.membersCompleted}{' '}
                </span>
                of
                <span className="text-3xl font-bold">
                  {' '}
                  {chapter.totalMembers}{' '}
                </span>
                members.
              </>
            )}
          </p>

          {chapter.membersCompleted === chapter.totalMembers - 1 && (
            <p className="mt-2 text-xl font-medium">
              Don't
              <span className="font-bold"> fall behind </span>
              now!
            </p>
          )}
        </div>
      )}

      {chapter.status === 'not_started' && (
        <p className="text-xl font-medium">
          It's a race
          <span className="font-bold"> to be first!</span>
        </p>
      )}

      {(chapter.postCount !== 0 || chapter.discussionCount !== 0) && (
        <div className="border-t border-teal-900">
          <p className="mt-3 text-sm font-medium">
            Conversations waiting for you:
          </p>
          <div className="flex items-center gap-2">
            {chapter.postCount !== 0 && (
              <span className="text-xl font-medium">
                {chapter.postCount}{' '}
                <span className="font-bold">
                  {pluralize('Post', 'Posts', chapter.postCount)}
                </span>
              </span>
            )}

            {chapter.discussionCount !== 0 && (
              <span className="text-xl font-medium">
                {chapter.discussionCount}{' '}
                <span className="font-bold">
                  {pluralize(
                    'Discussion',
                    'Discussions',
                    chapter.discussionCount,
                  )}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      <nextChapterFetcher.Form
        method="post"
        action={`/api/chapters/${chapter.id}/read`}
        className="mt-4 flex items-center justify-between gap-2"
      >
        <Button
          fullWidth
          name="_action"
          value="MARK_READ"
          disabled={state === 'submitting' || state === 'success'}
        >
          {state === 'success' && 'Completed'}
          {state === 'idle' && 'Complete'}
          {state === 'submitting' && 'Completing'}
        </Button>
      </nextChapterFetcher.Form>
    </>
  )
}

const NoChapter = () => (
  <>
    <div className="mb-2 text-3xl font-bold">
      <div className="flex w-fit flex-col gap-1">Book Complete</div>
    </div>

    <p className="font-medium leading-normal">
      Continue participating in{' '}
      <TextLink to="discussions" color="indigo">
        the conversation
      </TextLink>
      .
    </p>
  </>
)

export default NextChapter
