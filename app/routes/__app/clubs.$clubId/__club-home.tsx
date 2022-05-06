import clsx from 'clsx'
import { memo } from 'react'
import { Outlet, useMatches } from 'remix'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

import TabLink from '~/components/TabLink'
import { FireIcon, BookmarkIcon, HomeIcon } from '@heroicons/react/outline'

export default function ClubHomeLayout() {
  const matches = useMatches()
  const secondaryNavSections = matches
    // skip routes that don't have a breadcrumb
    .filter(match => match.handle && match.handle.nav)

  return (
    <>
      <Outlet />

      {/* Nav section */}
      <div className="h-24" />
      <NavSection secondaryNavSections={secondaryNavSections} />
    </>
  )
}

const NavSectionComp = ({
  secondaryNavSections,
}: {
  secondaryNavSections?: { handle: { nav: Function } }[]
}) => (
  <motion.div
    className="fixed bottom-0 left-0 isolate z-50 w-full"
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <AnimatePresence exitBeforeEnter>
      {!!secondaryNavSections && secondaryNavSections.length > 0 && (
        <motion.div
          className="z-40 -mb-1 border-t border-background-tertiary bg-background-secondary"
          initial={{ opacity: 0, y: 100 }}
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
    <NavBar hasSecondaryNav={!!secondaryNavSections?.length} />
  </motion.div>
)

const NavSection = memo(NavSectionComp)

const NavBarComp = ({ hasSecondaryNav }: { hasSecondaryNav: boolean }) => (
  <div
    className={clsx(
      'z-50 flex h-14 items-end justify-around border-background-tertiary bg-background-secondary',
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
const NavBar = memo(NavBarComp)
