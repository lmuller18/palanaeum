import type { LoaderFunction } from 'remix'
import { json, useLoaderData, Link } from 'remix'

import { useUser } from '~/utils'
import Badge from '~/components/elements/Badge'
import { requireUserId } from '~/session.server'
import Avatar from '~/components/elements/Avatar'
import { getClubListItems } from '~/models/club.server'

type LoaderData = {
  clubListItems: Awaited<ReturnType<typeof getClubListItems>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const clubListItems = await getClubListItems({ userId })
  return json<LoaderData>({ clubListItems })
}

export default function NotesPage() {
  const data = useLoaderData() as LoaderData
  const user = useUser()

  const backgroundImage =
    user.background ?? data.clubListItems?.[0]?.image ?? null

  return (
    <>
      <div
        className="h-48 bg-purple-400 bg-cover bg-center md:h-56 lg:h-64"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
        }}
      />

      <div className="-mt-8 flex justify-center md:-mt-12 lg:-mt-16">
        <Link to="/profile">
          <Avatar src={user.avatar} />
        </Link>
      </div>

      <div className="mx-auto max-w-screen-md p-4">
        {data.clubListItems.length === 0 ? (
          <p className="p-4">No clubs yet</p>
        ) : (
          <ol>
            {data.clubListItems.map(club => (
              <li key={club.id} className="flex-col">
                <div>
                  <Link to={club.id} prefetch="intent">
                    <img
                      src={club.image}
                      className="aspect-video max-h-32 w-full rounded-lg object-cover sm:max-h-48 md:max-h-64"
                    />
                  </Link>
                  <div className="-mt-8 flex gap-2 p-2 md:-mt-12">
                    {club.members.map(({ user }) => (
                      <Avatar key={user.id} src={user.avatar} size="md" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xl font-medium md:text-2xl">
                    {club.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="fuchsia">
                      {club._count.chapters} Chapters
                    </Badge>
                    <Badge color="teal">{club._count.members} Members</Badge>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  )
}
