import clsx from 'clsx'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Link, useParams } from '@remix-run/react'
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/outline'

import Button from '~/elements/Button'
import useValueChanged from '~/hooks/use-value-changed'
import type { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'

interface ChapterCardProps {
  chapter: ChapterListItem
}

const ChapterCard = ({ chapter }: ChapterCardProps) => {
  const { fetcher, percent, status, state } = useChapterActionsFetcher(chapter)
  const changedStatus = useValueChanged(status)
  const { clubId } = useParams()

  const handleChapterAction = (action: 'MARK_READ' | 'MARK_UNREAD') => {
    fetcher.submit(
      {
        chapterId: chapter.id,
        _action: action,
      },
      {
        method: 'post',
        replace: true,
        action: `/clubs/${clubId}/chapter-actions`,
      },
    )
  }

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
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={changedStatus ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 inline-block"
              >
                {(status === 'not_started' || status === 'incomplete') && (
                  <XCircleIcon className="inline-block h-8 w-8 text-red-500" />
                )}
                {(status === 'complete' || status === 'all_complete') && (
                  <CheckCircleIcon className="inline-block h-8 w-8 text-green-500" />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex w-fit flex-col gap-1">
              <Link
                className="peer text-3xl font-bold md:text-4xl"
                to={chapter.id}
              >
                {chapter.title}
              </Link>
              <div className="h-1 w-full bg-gradient-to-l opacity-0 transition-opacity duration-300 peer-hover:from-fuchsia-300 peer-hover:to-blue-400 peer-hover:opacity-100" />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="relative grid grid-cols-2 gap-x-4 gap-y-4 overflow-hidden rounded-lg bg-black bg-opacity-50 px-4 py-5 shadow sm:p-6">
              <Stat stat="Completion" value={`${percent}%`} />
              <Stat stat="Discussions" value="3" to="discussions" />
              <Stat stat="Participants" value="4" />
              <Stat stat="Posts" value="14" />
            </div>
          </dl>

          <div className="mt-3">
            <input type="hidden" name="chapterId" value={chapter.id} />
            {(status === 'incomplete' || status === 'not_started') && (
              <Button
                type="button"
                disabled={state === 'submitting'}
                fullWidth="sm"
                onClick={() => handleChapterAction('MARK_READ')}
              >
                {state === 'submitting' ? 'Marking Unread...' : 'Complete'}
              </Button>
            )}
            {(status === 'complete' || status === 'all_complete') && (
              <Button
                type="button"
                disabled={state === 'submitting'}
                fullWidth="sm"
                onClick={() => handleChapterAction('MARK_UNREAD')}
              >
                {state === 'submitting' ? 'Completing...' : 'Mark Unread'}
              </Button>
            )}
          </div>
        </div>

        <motion.div
          key="progress"
          initial={false}
          animate={{
            width: status === 'not_started' ? '100%' : percent + '%',
          }}
          transition={{ duration: 0.5 }}
          className={clsx(
            'mt-2 h-8 bg-gradient-to-l',
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

const Stat = ({
  stat,
  value,
  to,
}: {
  stat: string
  value: string | number
  to?: string
}) => {
  const valueChanged = useValueChanged(value)

  return (
    <DynamicLink to={to}>
      <dt className="truncate text-sm font-medium text-gray-300">{stat}</dt>
      <AnimatePresence mode="wait">
        <motion.dd
          initial={valueChanged ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={value}
          className="mt-1 text-3xl font-semibold"
        >
          {value}
        </motion.dd>
      </AnimatePresence>
    </DynamicLink>
  )
}

const DynamicLink = ({
  to,
  ...props
}: {
  to?: string
  children: ReactNode
}) => {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  if (to) return <Link to={to} {...props} />
  return <div {...props} />
}

export default ChapterCard
