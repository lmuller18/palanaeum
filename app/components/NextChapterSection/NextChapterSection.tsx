import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

import TextLink from '~/elements/TextLink'
import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'

interface NextChapterSectionProps {
  chapter: ChapterListItem | null
}

const NextChapterSection = ({ chapter }: NextChapterSectionProps) => {
  const changedEntry = useRef(false)

  useEffect(() => {
    changedEntry.current = true
  }, [chapter])

  return (
    <motion.div
      initial={changedEntry.current ? { x: '100%' } : false}
      animate={{ x: '0%' }}
      key={chapter?.id ?? 'complete'}
      layoutId={chapter?.id ?? 'complete'}
      data-cy="next-chapter"
      className="mx-auto mb-4 max-w-screen-md rounded-lg bg-background-secondary py-8 px-8 text-gray-100 shadow-xl lg:max-w-screen-lg"
    >
      {chapter ? <NextChapter chapter={chapter} /> : <NoChapter />}
    </motion.div>
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
        <p className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
          Up Next
        </p>

        <p>{chapter.title}</p>
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

      <fetcher.Form action="chapter-actions" method="post">
        <input type="hidden" name="chapterId" value={chapter.id} />
        <button
          disabled={
            state === 'submitting' ||
            chapter.status === 'complete' ||
            chapter.status === 'all_complete'
          }
          name="_action"
          className="mt-3 w-full rounded bg-gradient-to-l from-fuchsia-300 to-blue-400 py-2 px-4 font-bold text-white hover:from-fuchsia-400 focus:from-fuchsia-200 focus:to-blue-300 disabled:opacity-30 md:mr-2 md:w-48"
          value="MARK_READ"
        >
          {state === 'submitting' ? 'Completing...' : 'Complete'}
        </button>
        <button
          onClick={() =>
            document
              .querySelector(`#${chapter.id}`)
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          type="button"
          className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"
        >
          Go To
        </button>
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
  </>
)

export default NextChapterSection
