import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion'
import { FireIcon, HomeIcon, BookmarkIcon } from '@heroicons/react/outline'
import {
  json,
  Link,
  Outlet,
  useMatches,
  useLoaderData,
  LoaderFunction,
} from 'remix'

import { prisma } from '~/db.server'
import TabLink from '~/components/TabLink'
import Text from '~/elements/Typography/Text'
import { requireUserId } from '~/session.server'
import useValueChanged from '~/hooks/use-value-changed'

interface LoaderData {
  club: {
    id: string
    title: string
    author: string
    image: string
  }
}

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.clubId, 'expected clubId')
  const userId = await requireUserId(request)
  const club = await getClub(params.clubId, userId)

  if (!club) throw new Response('Club not found', { status: 404 })

  return json<LoaderData>({ club })
}

export default function ClubLayout() {
  const data = useLoaderData() as LoaderData
  const matches = useMatches()
  const secondaryNavSections = matches
    // skip routes that don't have a breadcrumb
    .filter(match => match.handle && match.handle.nav)

  return (
    <>
      <div className="relative py-6">
        <div
          className="absolute top-0 left-0 right-0 -bottom-6"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
          }}
        />
        <Link
          to="."
          className="relative mx-auto block aspect-[0.66/1] w-full max-w-[200px] overflow-hidden rounded-lg shadow-md "
        >
          <img
            className="h-full w-full object-cover"
            src={data.club.image}
            alt={`${data.club.title} cover`}
          />
        </Link>
      </div>
      <div className="relative mx-auto max-w-lg px-4">
        <div className="mb-4">
          <Text as="h3" variant="title1" serif>
            {data.club.title}
          </Text>
          <Text variant="subtitle1" as="p" className="text-right">
            By {data.club.author}
          </Text>
        </div>

        <Outlet />

        {/* Nav section */}
        <div className="h-14">
          <NavSection secondaryNavSections={secondaryNavSections} />
        </div>
      </div>
    </>
  )
}

const NavSection = ({
  secondaryNavSections,
}: {
  secondaryNavSections?: { handle: { nav: Function } }[]
}) => {
  const hasSecondaryNav =
    !!secondaryNavSections && secondaryNavSections.length > 0
  const valueChanged = useValueChanged(hasSecondaryNav)
  return (
    <div className="fixed bottom-0 left-0 isolate z-50 w-full">
      <AnimatePresence exitBeforeEnter>
        {hasSecondaryNav && (
          <motion.div
            className="z-40 -mb-1 border-t border-background-tertiary bg-background-secondary"
            initial={valueChanged ? { opacity: 0, y: 100 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100, animationDelay: '.5s' }}
          >
            {secondaryNavSections.map((match, index) => (
              <div key={index} className="rounded-t-lg p-2">
                {match.handle.nav(match)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <NavBar hasSecondaryNav={hasSecondaryNav} />
    </div>
  )
}

const NavBar = ({ hasSecondaryNav }: { hasSecondaryNav: boolean }) => (
  <div
    className={clsx(
      'relative z-[999] flex h-14 items-end justify-around border-background-tertiary bg-background-secondary bg-opacity-50 backdrop-blur-md',
      !hasSecondaryNav && 'border-t',
    )}
  >
    <LayoutGroup id="club-nav-wrapper">
      <TabLink to="posts" color="sky" layoutId="club-nav">
        <FireIcon className="h-6 w-6" />
      </TabLink>
      <TabLink to="." end color="teal" layoutId="club-nav">
        <HomeIcon className="h-6 w-6" />
      </TabLink>
      <TabLink to="chapters" color="indigo" layoutId="club-nav">
        <BookmarkIcon className="h-6 w-6" />
      </TabLink>
    </LayoutGroup>
  </div>
)

async function getClub(clubId: string, userId: string) {
  const dbClub = await prisma.club.findFirst({
    where: { id: clubId, members: { some: { userId } } },
    select: {
      id: true,
      title: true,
      author: true,
      image: true,
    },
  })

  if (!dbClub) return null

  return {
    id: dbClub.id,
    title: dbClub.title,
    author: dbClub.author,
    image: dbClub.image,
  }
}
