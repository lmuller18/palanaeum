import React from 'react'
import clsx from 'clsx'

type TextProps = {
  variant?: keyof typeof variants
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

const variants = {
  title1: 'text-lg md:text-xl font-medium',
  title2: '',
  body1: '',
  body2: '',
  caption: '',
}

function Text({ variant = 'body1', as, className, ...rest }: TextProps) {
  const Tag = as ?? 'span'
  return <Tag className={clsx(variants[variant], className)} {...rest} />
}

export default Text
