import { useMemo } from 'react'
import { DateTime } from 'luxon'

import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import { SearchIcon, ChevronLeftIcon } from '@heroicons/react/outline'
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react'

import { toLuxonDate } from '~/utils'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'

type LoaderData = {
  results: {
    id: string
    key: string
    title: string
    publishDate: string
    image: string
    authors: string[]
  }[]
} | null

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)

  const search = new URL(request.url).searchParams.get('q')

  if (!search) return null

  const audibleResults = await fetch(
    `https://api.audible.com/1.0/catalog/products?title=${encodeURIComponent(
      search,
    )}&products_sort_by=Relevance&response_groups=media,contributors&image_sizes=720`,
  ).then(res => res.json())

  // @ts-ignore
  const audibles = audibleResults.products.map(b => ({
    id: b.asin,
    title: b.title,
    subtitle: b.subtitle,
    image: b.product_images?.[720] ?? '/images/no-cover.png',
    publishDate: b.release_date,
    // @ts-ignore
    authors: b.authors.map(a => a.name),
  }))

  return json({
    results: audibles,
  })
}

const BOOKS = ['Leviathan Wakes', 'Warbreaker', 'Dune']

export const handle = {
  topNav: () => (
    <div className="bg-background-secondary">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 pb-4">
        <TextLink to="/clubs/new">
          <ChevronLeftIcon className="h-4 w-4" />
        </TextLink>
        <Text serif variant="title2" as="p">
          Import Book
        </Text>
      </div>
    </div>
  ),
}

export default function Page() {
  const data = useLoaderData() as LoaderData
  const [params] = useSearchParams()

  const placeholder = useMemo(
    () => BOOKS[Math.floor(Math.random() * BOOKS.length)],
    [],
  )

  return (
    <div>
      <div className="mb-4 h-12" />

      <div className="mx-auto w-full max-w-md px-8 md:max-w-lg">
        <Form method="get" className="mb-4">
          <div>
            <label
              htmlFor="search-title"
              className="block text-sm font-medium text-white"
            >
              Search Books
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <input
                  type="text"
                  name="q"
                  id="search-title"
                  className="block w-full rounded-none rounded-l-md border-background-tertiary bg-background-secondary text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={placeholder}
                  defaultValue={params.get('q') ?? undefined}
                />
              </div>
              <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-background-tertiary bg-background-secondary px-4 py-2 text-sm font-medium text-white hover:bg-background-tertiary focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <SearchIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </Form>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {data?.results.map(book => (
            <Link
              to={`/clubs/new/${book.id}`}
              key={book.id}
              className="grid content-start gap-2"
            >
              <div className="mx-auto aspect-book w-full max-w-[200px] overflow-hidden rounded-lg shadow-md">
                <img
                  className="h-full w-full object-cover"
                  src={book.image}
                  alt={`${book.title} cover`}
                />
              </div>
              <div>
                <Text as="p">{book.title}</Text>
                <Text as="p" variant="caption">
                  By {book.authors.join(', ')}
                </Text>
                <Text as="p" variant="caption">
                  Published{' '}
                  {toLuxonDate(book.publishDate).toLocaleString(
                    DateTime.DATE_MED,
                  )}
                </Text>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
