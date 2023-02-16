import React, { useMemo, Fragment, useState, useEffect } from 'react'

import { Form, useFetcher } from '@remix-run/react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon, SearchIcon } from '@heroicons/react/outline'
import type { FetcherWithComponents } from '@remix-run/react'

import Text from '~/elements/Typography/Text'

const BOOKS = ['Leviathan Wakes', 'Warbreaker', 'Dune']

interface Book {
  id: string
  title: string
  image: string
  publishDate: string
  author: string
}

const CoverSelectSlideOver = ({
  open,
  setOpen,
  title,
  setCover,
}: {
  title: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCover: (newCover: string) => void
}) => {
  const [selected, setSelected] = useState<Book | null>(null)
  const placeholder = useMemo(
    () => BOOKS[Math.floor(Math.random() * BOOKS.length)],
    [],
  )

  const searchFetcher = useFetcher<{
    results: Book[]
  }>()

  const search = (q: string) => {
    setSelected(null)
    searchFetcher.load(`/api/books/search?q=${encodeURIComponent(q)}`)
  }

  const selectCover = (cover: string) => {
    setCover(cover)
    setOpen(false)
  }

  useEffect(() => {
    search(title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-96">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-white"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full overflow-y-auto bg-background-tertiary p-8">
                    <div className="pb-16">
                      <Form
                        onSubmit={e => {
                          e.preventDefault()
                          const searchElement =
                            e.currentTarget.elements.namedItem(
                              'q',
                            ) as HTMLInputElement
                          search(searchElement.value)
                        }}
                        className="mb-4"
                      >
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
                              defaultValue={title}
                            />
                          </div>
                          <button className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-background-tertiary bg-background-secondary px-4 py-2 text-sm font-medium text-white hover:bg-background-tertiary focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <SearchIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </Form>

                      <div>
                        {selected && (
                          <div>
                            <Text as="p" variant="title3" className="mb-2">
                              Cover Select
                            </Text>
                            <CoverSelect
                              book={selected}
                              selectCover={selectCover}
                            />
                          </div>
                        )}

                        {!selected && (
                          <div>
                            <Text as="p" variant="title3" className="mb-2">
                              Book Search Results
                            </Text>
                            <SearchResults
                              fetcher={searchFetcher}
                              setSelected={setSelected}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

const CoverSelect = ({
  book,
  selectCover,
}: {
  book: Book
  selectCover: (cover: string) => void
}) => {
  const fetcher = useFetcher<{ covers: string[] }>()

  useEffect(() => {
    fetcher.load(`/api${book.id}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book])

  if (fetcher.state !== 'idle') return <Text>...loading</Text>

  if (!fetcher.data?.covers || fetcher.data.covers.length === 0)
    return <Text>No covers found.</Text>

  return (
    <div className="grid gap-4">
      {fetcher.data.covers.map(c => (
        <div
          key={c}
          className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat p-4"
          onClick={() => selectCover(c)}
          style={{
            backgroundImage: `url("${c}")`,
          }}
        >
          <div className="absolute inset-0 h-full w-full backdrop-blur-sm" />
          <img
            src={c}
            className="relative aspect-book w-full max-w-[180px] rounded-lg object-cover"
            alt={`${book.title} alternate cover`}
          />
        </div>
      ))}
    </div>
  )
}

const SearchResults = ({
  fetcher,
  setSelected,
}: {
  setSelected: React.Dispatch<React.SetStateAction<Book | null>>
  fetcher: FetcherWithComponents<{
    results: {
      id: string
      title: string
      image: string
      publishDate: string
      author: string
    }[]
  }>
}) => {
  if (fetcher.state !== 'idle') return <div>loading...</div>

  if (!fetcher.data?.results?.length) return <div>No Results</div>

  return (
    <div className="grid gap-4">
      {fetcher.data.results.map(book => (
        <div
          key={book.id}
          className="grid cursor-pointer grid-cols-2 gap-2"
          onClick={() => setSelected(book)}
        >
          <img
            src={book.image}
            className="aspect-book w-full object-cover"
            alt={`${book.title} cover`}
          />
          <div>
            {book.title && (
              <Text as="p" className="mb-2" variant="subtitle2">
                {book.title}
              </Text>
            )}
            {book.publishDate && (
              <Text as="p" variant="caption">
                {book.publishDate}
              </Text>
            )}
            {book.author && (
              <Text as="p" variant="caption">
                {book.author}
              </Text>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CoverSelectSlideOver
