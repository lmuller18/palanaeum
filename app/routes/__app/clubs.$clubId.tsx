import invariant from 'tiny-invariant'
import { json, Link, LoaderFunction, Outlet, useLoaderData } from 'remix'

import { getClub } from '~/models/club.server'
import { requireUserId } from '~/session.server'
import type { Club } from '~/models/club.server'

interface LoaderData {
  club: Club
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.clubId, 'clubId not found')

  const club = await getClub({ userId, id: params.clubId })
  if (!club) {
    throw new Response('Not Found', { status: 404 })
  }
  return json<LoaderData>({ club })
}

export default function ClubPageLayout() {
  const data = useLoaderData() as LoaderData

  return (
    <div className="mb-16">
      <div
        className="hidden h-56 bg-purple-400 bg-cover bg-center sm:block md:h-64 lg:h-72"
        style={{
          backgroundImage: `url(${data.club.image})`,
        }}
      />
      <div className="p-4 sm:hidden">
        <img src={data.club.image} className="w-full rounded-lg object-cover" />
      </div>

      <div className="mt-2 flex items-center justify-between p-4 pt-0 sm:pt-4">
        <div className="min-w-0 flex-1">
          <Link
            to="."
            className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl"
          >
            {data.club.title}
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
