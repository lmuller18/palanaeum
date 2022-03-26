import clsx from 'clsx'

interface AvatarProps {
  src: string
  rounded?: boolean
  size?: 'sm' | 'md' | 'lg'
  alt?: string
}

const getDimension = (size: AvatarProps['size']) => {
  switch (size) {
    case 'sm':
      return {
        height: 32,
        width: 32,
        class: 'h-6 w-6 md:h-8 md:w-8',
      }
    case 'md':
      return {
        height: 64,
        width: 64,
        class: 'h-12 w-12 md:h-16 md:w-16',
      }
    case 'lg':
    default:
      return {
        height: 128,
        width: 128,
        class: 'h-16 w-16 md:h-24 md:w-24 lg:h-32 lg:w-32',
      }
  }
}

const Avatar = ({
  src,
  rounded = true,
  size = 'lg',
  alt = 'User Avatar',
}: AvatarProps) => {
  const dimensions = getDimension(size)

  return (
    <img
      src={src}
      height={dimensions.height}
      width={dimensions.width}
      alt={alt}
      className={clsx(
        'object-cover',
        dimensions.class,
        rounded && 'rounded-full',
      )}
    />
  )
}

export default Avatar
