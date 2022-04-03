import invariant from 'tiny-invariant'
import { BookOpenIcon } from '@heroicons/react/outline'
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
        <div className="px-6">
          <NextChapterSection chapter={data.nextChapter} />
        </div>

        <div className="relative mb-4 px-8">
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
          </div>
        </div>
      </div>
    </div>
  )
}
