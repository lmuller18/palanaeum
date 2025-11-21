import clsx from 'clsx'
import React from 'react'

type TextProps = {
  variant?: keyof typeof variants
  serif?: boolean
  as?: React.ElementType
  className?: string
  id?: string
} & (
  | { children: React.ReactNode }
  | {
      dangerouslySetInnerHTML: {
        __html: string
      }
    }
)

export const variants = {
  title1: 'font-normal text-[2.125rem] leading-[1.235] tracking-[0.00735em]',
  title2: 'font-normal text-[1.5rem] leading-[1.334] tracking-normal',
  title3: 'font-semibold text-[1.25rem] leading-[1.6] tracking-[0.0075em]',
  subtitle1: 'text-base font-normal leading-7 tracking-[0.00938em]',
  subtitle2: 'text-sm font-medium leading-[1.57] tracking-[0.00714em]',
  body1: 'text-base font-normal leading-6 tracking-[0.00938em]',
  body2: 'text-sm font-normal leading-[1.43] tracking-[0.01071em]',
  caption: 'text-xs font-normal leading-[1.66] tracking=[0.03333em]',
}

function Text({
  variant = 'body1',
  as,
  serif = false,
  className,
  ...rest
}: TextProps) {
  const Tag = as ?? 'span'
  return (
    <Tag
      className={clsx(
        variants[variant],
        serif ? 'font-serif' : 'font-sans',
        className,
      )}
      {...rest}
    />
  )
}

export default Text
