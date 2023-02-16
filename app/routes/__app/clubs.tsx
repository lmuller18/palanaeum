import { typedjson, useTypedLoaderData } from 'remix-typedjson'

import { Link } from '@remix-run/react'
import type { LoaderArgs } from '@remix-run/node'

import TextLink from '~/elements/TextLink'
import { requireUserId } from '~/session.server'
import PageHeader from '~/components/PageHeader'
import { Separator } from '~/components/Separator'
import { getClubListDetails } from '~/models/clubs.server'
import { ScrollBar, ScrollArea } from '~/components/ScrollArea'

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const { currentlyReading, previouslyRead } = await getClubListDetails(userId)

  return typedjson({
    currentlyReading,
    previouslyRead: [],
  })
}

export default function ClubsPage() {
  const { currentlyReading, previouslyRead } =
    useTypedLoaderData<typeof loader>()

  const highlightedCard = currentlyReading[0] ?? null

  return (
    <div>
      {highlightedCard ? (
        <PageHeader
          link={highlightedCard.id}
          title={highlightedCard.title}
          description={`By ${highlightedCard.author}`}
          caption="Currently Reading"
          headerImage={
            <div className="relative block aspect-book w-full max-w-[200px] overflow-hidden rounded-lg">
              <img
                src={highlightedCard.image}
                className="h-full w-full object-cover"
                alt="Club Cover"
              />
            </div>
          }
        />
      ) : (
        <PageHeader
          title="My Book Clubs"
          description={
            previouslyRead.length > 0
              ? 'Taking a rest between novels 😴'
              : 'Looking to start your first club?'
          }
          headerImage={
            <div className="relative block w-full max-w-[200px] overflow-hidden rounded-lg">
              <img
                src="/images/nav-background.svg"
                className="h-full w-full object-cover"
                alt="Club Cover"
              />
            </div>
          }
        />
      )}

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
              {currentlyReading.map(club => (
                <ClubCard
                  key={club.id}
                  id={club.id}
                  title={club.title}
                  author={club.author}
                  image={club.image}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Not currently in any active clubs.{' '}
            <TextLink to="clubs/new" color="blue">
              Start a new club
            </TextLink>{' '}
            or revist a past club below.
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
              {previouslyRead.map(club => (
                <ClubCard
                  key={club.id}
                  id={club.id}
                  title={club.title}
                  author={club.author}
                  image={club.image}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-200">
            No books completed yet.{' '}
            {highlightedCard &&
              `Focus on finishing ${highlightedCard.title} first.`}
          </p>
        )}
      </div>
    </div>
  )
}

const ClubCard = ({
  id,
  image,
  title,
  author,
}: {
  id: string
  image: string
  title: string
  author: string
}) => (
  <Link to={id} className="w-[150px] space-y-3">
    <div className="aspect-book overflow-hidden rounded-md">
      <img
        src={image}
        className="h-full w-full object-cover transition-all hover:scale-105"
        alt={`${title} cover`}
      />
    </div>
    <div className="space-y-1 text-sm">
      <h3 className="font-medium leading-none">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{author}</p>
    </div>
  </Link>
)

export { default as CatchBoundary } from '~/components/CatchBoundary'
