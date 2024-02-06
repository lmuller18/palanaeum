import {
  animate,
  Reorder,
  useMotionValue,
  useDragControls,
} from 'framer-motion'
import invariant from 'tiny-invariant'
import { useRef, useState, useEffect } from 'react'
import type { MotionValue, DragControls } from 'framer-motion'

import {
  Form,
  useFetcher,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import { json } from '@remix-run/node'
import type { LoaderFunctionArgs, ActionFunction } from '@remix-run/node'

import {
  createChapter,
  deleteChapter,
  renameChapter,
  getChapterList,
  reorderChapters,
} from '~/models/chapters.server'
import Modal from '~/components/Modal'
import Button from '~/elements/Button'
import { useToast } from '~/hooks/use-toast'
import Text from '~/elements/Typography/Text'
import TextButton from '~/elements/TextButton'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import OutlinedInput from '~/elements/OutlinedInput'
import { getClub, getClubWithUserMembers } from '~/models/clubs.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)

  invariant(params.clubId, 'expected clubId')

  const [club, chapters] = await Promise.all([
    getClubWithUserMembers(params.clubId, userId),
    getChapterList(params.clubId, userId),
  ])

  if (!club)
    throw new Response(null, { status: 404, statusText: 'Club not found' })

  if (club.ownerId !== userId)
    throw new Response(null, {
      status: 403,
      statusText: 'Not authorized to manage club',
    })

  return json({
    chapters,
  })
}

