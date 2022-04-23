import clsx from 'clsx'
import { NavLink } from 'remix'
import { motion } from 'framer-motion'
import { ReactNode, useMemo } from 'react'

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
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          clsx(
            'text-center',
            ((active != null && active) || (active == null && isActive)) && [
              'bg-gradient-to-t',
              theme.bg,
            ],
          )
        }
      >
        {({ isActive }) => (
          <>
            <Text variant="subtitle2" as="div" className="p-2 py-3">
              {children}
            </Text>
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

export default TabLink
