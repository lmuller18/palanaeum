import clsx from 'clsx'
import { Outlet, useMatches } from 'remix'
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion'
import { FireIcon, HomeIcon, BookmarkIcon } from '@heroicons/react/outline'

import TabLink from '~/components/TabLink'
import useValueChanged from '~/hooks/use-value-changed'

export default function ClubNavigationLayout() {
  const matches = useMatches()
  const secondaryNavSections = matches
    // skip routes that don't have a breadcrumb
    .filter(match => match.handle && match.handle.nav)

  return (
    <>
      <Outlet />

      {/* Nav section */}
      <div className="h-14">
        <NavSection secondaryNavSections={secondaryNavSections} />
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
      'relative z-[999] flex h-14 items-end justify-around border-background-tertiary bg-background-secondary',
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
