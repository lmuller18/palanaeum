import clsx from 'clsx'
import { json, Link, LoaderFunction, useLoaderData } from 'remix'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import ChapterPagination from '~/components/ChapterPagination'

const PAGE_SIZE = 5

const paginate = (array: any[], page_size: number, page_number: number) => {
  return array.slice(
    (page_number - 1) * page_size,
    (page_number - 1) * page_size + page_size,
  )
}

const CHAPTERS = Array.from(Array(36)).map((_, i) => ({
  id: `${i}`,
  name: `Chapter ${i + 1}`,
  status: i < 4 ? 'complete' : i < 11 ? 'incomplete' : 'not_started',
}))

interface LoaderData {
  chapters: {
    id: string
    name: string
    status: 'complete' | 'incomplete' | 'not_started'
  }[]
  page: number
  totalPages: number
}

export const loader: LoaderFunction = ({ request }) => {
  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const pageNum = pageStr ? Number(pageStr) : 1

  const page = paginate(CHAPTERS, PAGE_SIZE, pageNum)

  return json({
    chapters: page,
    page: pageNum,
    totalPages: Math.ceil(CHAPTERS.length / PAGE_SIZE),
  })
}

export default function ChaptersPage() {
  const { chapters, page, totalPages } = useLoaderData() as LoaderData

  return (
    <>
      <div className="grid gap-4 p-2">
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="overflow-hidden rounded-md bg-background-secondary p-4 shadow-md"
          >
            <div>
              <TextLink
                to={chapter.id}
                variant="title3"
                className={clsx(
                  'mb-2 block w-fit border-b-2',
                  chapter.status === 'complete' && 'border-emerald-400',
                  chapter.status === 'incomplete' && 'border-amber-400',
                  chapter.status === 'not_started' && 'border-red-400',
                )}
              >
                {chapter.name}
              </TextLink>

              <Text variant="body2">Completed by 3 other members.</Text>
              {/* <Text variant="body2">Completed by all other members.</Text> */}
              {/* <Text variant="body2">Not completed by any other members.</Text> */}

              <div className="mt-3 flex items-center gap-4">
                <Text variant="caption">
                  <Text variant="subtitle2">3</Text> Discussions
                </Text>
                <Text variant="caption">
                  <Text variant="subtitle2">12</Text> Posts
                </Text>
              </div>

              <div className="mt-3 flex items-center justify-around">
                <Link
                  to={chapter.id}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Visit Chapter
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  Mark Read
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ChapterPagination currentPage={page} lastPage={totalPages} />
    </>
  )
}
