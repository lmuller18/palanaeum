import invariant from 'tiny-invariant'
import { json, Link, LoaderFunction, Outlet, useLoaderData } from 'remix'

import { requireUserId } from '~/session.server'
import { getChapterDetails, ChapterDetails } from '~/models/chapter.server'

interface LoaderData {
  chapter: ChapterDetails
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'clubId not found')
  invariant(params.chapterId, 'chapterId not found')

  const chapter = await getChapterDetails({
    userId,
    id: params.chapterId,
    clubId: params.clubId,
  })
  return json<LoaderData>({ chapter })
}

export default function ChapterLayout() {
  const loaderData = useLoaderData() as LoaderData

  return (
    <div className="mb-16">
      <div className="-mt-3 flex items-center justify-between p-4 pt-0 sm:pt-4">
        <div className="min-w-0 flex-1">
          <Link
            to="."
            className="text-xl font-bold leading-7 sm:truncate sm:text-2xl"
          >
            {loaderData.chapter.title}
          </Link>
        </div>
        {/* <div className="ml-4 flex flex-shrink-0 items-center">
        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-background-secondary sm:h-8 sm:w-8">
          <DotsVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div> */}
      </div>

      <Outlet />
    </div>
  )
}
