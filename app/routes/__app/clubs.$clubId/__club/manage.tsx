import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { useEffect, useState } from 'react'
import { Form, useLoaderData } from '@remix-run/react'
import { forbidden, notFound } from 'remix-utils'
import type { LoaderFunction } from '@remix-run/node'
import type { DragControls, MotionValue } from 'framer-motion'
import {
  animate,
  Reorder,
  useMotionValue,
  useDragControls,
  AnimatePresence,
} from 'framer-motion'

import Modal from '~/components/Modal'
import Button from '~/elements/Button'
import TextButton from '~/elements/TextButton'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import OutlinedInput from '~/elements/OutlinedInput'
import { getChapterList } from '~/models/chapters.server'
import { getClubWithUserMembers } from '~/models/clubs.server'

interface LoaderData {
  chapters: RequiredFuncType<typeof getChapterList>
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)

  invariant(params.clubId, 'expected clubId')

  const [club, chapters] = await Promise.all([
    getClubWithUserMembers(params.clubId, userId),
    getChapterList(params.clubId, userId),
  ])

  if (!club) throw notFound({ message: 'Club not found' })

  if (club.ownerId !== userId)
    throw forbidden({ message: 'Not authorized to manage club' })

  return json<LoaderData>({
    chapters,
  })
}

// TODO Save Order
// TODO Edit Title
// TODO Delete Chapter
// TODO Create Chapter

export default function ManageClubPage() {
  const { chapters } = useLoaderData() as LoaderData
  const [orderedChapters, setOrderedChapters] = useState(chapters)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOrderedChapters(chapters)
  }, [chapters])

  const hasNewOrder = !chapters.every(
    (chapter, index) => chapter.id === orderedChapters[index].id,
  )

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <Header size="h5" font="serif">
          Chapters
        </Header>
        <TextButton type="button" color="blue" onClick={() => setOpen(true)}>
          Add +
        </TextButton>
      </div>
      <Reorder.Group
        values={orderedChapters}
        onReorder={setOrderedChapters}
        className="relative mt-3"
        axis="y"
      >
        {orderedChapters.map((c, i) => (
          <Chapter key={c.id} chapter={c} order={i} />
        ))}
      </Reorder.Group>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          onClick={() => setOrderedChapters(chapters)}
          variant="secondary"
          disabled={!hasNewOrder}
          fullWidth
        >
          Reset Order
        </Button>

        <Button type="button" disabled={!hasNewOrder} fullWidth>
          Save Order
        </Button>
      </div>

      <NewChapterModal open={open} setOpen={setOpen} />
    </div>
  )
}

