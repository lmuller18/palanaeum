import clsx from 'clsx'
import { forwardRef } from 'react'

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: keyof typeof sizes
  variant?: keyof typeof variants
  fullWidth?: keyof typeof fullWidths | true | false
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
    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500 disabled:bg-indigo-100/70 text-indigo-700/70 disabled:focus:ring-indigo-500/70',
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
    { size = 'base', variant = 'primary', fullWidth = false, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center border border-transparent font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          variants[variant],
          sizes[size],
          fullWidths[
            fullWidth === true
              ? 'always'
              : fullWidth === false
              ? 'none'
              : fullWidth
          ],
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export default Button
