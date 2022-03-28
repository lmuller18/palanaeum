import clsx from 'clsx'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'

interface ChapterCardProps {
  chapter: ChapterListItem
}

const ChapterCard = ({ chapter }: ChapterCardProps) => {
  const { fetcher, percent, status, state } = useChapterActionsFetcher(chapter)

  const contentElement = useMemo(() => {
    switch (status) {
      case 'not_started':
        return <>Be the first in your club to finish this chapter.</>
      case 'incomplete':
        return <>Don't fall behind now.</>
      case 'complete':
        return <>Still waiting on a few others to wrap this up.</>
      case 'all_complete':
        return <>All members are done reading. Let loose your spoilers.</>
    }
  }, [status])

  return (
    <div className="mx-auto mb-4 max-w-screen-md overflow-hidden rounded-lg bg-background-secondary text-gray-100 shadow-xl lg:max-w-screen-lg">
      <div className="flex flex-col gap-4">
        <div className="flex-grow py-8 px-8 pb-0">
          <p className="mb-4 text-3xl font-bold md:text-5xl">{chapter.title}</p>

          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={status}
              initial={{ x: -100 + '%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100 + '%', opacity: 0 }}
            >
              {contentElement}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4">
            <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg font-bold md:text-3xl">
              <span className="text-3xl font-bold text-transparent md:text-5xl">
                3
              </span>{' '}
              Discussions
            </p>

            <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg font-bold md:text-3xl">
              <span className="text-3xl font-bold text-transparent md:text-5xl">
                6
              </span>{' '}
              Comments
            </p>

            <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg font-bold md:text-3xl">
              <span className="text-3xl font-bold text-transparent md:text-5xl">
                14
              </span>{' '}
              Tweets
            </p>
          </div>

          <fetcher.Form action="chapter-actions" method="post">
            <input type="hidden" name="chapterId" value={chapter.id} />
            {(status === 'incomplete' || status === 'not_started') && (
              <button
                className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"
                disabled={state === 'submitting'}
                name="_action"
                value="MARK_READ"
              >
                Complete
              </button>
            )}
            {(status === 'complete' || status === 'all_complete') && (
              <button
                className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"
                disabled={state === 'submitting'}
                name="_action"
                value="MARK_UNREAD"
              >
                Mark Unread
              </button>
            )}
          </fetcher.Form>
        </div>

        <motion.div
          key="progress-container"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 100 + '%', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ staggerChildren: 1.5 }}
          className={clsx(
            'relative h-12 w-full',
            (status === 'incomplete' || status === 'complete') &&
              'bg-gradient-to-l from-fuchsia-300 to-blue-400',
          )}
        >
          {(status === 'incomplete' || status === 'complete') && (
            <>
              <div className="absolute inset-0 w-full bg-black bg-opacity-50" />
              <motion.div
                key="progress"
                initial={{ width: 0 }}
                animate={{ width: percent + '%' }}
                className="h-full bg-white mix-blend-overlay"
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ChapterCard
