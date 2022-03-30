import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

import TextLink from '~/elements/TextLink'
import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'
import Button from '~/elements/Button'
import { Link } from 'remix'
import clsx from 'clsx'

interface NextChapterSectionProps {
  chapter: ChapterListItem | null
}

const NextChapterSection = ({ chapter }: NextChapterSectionProps) => {
  const changedEntry = useRef(false)

  useEffect(() => {
    changedEntry.current = true
  }, [chapter])

  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        initial={changedEntry.current ? { opacity: 0, x: '100%' } : false}
        animate={{ x: '0%', opacity: 1 }}
        exit={{ opacity: 0 }}
        key={chapter?.id ?? 'complete'}
        layoutId={chapter?.id ?? 'complete'}
        data-cy="next-chapter"
        className="mx-auto mb-4 min-h-[321px] max-w-screen-md rounded-lg bg-background-secondary py-8 px-8 text-gray-100 shadow-xl md:min-h-[368px] lg:max-w-screen-lg"
      >
        {chapter ? <NextChapter chapter={chapter} /> : <NoChapter />}
      </motion.div>
    </AnimatePresence>
  )
}

interface NextChapterProps {
  chapter: ChapterListItem
}

const NextChapter = ({ chapter }: NextChapterProps) => {
  const { state, fetcher } = useChapterActionsFetcher(chapter)

  return (
    <>
      <div className="mb-4 text-3xl font-bold md:text-5xl">
        <p className="w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
          Up Next
        </p>

        <Link
          className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text transition-colors duration-300 hover:text-transparent"
          to={chapter.id}
        >
          {chapter.title}
        </Link>
      </div>

      {chapter.status !== 'not_started' ? (
        <>
          <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg md:text-3xl">
            Completed by{' '}
            <span className="text-3xl font-bold text-transparent md:text-5xl">
              {chapter.count.completed}{' '}
            </span>
            of
            <span className="text-3xl font-bold text-transparent md:text-5xl">
              {' '}
              {chapter.count.total}{' '}
            </span>
            members.
          </p>

          {chapter.count.completed === chapter.count.total - 1 &&
            chapter.status !== 'complete' && (
              <p className="text-xl font-medium md:text-4xl">
                Don't
                <span className="bg-gradient-to-l from-red-300 to-pink-500 bg-clip-text font-bold text-transparent">
                  {' '}
                  fall behind{' '}
                </span>
                now!
              </p>
            )}
        </>
      ) : (
        <p className="text-xl font-medium md:text-4xl">
          It's a race
          <span className="bg-gradient-to-l from-green-400 to-emerald-500 bg-clip-text font-bold text-transparent">
            {' '}
            to be first!
          </span>
        </p>
      )}

      <fetcher.Form
        action="chapter-actions"
        method="post"
        className="mt-3 flex flex-col gap-2"
      >
        <input type="hidden" name="chapterId" value={chapter.id} />
        {/* <button
          disabled={
            state === 'submitting' ||
            chapter.status === 'complete' ||
            chapter.status === 'all_complete'
          }
          name="_action"
          className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"
          // className="mt-3 w-full rounded bg-gradient-to-l from-fuchsia-300 to-blue-400 py-2 px-4 font-bold text-white hover:from-fuchsia-400 focus:from-fuchsia-200 focus:to-blue-300 disabled:opacity-30 md:mr-2 md:w-48"
          value="MARK_READ"
        >
          {state === 'submitting' ? 'Completing...' : 'Complete'}
        </button> */}
        {/* <button className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"></button> */}
        <Button
          name="_action"
          value="MARK_READ"
          fullWidth="sm"
          disabled={
            state === 'submitting' ||
            chapter.status === 'complete' ||
            chapter.status === 'all_complete'
          }
        >
          {state === 'submitting' ? 'Completing...' : 'Complete'}
        </Button>
        <Button
          variant="secondary"
          fullWidth="sm"
          type="button"
          onClick={() =>
            document
              .querySelector(`#${chapter.id}`)
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          Go To
        </Button>
      </fetcher.Form>
    </>
  )
}

const NoChapter = () => (
  <>
    <div className="mb-4 text-3xl font-bold md:text-5xl">
      <p>Book</p>

      <p className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
        Complete
      </p>
    </div>

    <p className="text-xl font-medium md:text-4xl">
      Continue participating in{' '}
      <TextLink to="." color="indigo">
        the conversation
      </TextLink>
    </p>

    {/* <div className="mt-4 flex flex-col items-start gap-2">
      <Badge color="cyan">3 Discussions</Badge>
      <Badge color="indigo">6 Comments</Badge>
      <Badge color="rose">14 Tweets</Badge>
    </div> */}
  </>
)

export default NextChapterSection
