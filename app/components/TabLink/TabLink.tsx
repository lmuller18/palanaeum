import clsx from 'clsx'
import { NavLink } from "@remix-run/react";
import { motion } from 'framer-motion'
import { memo, ReactNode } from 'react'

import Text from '~/elements/Typography/Text'

const themes = {
  indigo: {
    bg: 'from-indigo-400/20',
    border: 'bg-indigo-500',
  },
  emerald: {
    bg: 'from-emerald-400/20',
    border: 'bg-emerald-500',
  },
  sky: {
    bg: 'from-sky-400/20',
    border: 'bg-sky-500',
  },
  teal: {
    bg: 'from-teal-400/20',
    border: 'bg-teal-500',
  },
}

const TabLink = ({
  to,
  end,
  children,
  color,
  active,
}: {
  to: string | null
  end?: boolean
  children: ReactNode
  // this will override navlink matching
  active?: boolean
  color: keyof typeof themes
}) => {
  if (to)
    return (
      <NavLink to={to} end={end} className="flex-grow text-center">
        {({ isActive }) => (
          <>
            <div className="relative h-full w-full overflow-hidden">
              <Text
                variant="subtitle2"
                as="div"
                className="flex items-center justify-center p-2 py-3"
              >
                {children}
              </Text>
              <motion.div
                key={isActive.toString()}
                variants={{
                  glow: {
                    scaleY: 1,
                    originY: '100%',
                  },
                  none: {
                    scaleY: 0,
                    originY: '100%',
                  },
                }}
                initial="none"
                animate="glow"
                transition={{
                  duration: 0.425,
                }}
                className={clsx(
                  'absolute inset-0 h-full w-full',
                  ((active != null && active) ||
                    (active == null && isActive)) && [
                    'bg-gradient-to-t',
                    themes[color].bg,
                  ],
                )}
              />
            </div>
            {(active != null && active) || (active == null && isActive) ? (
              <motion.div
                layoutId="underline"
                className={clsx('h-[2px] w-full', themes[color].border)}
              />
            ) : null}
          </>
        )}
      </NavLink>
    )

  return (
    <div className="text-center">
      <Text variant="subtitle2" as="div" className="p-2 py-3">
        {children}
      </Text>
      <div className="h-[2px] w-full bg-background-tertiary" />
    </div>
  )
}

export default memo(TabLink)
