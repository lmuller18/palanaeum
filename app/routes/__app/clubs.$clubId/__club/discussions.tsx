import { Fragment, useState } from 'react'
import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { CheckIcon, SelectorIcon } from '@heroicons/react/outline'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'

import Modal from '~/components/Modal'
import Button from '~/elements/Button'
import Text from '~/elements/Typography/Text'
import TextButton from '~/elements/TextButton'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import { Listbox, Transition } from '@headlessui/react'
import { getChapterList } from '~/models/chapters.server'
import DiscussionSummary from '~/components/DiscussionSummary'
import { getDiscussionsForReadChapters } from '~/models/discussions.server'

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'expected clubId')

  const [discussions, chapters] = await Promise.all([
    getDiscussionsForReadChapters(params.clubId, userId),
    getChapterList(params.clubId, userId),
  ])

  if (!discussions)
    throw new Response('Problem finding discussions', { status: 500 })

  return json({
    discussions,
    chapters,
  })
}

export default function DiscussionsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { discussions } = useLoaderData<typeof loader>()

  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)

  return (
    <>
      <div className="mb-4">
        <div className="mb-4 flex items-baseline justify-between">
          <Header size="h5" font="serif">
            Discussions
          </Header>
          <TextButton onClick={onOpen} color="blue">
            New +
          </TextButton>
        </div>
        <div className="flex flex-col gap-4">
          {discussions.map(d => (
            <button
              onClick={() =>
                navigate(
                  `/clubs/${d.chapter.clubId}/chapters/${d.chapter.id}/discussions/${d.discussion.id}`,
                )
              }
              key={d.discussion.id}
              className="block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm"
            >
              <DiscussionSummary {...d} />
            </button>
          ))}
          {!discussions.length && (
            <div className="block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm">
              <Text>
                No discussions yet. Be the first to{' '}
                <TextButton onClick={onOpen} color="blue">
                  start the conversation
                </TextButton>{' '}
                about this chapter.
              </Text>
            </div>
          )}
        </div>
      </div>
      <CreateDiscussionModal open={open} onClose={onClose} />
    </>
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
  const { chapters } = useLoaderData<typeof loader>()
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
                className="mr-1 text-blue-500 focus:outline-none"
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

            <Button onClick={toCreateDiscussion} fullWidth>
              Create Discussion
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
