import clsx from 'clsx'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'

import Badge from '~/elements/Badge'
import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'
import Button from '~/elements/Button'
import { Link } from 'remix'

interface ChapterCardProps {
  chapter: ChapterListItem
}

const ChapterCard = ({ chapter }: ChapterCardProps) => {
  const { fetcher, percent, status, state } = useChapterActionsFetcher(chapter)

  return (
    <div
      className={clsx(
        'mx-auto mb-4 max-w-screen-md overflow-hidden rounded-lg bg-gradient-to-l text-gray-100 shadow-xl transition-colors lg:max-w-screen-lg',
        (status === 'incomplete' || status === 'complete') &&
          'from-fuchsia-300/30 to-blue-400/30',
        status === 'all_complete' && 'from-green-300/30 to-emerald-500/30',
        status === 'not_started' && 'from-red-300/30 to-pink-500/30',
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex-grow py-8 px-8 pb-0">
          <div className="mb-4 flex items-center gap-2 overflow-hidden">
            <AnimatePresence exitBeforeEnter>
              <motion.div
                key={status}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-block"
              >
                {(status === 'not_started' || status === 'incomplete') && (
                  <XCircleIcon className="inline-block h-8 w-8 text-red-500" />
                )}
                {(status === 'complete' || status === 'all_complete') && (
                  <CheckCircleIcon className="inline-block h-8 w-8 text-green-500" />
                )}
              </motion.div>
            </AnimatePresence>
            <Link
              className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-3xl font-bold transition-colors duration-300 hover:text-transparent md:text-4xl"
              to={chapter.id}
            >
              {chapter.title}
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-start gap-2">
            <Badge color="cyan">3 Discussions</Badge>
            <Badge color="indigo">6 Comments</Badge>
            <Badge color="rose">14 Tweets</Badge>
          </div>

          {/* <div className="mt-4">
            <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg font-bold md:text-3xl">
              <span className="text-3xl font-bold text-transparent md:text-4xl">
                3
              </span>{' '}
              Discussions
            </p>

            <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg font-bold md:text-3xl">
              <span className="text-3xl font-bold text-transparent md:text-4xl">
                6
              </span>{' '}
              Comments
            </p>

            <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg font-bold md:text-3xl">
              <span className="text-3xl font-bold text-transparent md:text-4xl">
                14
              </span>{' '}
              Tweets
            </p>
          </div> */}

          <fetcher.Form action="chapter-actions" method="post" className="mt-3">
            <input type="hidden" name="chapterId" value={chapter.id} />
            {(status === 'incomplete' || status === 'not_started') && (
              // <button
              //   className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"
              //   disabled={state === 'submitting'}
              //   name="_action"
              //   value="MARK_READ"
              // >
              //   Complete
              // </button>
              <Button
                disabled={state === 'submitting'}
                name="_action"
                value="MARK_READ"
                fullWidth="sm"
              >
                Complete
              </Button>
            )}
            {(status === 'complete' || status === 'all_complete') && (
              // <button
              //   className="mt-3 w-full rounded bg-blue-500 py-2 px-4 text-white  hover:bg-blue-600 focus:bg-blue-400 disabled:opacity-30 md:w-48"
              //   disabled={state === 'submitting'}
              //   name="_action"
              //   value="MARK_UNREAD"
              // >
              //   Mark Unread
              // </button>
              <Button
                disabled={state === 'submitting'}
                name="_action"
                value="MARK_UNREAD"
                fullWidth="sm"
              >
                Mark Unread
              </Button>
            )}
          </fetcher.Form>
        </div>

        <motion.div
          key="progress"
          initial={false}
          animate={{
            width: status === 'not_started' ? '100%' : percent + '%',
          }}
          transition={{ duration: 0.5 }}
          className={clsx(
            'mt-2 h-6 bg-gradient-to-l',
            (status === 'incomplete' || status === 'complete') &&
              'from-fuchsia-300 to-blue-400',
            status === 'all_complete' && 'from-green-300 to-emerald-500',
            status === 'not_started' && 'from-red-300 to-pink-500',
          )}
        />
      </div>
    </div>
  )
}

export default ChapterCard
