import invariant from 'tiny-invariant'

import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { getClub } from '~/models/clubs.server'
import PageHeader from '~/components/PageHeader'
import { requireUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const club = await getClub(params.clubId, userId)

  if (!club) throw new Response('Club not found', { status: 404 })

  return json({
    club: {
      id: club.id,
      title: club.title,
      author: club.author,
      image: club.image,
    },
  })
}

export default function ClubNavigationLayout() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <PageHeader
        title={data.club.title}
        description={`By ${data.club.author}`}
        caption="Club Overview"
        headerImage={
          <div className="relative block aspect-book w-full max-w-[200px] overflow-hidden rounded-lg">
            <img
              src={data.club.image}
              className="h-full w-full object-cover"
              alt="Club Cover"
            />
          </div>
        }
      />

      <div className="content-wrapper isolate">
        <Outlet />
      </div>
    </>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
