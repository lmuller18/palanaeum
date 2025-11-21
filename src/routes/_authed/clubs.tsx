import PageHeader from '@/components/page-header'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { prisma } from '@/db'
import { TextLink } from '@/elements/text-link'
import { useServerUser } from '@/server/auth'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

type ClubListItem = {
  id: string
  title: string
  author: string
  image: string
  owner: { id: string; username: string; avatar: string }
  createdAt: Date
  memberCount: number
  chapterCount: number
}

const getClubList = createServerFn().handler(async () => {
  const user = await useServerUser()
  const dbClubs = await prisma.club.findMany({
    where: { members: { some: { userId: user.id, removed: false } } },
    include: {
      owner: true,
      members: {
        where: { removed: false },
        include: { user: true, _count: { select: { progress: true } } },
      },
      _count: { select: { chapters: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return dbClubs.reduce(
    (acc, club) => {
      const userProgress =
        club.members.find((m) => m.userId === user.id)?._count.progress ?? 0

      const clubListItem: ClubListItem = {
        id: club.id,
        title: club.title,
        author: club.author,
        image: club.image,
        owner: {
          id: club.owner.id,
          username: club.owner.username,
          avatar: club.owner.avatar,
        },
        chapterCount: club._count.chapters,
        memberCount: club.members.length,
        createdAt: club.createdAt,
      }

      if (userProgress === club._count.chapters) {
        acc.previouslyRead.push(clubListItem)
      } else {
        acc.currentlyReading.push(clubListItem)
      }
      return acc
    },
    { currentlyReading: [], previouslyRead: [] } as {
      currentlyReading: ClubListItem[]
      previouslyRead: ClubListItem[]
    },
  )
})

export const Route = createFileRoute('/_authed/clubs')({
  component: RouteComponent,
  loader: () => {
    return getClubList()
  },
})

function RouteComponent() {
  const { currentlyReading, previouslyRead } = Route.useLoaderData()

  const highlightedClub = currentlyReading[0] ?? null

  return (
    <div>
      <HighlightedCard
        highlightedClub={highlightedClub}
        previouslyReadCount={previouslyRead.length}
      />

      <div className="content-wrapper my-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Currently Reading
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Continue your current binge.
            </p>
          </div>
        </div>
        <Separator className="my-4" />
        {currentlyReading.length > 0 ? (
          <ScrollArea>
            <div className="flex space-x-4 pb-4">
              {currentlyReading.map((club) => (
                <ClubCard club={club} key={club.id} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Not currently in any active clubs.{' '}
            <TextLink to="/clubs/new" color="blue">
              Start a new club
            </TextLink>{' '}
            or revisit a past club below.
          </p>
        )}

        <div className="mt-6 space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Previously Read
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Revisit old favorites and captivating discussions.
          </p>
        </div>
        <Separator className="my-4" />
        {previouslyRead.length > 0 ? (
          <ScrollArea>
            <div className="flex space-x-4 pb-4">
              {previouslyRead.map((club) => (
                <ClubCard club={club} key={club.id} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-200">
            No books completed yet.{' '}
            {highlightedClub &&
              `Focus on finishing ${highlightedClub.title} first.`}
          </p>
        )}
      </div>
    </div>
  )
}

function HighlightedCard(props: {
  highlightedClub: ClubListItem | null
  previouslyReadCount: number
}) {
  const highlightedCardProps = props.highlightedClub
    ? {
        link: props.highlightedClub.id,
        title: props.highlightedClub.title,
        description: `By ${props.highlightedClub.author}`,
        caption: 'Currently Reading',
        headerImage: (
          <div className="relative block aspect-book w-full max-w-[200px] overflow-hidden rounded-lg">
            <img
              src={props.highlightedClub.image}
              className="h-full w-full object-cover"
              alt="Club Cover"
            />
          </div>
        ),
      }
    : {
        title: 'My Book Clubs',
        description:
          props.previouslyReadCount > 0
            ? 'Taking a rest between novels 😴'
            : 'Looking to start your first club?',
        headerImage: (
          <div className="relative block w-full max-w-[200px] overflow-hidden rounded-lg">
            <img
              src="/images/nav-background.svg"
              className="h-full w-full object-cover"
              alt="Palanaeum Logo"
            />
          </div>
        ),
      }
  return <PageHeader {...highlightedCardProps} />
}

const ClubCard = (props: { club: ClubListItem }) => (
  <Link to={props.club.id} className="w-[150px] space-y-3">
    <div className="aspect-book overflow-hidden rounded-md">
      <img
        src={props.club.image}
        className="h-full w-full object-cover transition-all hover:scale-105"
        alt={`${props.club.title} cover`}
      />
    </div>
    <div className="space-y-1 text-sm">
      <h3 className="font-medium leading-none">{props.club.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {props.club.author}
      </p>
    </div>
  </Link>
)
