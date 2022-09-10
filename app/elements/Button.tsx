import clsx from 'clsx'
import { forwardRef } from 'react'

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: keyof typeof sizes
  variant?: keyof typeof variants
  fullWidth?: Exclude<keyof typeof fullWidths, 'always' | 'none'> | true | false
}

const sizes = {
  xs: 'rounded px-2.5 py-1.5 text-xs',
  sm: 'rounded-md px-3 py-2 text-sm leading-4',
  base: 'rounded-md px-4 py-2 text-sm',
  lg: 'rounded-md px-4 py-2 text-base',
  xl: 'rounded-md px-6 py-3 text-base',
}

const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-600/70 disabled:text-white/70 disabled:focus:ring-indigo-500/70',
  secondary:
    'bg-background-tertiary text-gray-200 hover:bg-background-tertiary/70 focus:ring-indigo-500 disabled:bg-background-tertiary/70 hover:text-white disabled:text-gray-500 disabled:focus:ring-indigo-500/70',
  warning:
    'bg-rose-500 text-white hover:bg-rose-600 focus:ring-indigo-500 disabled:bg-rose-500/70 disabled:text-white/70 disabled:focus:ring-rose-500/70',
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-500 active-bg-indigo-700',
}

const fullWidths = {
  none: '',
  xs: 'w-full xs:w-48',
  sm: 'w-full sm:w-48',
  md: 'w-full md:w-48',
  lg: 'w-full lg:w-48',
  xl: 'w-full xl:w-48',
  always: 'w-full',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'base',
      variant = 'primary',
      fullWidth = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center border border-transparent font-medium shadow-sm transition-colors focus:outline-none focus:ring-2',
          variants[variant],
          sizes[size],
          fullWidths[
            fullWidth === true
              ? 'always'
              : fullWidth === false
              ? 'none'
              : fullWidth
          ],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export default Button
