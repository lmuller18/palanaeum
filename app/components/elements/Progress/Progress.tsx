import clsx from 'clsx'

interface ProgressProps {
  value: number
  color?: keyof typeof colors
  size?: keyof typeof sizes
  rounded?: keyof typeof radii
}

const radii = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

const colors = {
  default: 'bg-gray-600',
  red: 'bg-red-600 ',
  orange: 'bg-orange-600',
  amber: 'bg-amber-600',
  yellow: 'bg-yellow-600',
  lime: 'bg-lime-600',
  green: 'bg-green-600',
  emerald: 'bg-emerald-600',
  teal: 'bg-teal-600',
  cyan: 'bg-cyan-600',
  sky: 'bg-sky-600',
  blue: 'bg-blue-600',
  indigo: 'bg-indigo-600',
  violet: 'bg-violet-600',
  purple: 'bg-purple-600',
  fuchsia: 'bg-fuchsia-600',
  pink: 'bg-pink-600',
  rose: 'bg-rose-600',
}

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const Progress = ({
  color = 'indigo',
  size = 'sm',
  rounded = 'none',
  value,
}: ProgressProps) => {
  return (
    <div
      className={clsx(
        'w-full overflow-hidden bg-gray-300',
        radii[rounded],
        sizes[size],
      )}
    >
      <div
        className={clsx(sizes[size], colors[color])}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default Progress
