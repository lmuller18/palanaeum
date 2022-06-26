import clsx from 'clsx'
import { Link, useFetcher } from '@remix-run/react'
import { Fragment, useState } from 'react'
import useMeasure from 'react-use-measure'
import { Menu, Transition } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { DuplicateIcon as DuplicateActiveIcon } from '@heroicons/react/solid'
import {
  ChevronDownIcon,
  DuplicateIcon as DuplicateInactiveIcon,
} from '@heroicons/react/outline'

import Button from '~/elements/Button'
import TextLink from '~/elements/TextLink'

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
  const [ref, { height }] = useMeasure()
  const [animating, setAnimating] = useState(false)
  const startAnim = () => setAnimating(true)
  const endAnim = () => setAnimating(false)

  return (
    <motion.div
      className="relative mx-auto mb-4 flex"
      style={{
        height: height || 'auto',
        overflow: animating ? 'hidden' : 'visible',
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          key={chapter?.id ?? 'complete'}
          data-cy="next-chapter"
          onAnimationStart={startAnim}
          onAnimationComplete={endAnim}
          className={clsx(
            height ? 'absolute w-full' : 'relative',
            'flex-grow rounded-lg bg-background-secondary text-gray-100 shadow-xl',
          )}
        >
          <div ref={ref} className="py-8 px-8">
            {chapter ? (
              <NextChapter chapter={chapter} club={club} />
            ) : (
              <NoChapter />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
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
        method="post"
        action={`/api/chapters/${chapter.id}/read`}
        className="mt-4 flex items-center justify-between gap-2"
      >
        <div className="basis-3/4">
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
        </div>

        <Menu as="div" className="relative inline-block basis-1/4">
          <div>
            <Menu.Button as={Button} variant="secondary">
              Options
              <ChevronDownIcon
                className="ml-2 -mr-1 h-5 w-5 text-indigo-700/70"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <DuplicateActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <DuplicateInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Complete Multiple
                    </button>
                  )}
                </Menu.Item>{' '}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      {active ? (
                        <DuplicateActiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <DuplicateInactiveIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                      Edit
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* <div className="relative flex w-full items-center justify-center overflow-hidden rounded-md border border-transparent text-sm font-medium text-white shadow-sm md:w-48">
          <button
            name="_action"
            value="MARK_READ"
            disabled={state === 'submitting' || state === 'success'}
            className="peer mr-[50px] h-full w-full bg-indigo-600 px-4 py-2 pr-[25px] hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-600/70 disabled:text-white/70 disabled:focus:ring-indigo-500/70"
          >
            <span className="mr-[20px] block translate-x-[25px] transform pl-[20px]">
              {state === 'success' && 'Completed'}
              {state === 'idle' && 'Complete'}
              {state === 'submitting' && 'Completing'}
            </span>
          </button>
          <button
            type="button"
            // onClick={onScrollToNextChapter}
            className="absolute right-0 top-0 h-full border-l-2 border-l-indigo-500 bg-indigo-600 px-4 py-2 hover:bg-indigo-700 focus:ring-indigo-500 peer-hover:bg-indigo-700 peer-disabled:bg-indigo-600/70 peer-disabled:text-white/70 peer-disabled:focus:ring-indigo-500/70"
          >
            <DotsVerticalIcon className="h-4 w-4" />
          </button>
        </div> */}
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
