import invariant from 'tiny-invariant'
import { intervalToDuration } from 'date-fns'
import AvatarEditor from 'react-avatar-editor'
import { useRef, useMemo, Fragment, useState } from 'react'

import {
  RefreshIcon as ResetActiveIcon,
  PhotographIcon as ChangeActiveIcon,
  ArrowsExpandIcon as RepositionActiveIcon,
} from '@heroicons/react/solid'
import {
  RefreshIcon as ResetInactiveIcon,
  PhotographIcon as ChangeInactiveIcon,
  ArrowsExpandIcon as RepositionInactiveIcon,
} from '@heroicons/react/outline'
import { json, redirect } from '@remix-run/node'
import { Menu, Transition } from '@headlessui/react'
import type { LoaderFunctionArgs, ActionFunction } from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import { ChevronLeftIcon, ChevronDownIcon } from '@heroicons/react/outline'

import Button from '~/elements/Button'
import Modal from '~/components/Modal'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import { createClub } from '~/models/clubs.server'
import OutlinedInput from '~/elements/OutlinedInput'
import CoverSelectSlideOver from '~/components/CoverSelectSlideOver'

interface LoaderData {
  book: {
    id: string
    title: string
    subtitle: string
    description: string
    image: string
    publishDate: string
    authors: string[]
    chapters: {
      length_ms: number
      start_offset_ms: number
      start_offset_sec: number
      title: 'Opening Credits'
    }[]
  }
}

const getChapters = async (asin: string) =>
  fetch(
    `https://api.audible.com/1.0/content/${asin}/metadata?response_groups=chapter_info`,
  ).then(res => res.json())

const getDetails = async (asin: string) =>
  fetch(
    `https://api.audible.com/1.0/catalog/products/${asin}?response_groups=contributors,media&image_sizes=720`,
  ).then(res => res.json())

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireUserId(request)

  invariant(params.bookId, 'expected book id')

  const [chapters, details] = await Promise.all([
    getChapters(params.bookId),
    getDetails(params.bookId),
  ])

  const audibleCover = details.product.product_images?.[720]
  const cover = audibleCover
    ? `/soulcast/${encodeURI(audibleCover)}`
    : '/images/no-cover.png'

  return json<LoaderData>({
    book: {
      chapters: chapters?.content_metadata?.chapter_info.chapters ?? [],
      id: details.product.asin,
      title: details.product.title,
      subtitle: details.product.subtitle,
      description: details.product.merchandising_summary,
      image: cover,
      publishDate: details.product.release_date,
      authors: details.product.authors.map((a: { name: string }) => a.name),
    },
  })
}

export const handle = {
  topNav: ({ data: { book } }: { data: { book: { title: string } } }) => (
    <div className="bg-background-secondary">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-4">
        <TextLink to={`/clubs/new/search?q=${encodeURIComponent(book.title)}`}>
          <ChevronLeftIcon className="h-4 w-4" />
        </TextLink>
        <Text serif variant="title2" as="p">
          Import Book
        </Text>
      </div>
    </div>
  ),
}

