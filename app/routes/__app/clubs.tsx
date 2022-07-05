import clsx from 'clsx'
import { DateTime } from 'luxon'
import { json } from '@remix-run/node'
import { Tab } from '@headlessui/react'
import type { LoaderFunction } from '@remix-run/node'
import { Link, useLoaderData, useNavigate } from '@remix-run/react'

import { toLuxonDate } from '~/utils'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import { getClubListDetails } from '~/models/clubs.server'

interface LoaderData {
  currentlyReading: FuncType<typeof getClubListDetails>['currentlyReading']
  previouslyRead: FuncType<typeof getClubListDetails>['previouslyRead']
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const { currentlyReading, previouslyRead } = await getClubListDetails(userId)

  return json<LoaderData>({ currentlyReading, previouslyRead })
}

export default function ClubsPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div className="mx-auto max-w-lg p-4">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-background-secondary/70 p-1">
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
                'focus:outline-none',
                selected
                  ? 'bg-background-tertiary shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
              )
            }
          >
            Currently Reading
          </Tab>
          <Tab
            className={({ selected }) =>
              clsx(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
                'focus:outline-none',
                selected
                  ? 'bg-background-tertiary shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
              )
            }
          >
            Previously Read
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={clsx(
              'rounded-xl bg-background-tertiary p-3',
              'focus:outline-none',
            )}
          >
            <div className="grid gap-4">
              {!data.currentlyReading ||
                (data.currentlyReading.length === 0 && (
                  <div className="flex items-center justify-center py-6">
                    <Text variant="title3" serif>
                      No Clubs Found
                    </Text>
                  </div>
                ))}
              {data.currentlyReading.map(club => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </Tab.Panel>

          <Tab.Panel
            className={clsx(
              'rounded-xl bg-background-tertiary p-3',
              'focus:outline-none',
            )}
          >
            <div className="grid gap-4">
              {!data.previouslyRead ||
                (data.previouslyRead.length === 0 && (
                  <div className="flex items-center justify-center py-6">
                    <Text variant="title3" serif>
                      No Clubs Found
                    </Text>
                  </div>
                ))}
              {data.previouslyRead.map(club => (
                <ClubCard key={club.id} club={club} />
              ))}
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
  club: LoaderData['currentlyReading'][number]
}) => {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-lg bg-background-secondary p-4 active:bg-background-secondary/70"
      onClick={() => {
        navigate(club.id)
      }}
    >
      <div className="grid grid-cols-[1fr,2fr] gap-6">
        <Link
          onClick={e => e.stopPropagation()}
          to={club.id}
          className="relative mx-auto aspect-[0.66/1] w-full overflow-hidden rounded-lg shadow-md"
        >
          <img
            className="h-full w-full object-cover"
            src={club.image}
            alt="selected cover"
          />
        </Link>
        <div className="flex flex-col justify-between">
          <div>
            <Link
              to={club.id}
              onClick={e => e.stopPropagation()}
              className="w-fit"
            >
              <Text variant="title3" as="p" className="line-clamp-1">
                {club.title}
              </Text>
            </Link>
            <Text variant="subtitle2" as="p" className="line-clamp-1">
              By {club.author}
            </Text>
          </div>

          <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
            <Text variant="body2">Chapters</Text>
            <Text variant="caption">{club.chapterCount}</Text>
            <Text variant="body2">Members</Text>
            <Text variant="caption">{club.memberCount}</Text>
            <Text variant="body2">Club Created</Text>
            <Text variant="caption">
              {toLuxonDate(club.createdAt).toLocaleString(DateTime.DATE_MED)}
            </Text>
          </div>

          <div className="flex flex-col justify-end">
            <Link
              to={`/users/${club.owner.id}`}
              onClick={e => e.stopPropagation()}
              className="flex w-fit items-center justify-start gap-2"
            >
              <img
                src={club.owner.avatar}
                className="h-10 w-10 flex-shrink-0 rounded-full"
                alt={`${club.owner.username} avatar`}
              />
              <div>
                <Text as="p" variant="caption">
                  Owner
                </Text>
                <Text as="p" variant="subtitle2">
                  {club.owner.username}
                </Text>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
