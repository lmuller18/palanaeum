import clsx from 'clsx'

import { Link } from '@remix-run/react'
import type { RemixLinkProps } from '@remix-run/react/dist/components'

import { variants } from './Typography/Text'

interface TextLinkProps extends RemixLinkProps {
  color?: keyof typeof colors
  variant?: keyof typeof variants | 'inherit'
  serif?: boolean
  underline?: boolean
}

const colors = {
  primary: 'text-white hover:text-indigo-500',
  default: 'hover:opacity-75',
  red: 'text-red-500 hover:text-red-400',
  orange: 'text-orange-500 hover:text-orange-400',
  amber: 'text-amber-500 hover:text-amber-400',
  yellow: 'text-yellow-500 hover:text-yellow-400',
  lime: 'text-lime-500 hover:text-lime-400',
  green: 'text-green-500 hover:text-green-400',
  emerald: 'text-emerald-500 hover:text-emerald-400',
  teal: 'text-teal-500 hover:text-teal-400',
  cyan: 'text-cyan-500 hover:text-cyan-400',
  sky: 'text-sky-500 hover:text-sky-400',
  blue: 'text-blue-500 hover:text-blue-400',
  indigo: 'text-indigo-400 hover:text-indigo-300',
  violet: 'text-violet-500 hover:text-violet-400',
  purple: 'text-purple-500 hover:text-purple-400',
  fuchsia: 'text-fuchsia-500 hover:text-fuchsia-400',
  pink: 'text-pink-500 hover:text-pink-400',
  rose: 'text-rose-500 hover:text-rose-400',
}

const TextLink = ({
  color = 'default',
  variant = 'inherit',
  underline = false,
  serif = false,
  className,
  children,
  ...props
}: TextLinkProps) => {
  return (
    <Link
      {...props}
      onClick={e => e.stopPropagation()}
      className={clsx(
        'transition duration-300 ease-in-out',
        colors[color],
        serif ? 'font-serif' : 'font-sans',
        variant !== 'inherit' && variants[variant],
        underline && 'underline',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export default TextLink