const EditChapterModal = ({
  id,
  title,
  open,
  setOpen,
}: {
  id: string
  title: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [newTitle, setNewTitle] = useState(title)

  const onClose = () => {
    setNewTitle(title)
    setOpen(false)
  }

  useEffect(() => {
    setNewTitle(title)
  }, [title])

  return (
    <AnimatePresence>
      {open && (
        <Modal onClose={onClose}>
          <div className="flex flex-col pt-3">
            <div className="px-3 pb-4 shadow-sm">
              <div className="relative mt-2 text-center">
                <span className="font-medium">Edit Chapter</span>
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
            <div className="flex-1 overflow-y-scroll">
              <Form method="post" className="flex flex-col gap-6 p-2">
                <input type="hidden" name="id" value={id} />
                <OutlinedInput
                  variant="tertiary"
                  labelProps={{
                    htmlFor: 'title',
                    children: 'Title',
                  }}
                  inputProps={{
                    type: 'text',
                    name: 'title',
                    id: 'title',
                    onChange: e => setNewTitle(e.target.value),
                    value: newTitle,
                    placeholder: 'Chapter Title',
                  }}
                />

                <Button
                  name="_action"
                  value="EDIT_CHAPTER"
                  disabled={title === newTitle}
                >
                  Save Changes
                </Button>
              </Form>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  )
}

const DeleteChapterModal = ({
  id,
  title,
  open,
  setOpen,
}: {
  id: string
  title: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const onClose = () => setOpen(false)

  return (
    <AnimatePresence>
      {open && (
        <Modal onClose={onClose}>
          <div className="flex flex-col pt-3">
            <div className="px-3 pb-4 shadow-sm">
              <div className="relative mt-2 text-center">
                <span className="font-medium">Delete Chapter</span>
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
            <div className="flex-1 overflow-y-scroll">
              <Form method="post" className="flex flex-col gap-6 p-2">
                <input type="hidden" name="id" value={id} />
                Delete Chapter {title}?
                <Button name="_action" value="EDIT_CHAPTER" variant="warning">
                  Delete Chapter
                </Button>
              </Form>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  )
}

const NewChapterModal = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  return (
    <AnimatePresence>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="flex flex-col pt-3">
            <div className="px-3 pb-4 shadow-sm">
              <div className="relative mt-2 text-center">
                <span className="font-medium">Add Chapter</span>
                <div className="absolute inset-y-0 right-0">
                  <button
                    className="mr-1 text-blue-500 focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-scroll">
              <Form method="post" className="flex flex-col gap-6 p-2">
                <OutlinedInput
                  variant="tertiary"
                  labelProps={{
                    htmlFor: 'title',
                    children: 'Title',
                  }}
                  inputProps={{
                    type: 'text',
                    name: 'title',
                    id: 'title',
                    placeholder: 'Chapter Title',
                  }}
                />

                <Button name="_action" value="CREATE_CHAPTER">
                  Create Chapter
                </Button>
              </Form>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  )
}

const inactiveShadow = '0px 0px 0px rgba(0,0,0,0.8)'
function useRaisedShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(inactiveShadow)

  useEffect(() => {
    let isActive = false
    value.onChange(latest => {
      const wasActive = isActive
      if (latest !== 0) {
        isActive = true
        if (isActive !== wasActive) {
          animate(boxShadow, '5px 5px 10px rgba(0,0,0,0.3)')
        }
      } else {
        isActive = false
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow)
        }
      }
    })
  }, [value, boxShadow])

  return boxShadow
}

const Chapter = ({
  chapter,
  order,
}: {
  chapter: LoaderData['chapters'][number]
  order: number
}) => {
  const y = useMotionValue(0)
  const boxShadow = useRaisedShadow(y)
  const dragControls = useDragControls()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <Reorder.Item
      value={chapter}
      id={chapter.id}
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
      className="relative mb-4 rounded-lg bg-background-secondary p-4"
    >
      <label
        htmlFor={chapter.id}
        className="flex items-center justify-between gap-2"
      >
        <div className="flex flex-grow items-center gap-2">
          {order + 1}.
          <input
            type="hidden"
            name="chapters"
            value={`${chapter.id}:${order}`}
            defaultChecked
          />
          <span>{chapter.title}</span>
        </div>
        <ReorderIcon dragControls={dragControls} />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <TextButton
          type="button"
          color="blue"
          onClick={() => setEditOpen(true)}
        >
          Edit Title
        </TextButton>
        <div className="flex flex-grow items-center justify-end">
          <TextButton
            type="button"
            color="rose"
            onClick={() => setDeleteOpen(true)}
          >
            Delete Chapter
          </TextButton>
        </div>
      </div>

      <EditChapterModal
        open={editOpen}
        setOpen={setEditOpen}
        id={chapter.id}
        title={chapter.title}
      />

      <DeleteChapterModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        id={chapter.id}
        title={chapter.title}
      />
    </Reorder.Item>
  )
}

function ReorderIcon({ dragControls }: { dragControls: DragControls }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39 39"
      width="39"
      height="39"
      className="h-4 w-4 cursor-grab touch-pan-x select-none"
      onPointerDown={event => dragControls.start(event)}
    >
      <path
        d="M 5 0 C 7.761 0 10 2.239 10 5 C 10 7.761 7.761 10 5 10 C 2.239 10 0 7.761 0 5 C 0 2.239 2.239 0 5 0 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 19 0 C 21.761 0 24 2.239 24 5 C 24 7.761 21.761 10 19 10 C 16.239 10 14 7.761 14 5 C 14 2.239 16.239 0 19 0 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 33 0 C 35.761 0 38 2.239 38 5 C 38 7.761 35.761 10 33 10 C 30.239 10 28 7.761 28 5 C 28 2.239 30.239 0 33 0 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 33 14 C 35.761 14 38 16.239 38 19 C 38 21.761 35.761 24 33 24 C 30.239 24 28 21.761 28 19 C 28 16.239 30.239 14 33 14 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 19 14 C 21.761 14 24 16.239 24 19 C 24 21.761 21.761 24 19 24 C 16.239 24 14 21.761 14 19 C 14 16.239 16.239 14 19 14 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 5 14 C 7.761 14 10 16.239 10 19 C 10 21.761 7.761 24 5 24 C 2.239 24 0 21.761 0 19 C 0 16.239 2.239 14 5 14 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 5 28 C 7.761 28 10 30.239 10 33 C 10 35.761 7.761 38 5 38 C 2.239 38 0 35.761 0 33 C 0 30.239 2.239 28 5 28 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 19 28 C 21.761 28 24 30.239 24 33 C 24 35.761 21.761 38 19 38 C 16.239 38 14 35.761 14 33 C 14 30.239 16.239 28 19 28 Z"
        fill="#CCC"
      ></path>
      <path
        d="M 33 28 C 35.761 28 38 30.239 38 33 C 38 35.761 35.761 38 33 38 C 30.239 38 28 35.761 28 33 C 28 30.239 30.239 28 33 28 Z"
        fill="#CCC"
      ></path>
    </svg>
  )
}
