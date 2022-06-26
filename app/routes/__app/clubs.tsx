import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { prisma } from '~/db.server'
import ClubCard from '~/components/ClubCard'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'

interface Club {
  id: string
  title: string
  author: string
  image: string
  members: {
    id: string
    username: string
  }[]
  progress: number
  chapters: number
}

interface LoaderData {
  currentlyReading: Club[]
  previouslyRead: Club[]
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const { currentlyReading, previouslyRead } = await getClubList(userId)

  return json<LoaderData>({ currentlyReading, previouslyRead })
}

export default function ClubsPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div className="mx-auto mt-4 max-w-lg p-3">
      <div className="mb-8">
        <Header size="h4" className="mb-2">
          Currently Reading
        </Header>

        <div className="grid gap-6 border-b border-t-2 border-rose-400 border-b-background-tertiary bg-gradient-to-b from-rose-400/10 via-transparent p-4">
          {data.currentlyReading?.map(club => (
            <ClubCard club={club} key={club.id} />
          ))}
        </div>

        {data.currentlyReading?.length === 0 && (
          <Text variant="body1">
            Add create club here since nothing being read
          </Text>
        )}
      </div>

      {data.previouslyRead?.length > 0 && (
        <div>
          <Header size="h4" className="mb-2">
            Previously Read
          </Header>

          <div className="grid gap-6 border-b border-t-2 border-emerald-400 border-b-background-tertiary bg-gradient-to-b from-emerald-400/10 via-transparent p-4">
            {data.previouslyRead?.map(club => (
              <ClubCard club={club} key={club.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

async function getClubList(userId: string) {
  const dbClubs = await prisma.club.findMany({
    where: { members: { some: { userId } } },
    select: {
      id: true,
      title: true,
      author: true,
      image: true,
      members: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              progress: true,
            },
          },
        },
      },
      _count: {
        select: {
          chapters: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const currentlyReading: Club[] = []
  const previouslyRead: Club[] = []

  dbClubs.forEach(dbClub => {
    const userProgress =
      dbClub.members.find(m => m.user.id === userId)?._count.progress ?? 0

    const club: Club = {
      id: dbClub.id,
      title: dbClub.title,
      author: dbClub.author,
      image: dbClub.image,
      chapters: dbClub._count.chapters,
      members: dbClub.members
        .map(m => ({
          id: m.user.id,
          username: m.user.username,
        }))
        .filter(m => m.id !== userId),
      progress: (userProgress / dbClub._count.chapters) * 100,
    }

    if (userProgress === dbClub._count.chapters) {
      previouslyRead.push(club)
    } else {
      currentlyReading.push(club)
    }
  })

  return { currentlyReading, previouslyRead }
}
