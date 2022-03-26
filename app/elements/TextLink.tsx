import clsx from 'clsx'
import { Link } from 'remix'
import type { RemixLinkProps } from '@remix-run/react/components'

interface BadgeProps extends RemixLinkProps {
  color?: keyof typeof colors
  size?: keyof typeof sizes
}

const sizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
  inherit: '',
}

const colors = {
  default: 'text-gray-200 hover:text-white',
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
  size = 'inherit',
  className,
  ...props
}: BadgeProps) => {
  return (
    <Link
      {...props}
      className={clsx(
        'transition duration-300 ease-in-out',
        colors[color],
        sizes[size],
      )}
    />
  )
}
export default TextLink