export default function BookPage() {
  const { book } = useLoaderData<typeof loader>()

  const [cover, setCover] = useState(book.image)
  const [croppedCover, setCroppedCover] = useState<string>(book.image)
  const [open, setOpen] = useState(false)
  const [repositionOpen, setRepositionOpen] = useState(false)

  const resetCover = () => {
    setCover(book.image)
    setCroppedCover(book.image)
  }

  const selectCover = (newCover: string) => {
    setCover(newCover)
    setCroppedCover(newCover)
  }

  return (
    <div>
      <div className="h-12" />

      <Form method="post">
        <div className="relative py-6 pt-10">
          <div
            className="absolute inset-0 bg-fixed"
            style={{
              backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
            }}
          />
          <div className="relative mx-auto aspect-book w-full max-w-[200px] overflow-hidden rounded-lg shadow-md">
            <input type="hidden" name="image" value={croppedCover} />
            <img
              className="h-full w-full object-cover"
              src={croppedCover}
              alt="selected cover"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6 px-8">
          <div className="mt-1 flex justify-end">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                >
                  Cover Options
                  <ChevronDownIcon
                    className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
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
                <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-500 rounded-md bg-background-secondary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setRepositionOpen(true)}
                          className={`${
                            active && 'bg-violet-500 text-white'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                        >
                          {active ? (
                            <RepositionActiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <RepositionInactiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          Reposition
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          className={`${
                            active && 'bg-violet-500 text-white'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                        >
                          {active ? (
                            <ChangeActiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChangeInactiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          Change
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={resetCover}
                          className={`${
                            active && 'bg-violet-500 text-white'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                        >
                          {active ? (
                            <ResetActiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ResetInactiveIcon
                              className="mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          Reset
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          <OutlinedInput
            labelProps={{
              htmlFor: 'title',
              children: 'Title',
            }}
            inputProps={{
              type: 'text',
              name: 'title',
              id: 'title',
              placeholder: 'Book Title',
              defaultValue: book.title,
            }}
          />

          <OutlinedInput
            labelProps={{
              htmlFor: 'author',
              children: 'Author',
            }}
            inputProps={{
              type: 'text',
              name: 'author',
              id: 'author',
              placeholder: 'Author',
              defaultValue: book.authors.join(', '),
            }}
          />

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Chapters
            </label>
            <div className="mt-3 flex flex-col gap-4">
              {book.chapters.map((c, i) => (
                <Chapter
                  key={c.title + '-' + i}
                  title={c.title}
                  length_ms={c.length_ms}
                  order={i}
                />
              ))}
            </div>
          </div>

          <div className="text-right">
            <Button fullWidth="sm">Create Club</Button>
          </div>
        </div>
      </Form>

      {repositionOpen && (
        <CoverReposition
          setOpen={setRepositionOpen}
          image={cover}
          setCroppedCover={setCroppedCover}
        />
      )}

      <CoverSelectSlideOver
        open={open}
        setOpen={setOpen}
        title={book.title}
        setCover={selectCover}
      />
    </div>
  )
}

const CoverReposition = ({
  image,
  setOpen,
  setCroppedCover,
}: {
  image: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCroppedCover: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [scale, setScale] = useState(1)
  const ref = useRef<AvatarEditor>(null)
  const fetcher = useFetcher()

  const onClose = () => {
    setOpen(false)
  }

  const onSave = async () => {
    if (ref.current) {
      const canvas = ref.current
      const blob = await new Promise<string | null>(resolve =>
        resolve(canvas.getImage().toDataURL()),
      )

      if (!blob) return
      setCroppedCover(blob)
    }
    onClose()
  }

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col pt-3">
        <div className="px-3 pb-4 shadow-sm">
          <div className="relative mt-2 text-center">
            <span className="font-medium">Upload Header</span>
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
            <div className="flex flex-col items-center">
              <AvatarEditor
                image={image}
                width={334}
                height={500}
                scale={scale}
                ref={ref}
                crossOrigin="anonymous"
              />

              <input
                type="range"
                value={scale}
                min={1}
                max={2}
                step={0.01}
                onChange={e => setScale(Number(e.target.value))}
              />

              <Button
                type="button"
                onClick={onSave}
                disabled={fetcher.state === 'submitting'}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const Chapter = ({
  title,
  length_ms,
  order,
}: {
  title: string
  length_ms: number
  order: number
}) => {
  const id = `chapter-${title}-${order}`
  const [chapterName, setChapterName] = useState(title)
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-background-secondary p-4"
    >
      <div className="flex flex-grow items-center gap-2">
        <input
          id={id}
          type="checkbox"
          name="chapters"
          value={`${order}:${chapterName}`}
          defaultChecked
        />
        <input
          className="flex-grow border-gray-700 bg-background-secondary transition-colors focus:border-gray-300 focus:outline-none"
          value={chapterName}
          onChange={e => setChapterName(e.target.value)}
        />
      </div>
      <Duration time={length_ms} />
    </label>
  )
}

const Duration = ({ time }: { time: number }) => {
  const duration = intervalToDuration({ start: 0, end: time })
  const minutes = duration.minutes
  const seconds = useMemo(() => {
    const s = duration.seconds
    if (!s) return '00'
    if (s < 10) return `0${s}`
    return s
  }, [duration])
  return (
    <Text variant="caption">
      {minutes}:{seconds}
    </Text>
  )
}

interface ActionData {
  errors: {
    title?: string
    image?: string
    chapters?: string
    author?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const formData = await request.formData()

  const title = formData.get('title')
  const author = formData.get('author')
  const image = formData.get('image')
  const chaptersArray = formData.getAll('chapters')

  if (typeof title !== 'string' || title.length === 0) {
    return json<ActionData>(
      { errors: { title: 'Title is required' } },
      { status: 400 },
    )
  }

  if (typeof author !== 'string' || author.length === 0) {
    return json<ActionData>(
      { errors: { author: 'Author is required' } },
      { status: 400 },
    )
  }

  if (typeof image !== 'string' || image.length === 0) {
    return json<ActionData>(
      { errors: { image: 'Image is required' } },
      { status: 400 },
    )
  }

  if (chaptersArray.length === 0) {
    return json<ActionData>(
      { errors: { chapters: 'At least one chapter is required' } },
      { status: 400 },
    )
  }

  const chapters = formData
    .getAll('chapters')
    .map(c => {
      const str = c.toString()
      const [order, ...title] = str.split(':')
      return {
        title: title.join(':'),
        order: Number(order),
      }
    })
    .sort((a, b) => a.order - b.order)
    .map((c, i) => ({
      title: c.title,
      order: i,
    }))

  const club = await createClub({
    title,
    image,
    author,
    userId,
    chapters,
  })
  return redirect(`/clubs/${club.id}/members/manage`)
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
