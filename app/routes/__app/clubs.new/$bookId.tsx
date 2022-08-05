import invariant from 'tiny-invariant'
import { useMemo, useState } from 'react'
import { intervalToDuration } from 'date-fns'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { ChevronLeftIcon } from '@heroicons/react/outline'
import type { LoaderFunction, ActionFunction } from '@remix-run/node'

import Button from '~/elements/Button'
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

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request)

  invariant(params.bookId, 'expected book id')

  const [chapters, details] = await Promise.all([
    getChapters(params.bookId),
    getDetails(params.bookId),
  ])

  const defaultCover =
    details.product.product_images?.[720] ?? '/images/no-cover.png'

  return json({
    book: {
      chapters: chapters?.content_metadata?.chapter_info.chapters ?? [],
      id: details.product.asin,
      title: details.product.title,
      subtitle: details.product.subtitle,
      description: details.product.merchandising_summary,
      image: defaultCover,
      publishDate: details.product.release_date,
      authors: details.product.authors.map((a: { name: string }) => a.name),
    },
  })
}

export default function BookPage() {
  const { book } = useLoaderData() as LoaderData

  const [cover, setCover] = useState(book.image)
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="bg-background-secondary">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-4">
          <TextLink
            to={`/clubs/new/search?q=${encodeURIComponent(book.title)}`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </TextLink>
          <TextLink serif variant="title2" className="block" to=".">
            Import Book
          </TextLink>
        </div>
      </div>

      <Form method="post">
        <div className="relative py-6 pt-10">
          <div
            className="absolute inset-0 bg-fixed"
            style={{
              backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
            }}
          />
          <div className="relative mx-auto aspect-book w-full max-w-[200px] overflow-hidden rounded-lg shadow-md">
            <input type="hidden" name="image" value={cover} />
            <img
              className="h-full w-full object-cover"
              src={cover}
              alt="selected cover"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md space-y-6 px-8">
          <div className="mt-1 flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCover(book.image)}
              disabled={cover === book.image}
            >
              Reset Cover
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(true)}
            >
              Change Cover
            </Button>
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

      <CoverSelectSlideOver
        open={open}
        setOpen={setOpen}
        title={book.title}
        setCover={setCover}
      />
    </div>
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

  const chapters = formData.getAll('chapters').map(c => {
    const str = c.toString()
    const [order, ...title] = str.split(':')
    return {
      title: title.join(':'),
      order: Number(order),
    }
  })

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
