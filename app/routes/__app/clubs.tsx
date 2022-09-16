import clsx from 'clsx'
import { Tab } from '@headlessui/react'
import { Link, useNavigate } from '@remix-run/react'
import type { LoaderArgs } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'

import { pluralize } from '~/utils'
import Text from '~/elements/Typography/Text'
import Container from '~/components/Container'
import { requireUserId } from '~/session.server'
import FormattedDate from '~/components/FormattedDate'
import { getClubListDetails } from '~/models/clubs.server'

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const { currentlyReading, previouslyRead } = await getClubListDetails(userId)

  return typedjson({ currentlyReading, previouslyRead })
}

export default function ClubsPage() {
  const data = useTypedLoaderData<typeof loader>()

  return (
    <div className="mx-auto max-w-lg p-4">
      <Tab.Group>
        <Tab.List className="flex items-baseline justify-between">
          <Tab
            className={({ selected }) =>
              clsx(
                'leading-7',
                'transition-[font-size,color] duration-150 ease-in-out focus:outline-none',
                selected
                  ? 'text-2xl font-bold text-indigo-400'
                  : 'text-slate-100 hover:text-indigo-400',
              )
            }
          >
            Currently Reading
          </Tab>

          <Tab
            className={({ selected }) =>
              clsx(
                'leading-7',
                'transition-[font-size,color] duration-150 ease-in-out focus:outline-none',
                selected
                  ? 'text-2xl font-bold text-indigo-400'
                  : 'text-slate-100 hover:text-indigo-400',
              )
            }
          >
            Previously Read
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="focus:outline-none">
            <div className="sm:mt-4 lg:mt-8 lg:border-t lg:border-slate-700">
              {!data.currentlyReading || data.currentlyReading.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Text variant="title3" serif>
                    No Clubs Found
                  </Text>
                </div>
              ) : (
                <>
                  {data.currentlyReading.map(club => (
                    <ClubCard key={club.id} club={club} />
                  ))}
                </>
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel className="focus:outline-none">
            <div className="sm:mt-4 lg:mt-8 lg:border-t lg:border-slate-700">
              {!data.previouslyRead || data.previouslyRead.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <Text variant="title3" serif>
                    No Clubs Found
                  </Text>
                </div>
              ) : (
                <>
                  {data.previouslyRead.map(club => (
                    <ClubCard key={club.id} club={club} />
                  ))}
                </>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

const ClubCard = ({
  club,
}: {
  club: FuncType<typeof getClubListDetails>['currentlyReading'][number]
}) => {
  const navigate = useNavigate()

  return (
    <article
      onClick={e => {
        e.stopPropagation()
        navigate(club.id)
      }}
      aria-labelledby={`club-${club.id}-title`}
      className="group-select border-b border-b-slate-700 py-10 sm:py-12"
    >
      <Container className="relative">
        <div className="active-container absolute inset-0 scale-y-125 select-none rounded-lg transition-colors duration-75" />
        <div className="relative grid grid-cols-[1fr,120px] gap-x-4 gap-y-2">
          <div className="flex flex-col items-start">
            <h2
              id={`club-${club.id}-title`}
              className="text-lg font-bold text-slate-100 line-clamp-2"
            >
              <Link
                to={club.id}
                onClick={e => e.stopPropagation()}
                className="hover:text-white"
              >
                {club.title}
              </Link>
            </h2>
            <p className="ml-3 mb-2 text-xs leading-6 text-slate-50">
              By {club.author}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm font-bold leading-6">
                <span className="mr-1 text-indigo-400">
                  {club.chapterCount}
                </span>{' '}
                {pluralize('Chapter', 'Chapters', club.chapterCount)}
              </span>
              <span
                aria-hidden="true"
                className="text-sm font-bold text-slate-400"
              >
                &#183;
              </span>
              <span className="text-sm font-bold leading-6">
                <span className="mr-1 text-indigo-400">{club.memberCount}</span>{' '}
                {pluralize('Member', 'Members', club.memberCount)}
              </span>
            </div>

            <FormattedDate
              date={new Date(club.createdAt)}
              className="font-mono text-sm leading-7 text-slate-300"
            />

            <div className="mt-4 flex flex-grow items-end">
              <div className="flex items-center gap-4">
                <Link
                  to={club.id}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center text-sm font-bold leading-6 text-indigo-400 hover:text-indigo-300 active:text-indigo-500"
                >
                  View Club
                </Link>
                /
                <Link
                  to={`/users/${club.owner.id}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-start gap-2 hover:text-indigo-300 active:text-indigo-500"
                >
                  <img
                    src={club.owner.avatar}
                    className="h-5 w-5 flex-shrink-0 rounded-full"
                    alt={`${club.owner.username} avatar`}
                  />
                  <Text as="p" variant="subtitle2">
                    {club.owner.username}
                  </Text>
                </Link>
              </div>
            </div>
          </div>

          <div className="aspect-book w-full overflow-hidden rounded-lg shadow">
            <img
              className="h-full w-full object-cover"
              src={club.image}
              alt="selected cover"
            />
          </div>
        </div>
      </Container>
    </article>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