export default function ManageClubPage() {
  const { chapters } = useLoaderData<typeof loader>()
  const [orderedChapters, setOrderedChapters] = useState(chapters)
  const [open, setOpen] = useState(false)

  const actionData = useActionData() as ActionData

  useEffect(() => {
    setOrderedChapters(chapters)
  }, [chapters])

  const formRef = useRef<HTMLFormElement>(null)
  const fetcher = useFetcher()
  const saveUpdatedOrder = () => {
    const hasNewOrder =
      chapters.length === orderedChapters.length &&
      !chapters.every(
        (chapter, index) => chapter.id === orderedChapters[index].id,
      )
    if (!hasNewOrder) return
    if (!formRef.current) {
      console.error('form not initialized')
      return
    }
    const formData = new FormData(formRef.current)
    formData.set('_action', 'REORDER_CHAPTERS')
    fetcher.submit(formData, { method: 'post' })
  }

  const { toast } = useToast()
  useEffect(() => {
    const hasData = (data: unknown): data is { success: boolean } => {
      return data != null && Object.hasOwn(data, 'success')
    }

    if (
      fetcher?.formData?.get('_action') === 'REORDER_CHAPTERS' &&
      hasData(fetcher.data) &&
      fetcher.data.success === true
    ) {
      toast({
        description: 'Chapter order successfully updated',
      })
    }
  }, [fetcher.data, fetcher.formData, toast])

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
      <fetcher.Form method="post" noValidate ref={formRef}>
        <Reorder.Group
          values={orderedChapters}
          onReorder={setOrderedChapters}
          className="relative mt-3"
          axis="y"
        >
          {orderedChapters.map((c, i) => (
            <Chapter
              key={c.id}
              chapter={c}
              order={i}
              onDragEnd={saveUpdatedOrder}
            />
          ))}
        </Reorder.Group>

        <div className="grid grid-cols-2 gap-4" id="order-action">
          {actionData?.errors?.reorder && (
            <div className="col-span-2 pt-1 text-red-500" id="reorder-error">
              {actionData.errors.reorder}
            </div>
          )}
        </div>
      </fetcher.Form>

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
  const actionData = useActionData() as ActionData
  const titleRef = useRef<HTMLInputElement>(null)
  const [newTitle, setNewTitle] = useState(title)

  useEffect(() => {
    if (actionData?.errors?.edit) {
      titleRef.current?.focus()
    } else if (actionData?.success) {
      setOpen(false)
    }
  }, [actionData, setOpen])

  const onClose = () => {
    setNewTitle(title)
    setOpen(false)
  }

  useEffect(() => {
    setNewTitle(title)
  }, [title])

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col pt-3">
        <div className="px-3 pb-4 shadow-sm">
          <div className="relative mt-2 text-center">
            <span className="font-medium">Edit Chapter</span>
          </div>
        </div>
        <div className="flex-1">
          <Form method="post" noValidate className="flex flex-col gap-6 p-2">
            <input type="hidden" name="chapterId" value={id} />
            <div>
              <OutlinedInput
                ref={titleRef}
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
                  autoFocus: true,
                  required: true,
                  'aria-invalid': actionData?.errors?.edit ? true : undefined,
                  'aria-describedby': 'edit-error',
                }}
              />
              {actionData?.errors?.edit && (
                <div className="pt-1 text-red-500" id="edit-error">
                  {actionData.errors.edit}
                </div>
              )}
            </div>

            <Button
              name="_action"
              value="RENAME_CHAPTER"
              disabled={title === newTitle}
            >
              Save Changes
            </Button>
          </Form>
        </div>
      </div>
    </Modal>
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
  const actionData = useActionData() as ActionData

  const onClose = () => setOpen(false)

  return (
    <Modal
      open={open}
      onClose={onClose}
      scaleBackground
      backdropColor="rgba(244,63,94,.7)"
    >
      <div className="flex flex-col pt-3">
        <div className="px-3 pb-4 shadow-sm">
          <div className="relative mt-2 text-center">
            <span className="font-medium">Delete Chapter</span>
            <div className="absolute inset-y-0 right-0">
              <button
                type="button"
                className="mr-1 text-blue-500 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <Form
            method="post"
            noValidate
            className="flex flex-col gap-6 p-2 text-center"
          >
            <input type="hidden" name="chapterId" value={id} />
            <div className="px-4">
              <Text as="p">
                Are you sure you want to delete{' '}
                <Text as="span" variant="title3">
                  {title}
                </Text>{' '}
                and all related discussions and posts?
              </Text>
            </div>
            <div>
              <Button
                name="_action"
                value="DELETE_CHAPTER"
                variant="warning"
                fullWidth
              >
                Delete Chapter
              </Button>
              {actionData?.errors?.delete && (
                <div className="pt-1 text-red-500" id="delete-error">
                  {actionData.errors.delete}
                </div>
              )}
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

const NewChapterModal = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const actionData = useActionData() as ActionData
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.create) {
      titleRef.current?.focus()
    } else if (actionData?.success) {
      setOpen(false)
    }
  }, [actionData, setOpen])

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      scaleBackground
      backdropColor="rgba(79,70,229,.7)"
    >
      <div className="flex flex-col pt-3">
        <div className="px-3 pb-4 shadow-sm">
          <div className="mt-2 text-center">
            <span className="font-medium">Add Chapter</span>
          </div>
        </div>
        <div className="flex-1">
          <Form method="post" noValidate className="flex flex-col gap-6 p-2">
            <div>
              <OutlinedInput
                ref={titleRef}
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
                  autoFocus: true,
                  required: true,
                  'aria-invalid': actionData?.errors?.create ? true : undefined,
                  'aria-describedby': 'create-error',
                }}
              />
              {actionData?.errors?.create && (
                <div className="pt-1 text-red-500" id="create-error">
                  {actionData.errors.create}
                </div>
              )}
            </div>

            <Button name="_action" value="CREATE_CHAPTER">
              Create Chapter
            </Button>
          </Form>
        </div>
      </div>
    </Modal>
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
  onDragEnd,
}: {
  chapter: RequiredFuncType<typeof getChapterList>[number]
  order: number
  onDragEnd: () => void
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
      onDragEnd={onDragEnd}
      className="relative mb-4 rounded-lg bg-background-secondary p-4"
    >
      <span className="text-xs text-gray-400">
        <span className="font-bold">Club Order:</span> {order + 1}
      </span>
      <label
        htmlFor={chapter.id}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex flex-grow items-center gap-2">
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
      className="h-4 w-4 flex-shrink-0 cursor-grab touch-pan-x select-none"
      onPointerDown={event => dragControls.start(event)}
    >
      <path
        d="M 5 0 C 7.761 0 10 2.239 10 5 C 10 7.761 7.761 10 5 10 C 2.239 10 0 7.761 0 5 C 0 2.239 2.239 0 5 0 Z"
        fill="#CCC"
      />
      <path
        d="M 19 0 C 21.761 0 24 2.239 24 5 C 24 7.761 21.761 10 19 10 C 16.239 10 14 7.761 14 5 C 14 2.239 16.239 0 19 0 Z"
        fill="#CCC"
      />
      <path
        d="M 33 0 C 35.761 0 38 2.239 38 5 C 38 7.761 35.761 10 33 10 C 30.239 10 28 7.761 28 5 C 28 2.239 30.239 0 33 0 Z"
        fill="#CCC"
      />
      <path
        d="M 33 14 C 35.761 14 38 16.239 38 19 C 38 21.761 35.761 24 33 24 C 30.239 24 28 21.761 28 19 C 28 16.239 30.239 14 33 14 Z"
        fill="#CCC"
      />
      <path
        d="M 19 14 C 21.761 14 24 16.239 24 19 C 24 21.761 21.761 24 19 24 C 16.239 24 14 21.761 14 19 C 14 16.239 16.239 14 19 14 Z"
        fill="#CCC"
      />
      <path
        d="M 5 14 C 7.761 14 10 16.239 10 19 C 10 21.761 7.761 24 5 24 C 2.239 24 0 21.761 0 19 C 0 16.239 2.239 14 5 14 Z"
        fill="#CCC"
      />
      <path
        d="M 5 28 C 7.761 28 10 30.239 10 33 C 10 35.761 7.761 38 5 38 C 2.239 38 0 35.761 0 33 C 0 30.239 2.239 28 5 28 Z"
        fill="#CCC"
      />
      <path
        d="M 19 28 C 21.761 28 24 30.239 24 33 C 24 35.761 21.761 38 19 38 C 16.239 38 14 35.761 14 33 C 14 30.239 16.239 28 19 28 Z"
        fill="#CCC"
      />
      <path
        d="M 33 28 C 35.761 28 38 30.239 38 33 C 38 35.761 35.761 38 33 38 C 30.239 38 28 35.761 28 33 C 28 30.239 30.239 28 33 28 Z"
        fill="#CCC"
      />
    </svg>
  )
}

