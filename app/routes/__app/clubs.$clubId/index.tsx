import invariant from 'tiny-invariant'
import { json, LoaderFunction, useLoaderData } from 'remix'

import { requireUserId } from '~/session.server'
import ChapterCard from '~/components/ChapterCard'
import NextChapterSection from '~/components/NextChapterSection'
import { ChapterListItem, getChapterList } from '~/models/chapter.server'

interface LoaderData {
  chapters: ChapterListItem[]
  nextChapter: ChapterListItem | null
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'clubId not found')

  const { chapters, nextChapter } = await getChapterList({
    userId,
    clubId: params.clubId,
  })
  return json<LoaderData>({ chapters, nextChapter })
}

export default function ClubIndexPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div>
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="px-4">
          <NextChapterSection chapter={data.nextChapter} />
        </div>

        <div className="px-4">
          <ul
            role="list"
            className="divide-y divide-gray-200 border border-gray-200"
          >
            {data.chapters.length === 0 ? (
              <p className="p-4">No Chapters Yet</p>
            ) : (
              data.chapters.map((chapter, i) => (
                <li key={chapter.id + '-' + i}>
                  <ChapterCard chapter={chapter} />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
