import clsx from 'clsx'
import { useMemo } from 'react'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'

import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'
import Badge from '~/elements/Badge'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'

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
          <div className="mb-4 flex items-center gap-2 overflow-hidden">
            <AnimatePresence exitBeforeEnter>
              {(status === 'not_started' || status === 'incomplete') && (
                <motion.div
                  key={status}
                  initial={{ y: '-100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="inline-block"
                >
                  <XCircleIcon className="inline-block h-8 w-8 text-red-500" />
                </motion.div>
              )}
              {(status === 'complete' || status === 'all_complete') && (
                <motion.div
                  key={status}
                  initial={{ y: '-100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="inline-block"
                >
                  <CheckCircleIcon className="inline-block h-8 w-8 text-green-500" />
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-3xl font-bold md:text-5xl">{chapter.title}</p>
          </div>

          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={status}
              initial={{ x: -100 + '%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100 + '%', opacity: 0 }}
            >
              {/* {contentElement} */}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex flex-col items-start gap-2">
            <Badge color="cyan">3 Discussions</Badge>
            <Badge color="indigo">6 Comments</Badge>
            <Badge color="rose">14 Tweets</Badge>
          </div>

          {/* <div className="mt-4">
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
          </div> */}

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
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ staggerChildren: 1.5 }}
          className={clsx(
            'relative h-12 w-full bg-gradient-to-l',
            (status === 'incomplete' || status === 'complete') &&
              'from-fuchsia-300 to-blue-400',
            status === 'all_complete' && 'from-green-300 to-emerald-500',
            status === 'not_started' && 'from-red-300 to-pink-500',
          )}
        >
          <div className="absolute inset-0 w-full bg-black bg-opacity-50" />
          <motion.div
            key="progress"
            animate={{
              width: status === 'not_started' ? '100%' : percent + '%',
            }}
            transition={{ duration: 0.5 }}
            className="h-full bg-white mix-blend-overlay"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default ChapterCard