type ActionData =
  | {
      errors: {
        create?: string
        edit?: string
        delete?: string
        reorder?: string
      }
      success?: never
    }
  | { errors?: never; success: true }

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  const { clubId } = params

  invariant(clubId, 'expected clubId')

  const formData = await request.formData()

  const action = formData.get('_action')
  if (!action)
    throw new Response(null, { status: 400, statusText: 'Missing action' })

  switch (action) {
    case 'CREATE_CHAPTER': {
      const title = formData.get('title')
      if (!title || typeof title !== 'string')
        return json<ActionData>(
          { errors: { create: 'Chapter title is required' } },
          { status: 400 },
        )

      const club = await getClub(clubId, userId)

      if (!club)
        return json<ActionData>(
          { errors: { create: 'Error creating chapter' } },
          { status: 404 },
        )
      if (club.ownerId !== userId)
        return json<ActionData>(
          { errors: { create: 'Not allowed to create new chapters' } },
          { status: 400 },
        )

      try {
        await createChapter(clubId, title)
        return json<ActionData>({ success: true })
      } catch {
        return json<ActionData>(
          { errors: { create: 'Error creating chapter' } },
          { status: 500 },
        )
      }
    }
    case 'DELETE_CHAPTER': {
      const chapterId = formData.get('chapterId')
      if (!chapterId || typeof chapterId !== 'string')
        return json<ActionData>(
          { errors: { delete: 'Chapter is required' } },
          { status: 400 },
        )

      const club = await getClub(clubId, userId)

      if (!club)
        return json<ActionData>(
          { errors: { delete: 'Error deleting chapter' } },
          { status: 404 },
        )
      if (club.ownerId !== userId)
        return json<ActionData>(
          { errors: { delete: 'Not allowed to delete chapters' } },
          { status: 400 },
        )

      try {
        await deleteChapter(chapterId)
        return json<ActionData>({ success: true })
      } catch {
        return json<ActionData>(
          { errors: { delete: 'Error deleting chapter' } },
          { status: 500 },
        )
      }
    }
    case 'RENAME_CHAPTER': {
      const chapterId = formData.get('chapterId')
      const title = formData.get('title')
      if (!chapterId || typeof chapterId !== 'string')
        return json<ActionData>(
          { errors: { edit: 'Chapter is required' } },
          { status: 400 },
        )

      if (!title || typeof title !== 'string' || title.length === 0)
        return json<ActionData>(
          { errors: { edit: 'Chapter title is required' } },
          { status: 400 },
        )

      const club = await getClub(clubId, userId)

      if (!club)
        return json<ActionData>(
          { errors: { edit: 'Error remaning chapter' } },
          { status: 404 },
        )
      if (club.ownerId !== userId)
        return json<ActionData>(
          { errors: { edit: 'Not allowed to rename chapters' } },
          { status: 400 },
        )

      try {
        await renameChapter(chapterId, title)
        return json<ActionData>({ success: true })
      } catch {
        return json<ActionData>(
          { errors: { edit: 'Error renaming chapter' } },
          { status: 500 },
        )
      }
    }
    case 'REORDER_CHAPTERS': {
      const club = await getClub(clubId, userId)

      if (!club)
        return json<ActionData>(
          { errors: { reorder: 'Error reordering chapters' } },
          { status: 404 },
        )
      if (club.ownerId !== userId)
        return json<ActionData>(
          { errors: { reorder: 'Not allowed to reorder chapters' } },
          { status: 400 },
        )

      const chapters = formData.getAll('chapters').map(c => {
        const str = c.toString()
        const [id, ...order] = str.split(':')
        return {
          id: id,
          order: Number(order.join(':')),
        }
      })

      try {
        await reorderChapters(chapters)
        return json<ActionData>({ success: true })
      } catch {
        return json<ActionData>(
          { errors: { reorder: 'Error reordering chapters' } },
          { status: 500 },
        )
      }
    }
    default:
      throw new Response(null, { status: 400 })
  }
}
