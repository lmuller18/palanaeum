import { Link, LoaderFunction } from 'remix'
import { json, useLoaderData } from 'remix'

import ClubCard from '~/components/ClubCard'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import { getClubListItems } from '~/models/club.server'

type LoaderData = {
  clubListItems: Awaited<ReturnType<typeof getClubListItems>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const clubListItems = await getClubListItems({ userId })
  return json<LoaderData>({ clubListItems })
}

export default function ClubsPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div className="mx-auto mt-4 max-w-lg p-3">
      <div className="mb-8">
        <Header size="h4" className="mb-4">
          Currently Reading
        </Header>
        <ClubCard
          club={{
            id: '1',
            title: 'Rhythm of War',
            cover: '/images/war.jpg',
            author: 'Brandon Sanderson',
            progress: 80,
            chapters: 106,
            members: [
              {
                id: '1',
                username: 'Geordan',
              },
              {
                id: '2',
                username: 'Yvonne',
              },
              {
                id: '3',
                username: 'Other1',
              },
              {
                id: '4',
                username: 'Other2',
              },
              {
                id: '5',
                username: 'Other3',
              },
            ],
          }}
        />
      </div>

      <div>
        <Header size="h4" className="mb-4">
          Previously Read
        </Header>

        <ClubCard
          club={{
            id: '1',
            title: 'Oathbringer',
            author: 'Brandon Sanderson',
            cover: '/images/oath.jpeg',
            chapters: 80,
            progress: 100,
            members: [
              {
                id: '1',
                username: 'Geordan',
              },
            ],
          }}
        />
      </div>

      <Link to="/">Eject</Link>
    </div>
  )
}
