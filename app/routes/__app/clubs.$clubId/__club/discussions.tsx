import invariant from 'tiny-invariant'
import { Fragment, useState } from 'react'
import type { LoaderArgs } from '@remix-run/node'
import { Listbox, Transition } from '@headlessui/react'
import SortIcon from '@heroicons/react/outline/AdjustmentsIcon'
import { BookOpenIcon, CheckIcon, SelectorIcon } from '@heroicons/react/outline'
import { Link, useNavigate, useParams, useSearchParams } from '@remix-run/react'

import { pluralize } from '~/utils'
import Modal from '~/components/Modal'
import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import TextButton from '~/elements/TextButton'
import Container from '~/components/Container'
import { requireUserId } from '~/session.server'
import FormattedDate from '~/components/FormattedDate'
import { getChapterList } from '~/models/chapters.server'
import { getDiscussionsForReadChapters } from '~/models/discussions.server'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'

export const loader = async ({ params, request }: LoaderArgs) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const searchParams = new URL(request.url).searchParams
  const sortOrder = searchParams.get('sort') === 'time' ? 'time' : 'chapter'

  const [discussions, chapters] = await Promise.all([
    getDiscussionsForReadChapters(params.clubId, userId, sortOrder),
    getChapterList(params.clubId, userId),
  ])

  if (!discussions)
    throw new Response('Problem finding discussions', { status: 500 })

  return typedjson({
    discussions,
    chapters,
  })
}

export default function DiscussionsPage() {
  const [open, setOpen] = useState(false)
  const { discussions } = useTypedLoaderData<typeof loader>()

  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)

  return (
    <>
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold leading-7 text-slate-100">
            Discussions
          </h1>

          <div className="flex items-center gap-4">
            {discussions.length !== 0 && (
              <>
                <DiscussionSort />
                <span
                  aria-hidden="true"
                  className="text-sm font-bold text-slate-400"
                >
                  /
                </span>
              </>
            )}
            <button
              onClick={onOpen}
              className="text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-400 active:text-indigo-600"
            >
              New +
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-700 lg:border-t lg:border-slate-700">
          {discussions.map(d => (
            <DiscussionEntry key={d.discussion.id} data={d} />
          ))}
          {!discussions.length && (
            <Container className="mt-4">
              <div className="block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm">
                <Text>
                  No discussions yet. Be the first to{' '}
                  <TextButton
                    onClick={onOpen}
                    color="indigo"
                    className="font-medium"
                  >
                    start the conversation
                  </TextButton>{' '}
                  about this chapter.
                </Text>
              </div>
            </Container>
          )}
        </div>
      </div>
      <CreateDiscussionModal open={open} onClose={onClose} />
    </>
  )
}

const DiscussionEntry = ({
  data,
}: {
  data: Awaited<
    ReturnType<Awaited<ReturnType<typeof loader>>['typedjson']>
  >['discussions'][number]
}) => {
  return (
    <article
      aria-labelledby={`discussion-${data.discussion.id}-title`}
      className="py-5 sm:py-6"
    >
      <Container>
        <div className="flex flex-col items-start">
          <h2
            id={`episode-${data.discussion.id}-title`}
            className="text-lg font-bold text-slate-100"
          >
            <Link to={data.discussion.id}>{data.discussion.title}</Link>
          </h2>
          <FormattedDate
            date={new Date(data.discussion.createdAt)}
            className="order-first font-mono text-sm leading-7 text-slate-300"
          />
          <div className="mt-1 flex items-center gap-4">
            <span className="text-sm font-bold leading-6">
              <span className="mr-1 text-indigo-400">
                {data.discussion.replyCount}
              </span>{' '}
              {pluralize('Reply', 'Replies', data.discussion.replyCount)}
            </span>

            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>

            <Link
              className="group flex items-center text-sm font-bold leading-6 active:text-slate-300"
              to={`../chapters/${data.chapter.id}/discussions/${data.discussion.id}`}
            >
              <span className="mr-2 block text-indigo-400 group-hover:text-indigo-300 group-active:text-indigo-500">
                <BookOpenIcon className="h-4 w-4" />
              </span>
              {data.chapter.title}
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Link
              to={`../chapters/${data.chapter.id}`}
              className="flex items-center text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-300 active:text-indigo-500"
              aria-label={`Chapter for discussion ${data.discussion.title}`}
            >
              View Chapter
            </Link>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>
            <Link
              to={`../chapters/${data.chapter.id}/discussions/${data.discussion.id}`}
              className="flex items-center text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-300 active:text-indigo-500"
              aria-label={`Full discussion for ${data.discussion.title}`}
            >
              View Discussion
            </Link>
          </div>
        </div>
      </Container>
    </article>
  )
}

const DiscussionSort = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = searchParams.get('sort') === 'time' ? 'time' : 'chapter'

  const changeSort = () => {
    searchParams.set('sort', sort === 'time' ? 'chapter' : 'time')
    setSearchParams(searchParams)
  }

  return (
    <button
      type="button"
      onClick={changeSort}
      className="flex items-center gap-1 text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-300 active:text-indigo-500"
    >
      <Text variant="subtitle2" className="font-bold" as="p">
        Sort{' '}
        <Text variant="subtitle2" as="span" className="font-normal">
          {sort === 'time' && '(Time)'}
          {sort === 'chapter' && '(Chapter)'}
        </Text>
      </Text>
      <SortIcon className="h-5 w-5" />
    </button>
  )
}

const CreateDiscussionModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const { chapters } = useTypedLoaderData<typeof loader>()
  const [selected, setSelected] = useState(chapters[0])

  const toCreateDiscussion = () => {
    navigate(`/clubs/${clubId}/chapters/${selected.id}/discussions/new`)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col pt-3">
        <div className="px-3 pb-4 shadow-sm">
          <div className="relative mt-2 text-center">
            <span className="font-medium">Create Discussion</span>
            <div className="absolute inset-y-0 right-0">
              <button
                className="mr-1 text-indigo-400 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="p-2">
            <Listbox value={selected} onChange={setSelected}>
              <div className="relative mb-4">
                <Listbox.Button className="m:text-sm relative w-full cursor-default rounded-lg bg-background-secondary py-2 pl-3 pr-10 text-left text-white shadow-md focus:outline-none">
                  <span className="block truncate">{selected.title}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <SelectorIcon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-background-secondary py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                    {chapters.map(chapter => (
                      <Listbox.Option
                        key={chapter.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-indigo-600 text-white' : 'text-white'
                          }`
                        }
                        value={chapter}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {chapter.title}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>

            <Button onClick={toCreateDiscussion} variant="indigo" fullWidth>
              Create Discussion
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
