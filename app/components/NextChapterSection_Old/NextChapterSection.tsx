import React, { Fragment } from 'react'
import { Link, useFetcher } from '@remix-run/react'
import { Menu, Transition } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  PencilAltIcon as PencilActiveIcon,
  CheckCircleIcon as CheckActiveIcon,
} from '@heroicons/react/solid'
import {
  ChevronDownIcon,
  PencilAltIcon as PencilInactiveIcon,
  CheckCircleIcon as CheckInactiveIcon,
} from '@heroicons/react/outline'

import Button from '~/elements/Button'
import TextLink from '~/elements/TextLink'

interface NextChapterSectionProps {
  chapter: {
    id: string
    title: string
    membersCompleted: number
    totalMembers: number
    status: 'incomplete' | 'not_started'
  } | null
  isOwner: boolean
}

const NextChapterSection = ({ chapter, isOwner }: NextChapterSectionProps) => {
  return (
    <motion.div className="mx-auto mb-4">
      <AnimatePresence initial={false}>
        <motion.div
          initial={{ x: '100%', position: 'absolute' }}
          animate={{ x: '0%', position: 'static' }}
          exit={{ x: '-100%', position: 'absolute' }}
          key={chapter?.id ?? 'complete'}
          className="flex-grow rounded-lg bg-background-secondary p-8 text-gray-100 shadow-xl"
        >
          {chapter ? (
            <NextChapter chapter={chapter} isOwner={isOwner} />
          ) : (
            <NoChapter />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

interface NextChapterProps {
  chapter: NonNullable<NextChapterSectionProps['chapter']>
  isOwner: boolean
}

const NextChapter = ({ chapter, isOwner }: NextChapterProps) => {
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
              {chapter.totalMembers}{' '}
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

        <ChapterOptionsMenuButton isOwner={isOwner} />

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

interface MenuItemProps extends React.ComponentPropsWithoutRef<'button'> {
  activeIcon: JSX.Element
  inactiveIcon: JSX.Element
  ownerOnly: boolean
  label: string
}

const MenuItems: MenuItemProps[] = [
  {
    activeIcon: (
      <PencilActiveIcon className="mr-2 h-5 w-5" aria-hidden="true" />
    ),
    inactiveIcon: (
      <PencilInactiveIcon className="mr-2 h-5 w-5" aria-hidden="true" />
    ),
    label: 'Edit',
    ownerOnly: true,
    onClick: () => {},
    type: 'button',
  },
  {
    activeIcon: <CheckActiveIcon className="mr-2 h-5 w-5" aria-hidden="true" />,
    inactiveIcon: (
      <CheckInactiveIcon className="mr-2 h-5 w-5" aria-hidden="true" />
    ),
    label: 'Complete All Previous',
    ownerOnly: false,
    type: 'submit',
    value: 'MARK_PREVIOUS',
    name: '_action',
  },
]

const ChapterOptionsMenuButton = ({ isOwner }: { isOwner: boolean }) => {
  const menuItems = MenuItems.filter(m => (m.ownerOnly ? isOwner : true))
  return (
    <Menu as="div" className="relative inline-block basis-1/4">
      <div>
        <Menu.Button as={Button} variant="secondary">
          Options
          <ChevronDownIcon
            className="ml-2 -mr-1 h-5 w-5 text-gray-200"
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
        <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            {menuItems.map(
              ({
                label,
                activeIcon,
                inactiveIcon,
                ownerOnly,
                ...buttonProps
              }) => (
                <Menu.Item key={label}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-100'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      {...buttonProps}
                    >
                      {active ? activeIcon : inactiveIcon}
                      {label}
                    </button>
                  )}
                </Menu.Item>
              ),
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default NextChapterSection
