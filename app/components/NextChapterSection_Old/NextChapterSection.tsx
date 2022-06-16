import { Link, useFetcher } from 'remix'
import useMeasure from 'react-use-measure'
import { AnimatePresence, motion } from 'framer-motion'

import Button from '~/elements/Button'
import TextLink from '~/elements/TextLink'
import useValueChanged from '~/hooks/use-value-changed'

interface NextChapterSectionProps {
  chapter: {
    id: string
    title: string
    membersCompleted: number
    status: 'incomplete' | 'not_started'
  } | null
  club: {
    id: string
    title: string
  }
  recentDiscussion: {} | null
}

const NextChapterSection = ({ chapter, club }: NextChapterSectionProps) => {
  const chapterChanged = useValueChanged(chapter)
  const [ref, bounds] = useMeasure()

  return (
    <div
      className="relative mx-auto mb-4 flex h-56"
      style={{
        height: bounds.height || 224,
      }}
    >
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={chapterChanged ? { x: '100%' } : false}
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          key={chapter?.id ?? 'complete'}
          data-cy="next-chapter"
          className="absolute w-full flex-grow rounded-lg bg-background-secondary py-8 px-8 text-gray-100 shadow-xl"
        >
          {chapter ? (
            <NextChapter chapter={chapter} club={club} />
          ) : (
            <NoChapter />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface NextChapterProps {
  chapter: {
    id: string
    title: string
    membersCompleted: number
    status: 'incomplete' | 'not_started'
  }
  club: {
    id: string
    title: string
  }
}

const NextChapter = ({ chapter, club }: NextChapterProps) => {
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
      <div className="mb-3 text-3xl font-bold">
        <p className="w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
          Up Next
        </p>

        <div className="flex w-fit flex-col gap-1">
          <Link className="peer" to={`chapters/${chapter.id}`}>
            {chapter.title}
          </Link>
          <div className="h-1 w-full bg-gradient-to-l opacity-0 transition-opacity duration-300  peer-hover:from-fuchsia-300 peer-hover:to-blue-400 peer-hover:opacity-100" />
        </div>
      </div>

      {/* <Slider /> */}

      {chapter.status === 'incomplete' && (
        <>
          <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg">
            Completed by{' '}
            <span className="text-3xl font-bold text-transparent">
              {chapter.membersCompleted}{' '}
            </span>
            of
            <span className="text-3xl font-bold text-transparent">
              {' '}
              {/* // TODO member count */}7{' '}
            </span>
            members.
          </p>

          {chapter.membersCompleted === 7 - 1 && (
            <p className="text-xl font-medium">
              Don't
              <span className="bg-gradient-to-l from-red-300 to-pink-500 bg-clip-text font-bold text-transparent">
                {' '}
                fall behind{' '}
              </span>
              now!
            </p>
          )}
        </>
      )}

      {chapter.status === 'not_started' && (
        <p className="text-xl font-medium">
          It's a race
          <span className="bg-gradient-to-l from-green-400 to-emerald-500 bg-clip-text font-bold text-transparent">
            {' '}
            to be first!
          </span>
        </p>
      )}

      <nextChapterFetcher.Form
        action={`/api/chapters/${chapter.id}/read`}
        method="post"
        className="mt-4"
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
    <div className="mb-4 text-3xl font-bold ">
      <p>Book</p>

      <p className="w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
        Complete
      </p>
    </div>

    <p className="text-xl font-medium ">
      Continue participating in{' '}
      <TextLink to="." color="indigo">
        the conversation
      </TextLink>
    </p>
  </>
)

export default NextChapterSection
