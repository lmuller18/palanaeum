import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import type { LoaderArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

import Text from '~/elements/Typography/Text'
import { getClub } from '~/models/clubs.server'
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
      <div className="relative py-6">
        <div
          className="absolute top-0 left-0 right-0 -bottom-6 bg-fixed"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
          }}
        />
        <Link
          to="."
          className="relative mx-auto block aspect-book w-full max-w-[200px] overflow-hidden rounded-lg shadow-md "
        >
          <img
            className="h-full w-full object-cover"
            src={data.club.image}
            alt={`${data.club.title} cover`}
          />
        </Link>
      </div>
      <div className="relative mx-auto max-w-lg overflow-hidden px-4">
        <div className="mb-4">
          <Text as="h3" variant="title1" serif>
            {data.club.title}
          </Text>
          <Text variant="subtitle1" as="p" className="text-right">
            By {data.club.author}
          </Text>
        </div>

        <Outlet />
      </div>
    </>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
