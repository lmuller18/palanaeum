import { useEffect } from 'react'
import invariant from 'tiny-invariant'
import { json, LoaderFunction, useLoaderData, useSearchParams } from 'remix'
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/outline'

import { requireUserId } from '~/session.server'
import ChapterCard from '~/components/ChapterCard'
import NextChapterSection from '~/components/NextChapterSection'
import { ChapterListItem, getChapterList } from '~/models/chapter.server'

interface LoaderData {
  chapters: ChapterListItem[]
  nextChapter: ChapterListItem | null
  pagination: {
    page: number
    size: number
    count: number
    totalCount: number
    totalPages: number
    nextPage: number | null
    previousPage: number | null
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'clubId not found')
  const pageParam = Number(new URL(request.url).searchParams.get('page'))

  const page = !pageParam || isNaN(pageParam) ? 0 : pageParam
  const size = 10

  const { chapters, nextChapter, totalChapters } = await getChapterList({
    userId,
    clubId: params.clubId,
    page,
    size,
  })

  const totalPages = Math.ceil(totalChapters / size)
  const nextPage = page + 1 > totalPages - 1 ? null : page + 1
  const previousPage = page - 1 < 0 ? null : page - 1

  return json<LoaderData>({
    chapters,
    nextChapter,
    pagination: {
      page,
      size,
      count: chapters.length,
      totalCount: totalChapters,
      totalPages,
      nextPage,
      previousPage,
    },
  })
}

export default function ClubIndexPage() {
  const data = useLoaderData() as LoaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const highlightedChapter = searchParams.get('highlight')
  const page = searchParams.get('page')

  useEffect(() => {
    if (highlightedChapter) {
      document
        .querySelector(`#${highlightedChapter}`)
        ?.scrollIntoView({ behavior: 'smooth' })
    } else if (page) {
      document.querySelector('#chapter-section')?.scrollIntoView()
    }
  }, [highlightedChapter, page])

  const paginate = (action: 'first' | 'previous' | 'next' | 'last') => {
    const options = { replace: true }

    switch (action) {
      case 'first':
        setSearchParams({ page: '0' }, options)
        break
      case 'previous':
        setSearchParams({ page: `${data.pagination.previousPage}` }, options)
        break
      case 'next':
        setSearchParams({ page: `${data.pagination.nextPage}` }, options)
        break
      case 'last':
        setSearchParams({ page: `${data.pagination.totalPages - 1}` }, options)
        break
    }
  }

  return (
    <div>
      <div className="px-6">
        <NextChapterSection
          chapter={data.nextChapter}
          listSize={data.pagination.size}
        />
      </div>

      <div className="relative mb-4 scroll-my-20 px-8" id="chapter-section">
        <div
          className="absolute inset-0 flex items-center px-8"
          aria-hidden="true"
        >
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <div className="bg-background-primary px-2">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-background-secondary p-3 shadow-lg">
              <BookOpenIcon className="text-white" />
              <div
                className="absolute inset-0 bg-gradient-to-l from-fuchsia-300 to-blue-400 mix-blend-darken"
                style={{
                  backgroundSize: '400% 400%',
                  animation: 'gradient 6s ease infinite',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div role="list" className="flex flex-col gap-4">
          {data.chapters.length === 0 ? (
            <p className="p-4">No Chapters Yet</p>
          ) : (
            data.chapters.map((chapter, i) => (
              <article
                key={chapter.id + '-' + i}
                id={chapter.id}
                className="scroll-mt-24"
              >
                <ChapterCard chapter={chapter} />
              </article>
            ))
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-black bg-opacity-70 p-1 disabled:opacity-30"
              disabled={data.pagination.previousPage == null}
              onClick={() => paginate('first')}
            >
              <ChevronDoubleLeftIcon />
            </button>

            <button
              type="button"
              className="h-8 w-8 rounded-full bg-black bg-opacity-70 p-1 disabled:opacity-30"
              disabled={data.pagination.previousPage == null}
              onClick={() => paginate('previous')}
            >
              <ChevronLeftIcon />
            </button>

            <button
              type="button"
              className="h-8 w-8 rounded-full bg-black bg-opacity-70 p-1 disabled:opacity-30"
              disabled={data.pagination.nextPage == null}
              onClick={() => paginate('next')}
            >
              <ChevronRightIcon />
            </button>

            <button
              type="button"
              className="h-8 w-8 rounded-full bg-black bg-opacity-70 p-1 disabled:opacity-30"
              disabled={data.pagination.nextPage == null}
              onClick={() => paginate('last')}
            >
              <ChevronDoubleRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
