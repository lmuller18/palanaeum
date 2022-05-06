import clsx from 'clsx'
import { NavLink } from 'remix'
import { motion } from 'framer-motion'
import { memo, ReactNode, useMemo } from 'react'

import Text from '~/elements/Typography/Text'

const TabLink = ({
  to,
  end,
  children,
  color,
  layoutId,
  active,
}: {
  to: string | null
  end?: boolean
  children: ReactNode
  // this will override navlink matching
  active?: boolean
  color: 'indigo' | 'emerald' | 'sky' | 'teal'
  layoutId: string
}) => {
  const theme = useMemo(() => {
    switch (color) {
      case 'indigo':
        return {
          bg: 'from-indigo-400/20',
          border: 'bg-indigo-500',
        }
      case 'emerald':
        return {
          bg: 'from-emerald-400/20',
          border: 'bg-emerald-500',
        }
      case 'sky':
        return {
          bg: 'from-sky-400/20',
          border: 'bg-sky-500',
        }
      case 'teal':
        return {
          bg: 'from-teal-400/20',
          border: 'bg-teal-500',
        }
      default:
        return {
          bg: '',
          border: '',
        }
    }
  }, [color])

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
                    theme.bg,
                  ],
                )}
              />
            </div>
            {(active != null && active) || (active == null && isActive) ? (
              <motion.div
                layoutId={layoutId + '-underline'}
                className={clsx('h-[2px] w-full', theme.border)}
              />
            ) : (
              <div className="h-[2px] w-full bg-background-tertiary" />
            )}
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
