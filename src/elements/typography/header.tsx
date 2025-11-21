import clsx from 'clsx'
import React from 'react'

type TitleProps = {
  variant?: 'primary' | 'secondary'
  font?: keyof typeof fonts
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

const fontSize = {
  h1: 'font-light text-8xl leading-[1.167] tracking-[-0.01562em]',
  h2: 'font-light text-6xl leading-[1.2] tracking-[-0.00833em]',
  h3: 'font-normal text-5xl leading-[1.167] tracking-normal',
  h4: 'font-normal text-[2.125rem] leading-[1.235] tracking-[0.00735em]',
  h5: 'font-normal text-[1.5rem] leading-[1.334] tracking-normal',
  h6: 'font-semibold text-[1.25rem] leading-[1.6] tracking-[0.0075em]',
}

const titleColors = {
  primary: 'text-white',
  secondary: 'text-blueGray-500',
}

const fonts = {
  sans: 'font-sans',
  serif: 'font-serif',
}

function Header({
  variant = 'primary',
  font = 'serif',
  size = 'h1',
  as,
  className,
  ...rest
}: TitleProps & { size?: keyof typeof fontSize }) {
  const Tag = as ?? size
  return (
    <Tag
      className={clsx(
        fontSize[size],
        titleColors[variant],
        fonts[font],
        className,
      )}
      {...rest}
    />
  )
}

export default Header
