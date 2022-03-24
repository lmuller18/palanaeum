import invariant from 'tiny-invariant'
import { Link, json, LoaderFunction, useLoaderData } from 'remix'

import { requireUserId } from '~/session.server'
import TextLink from '~/components/elements/TextLink'
import { getChapterList } from '~/models/chapter.server'
import Progress from '~/components/elements/Progress'

interface LoaderData {
  chapters: Awaited<ReturnType<typeof getChapterList>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'clubId not found')

  const chapters = await getChapterList({ userId, clubId: params.clubId })
  return json<LoaderData>({ chapters })
}

export default function ClubIndexPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div>
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="px-8 py-4 shadow sm:px-6">
          <p>All chapters complete!</p>
          <p className="text-xs">
            Continue participating in{' '}
            <TextLink to="." color="indigo">
              the conversation
            </TextLink>
          </p>
        </div>

        <div className="px-2">
          <ul
            role="list"
            className="divide-y divide-gray-200 border border-gray-200"
          >
            {data.chapters.length === 0 ? (
              <p className="p-4">No Chapters Yet</p>
            ) : (
              [...data.chapters, ...data.chapters, ...data.chapters].map(
                (chapter, i) => (
                  <li key={chapter.id + '-' + i}>
                    <Link
                      to={chapter.id}
                      className="block hover:bg-background-secondary"
                    >
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <Progress value={i % 2 === 0 ? 100 : 50} />
                        <div className="flex min-w-0 flex-1 items-center">
                          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                            <div>
                              <p className="truncate text-sm font-medium text-indigo-600">
                                {chapter.title}
                              </p>
                            </div>
                            <p>Done?</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ),
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
