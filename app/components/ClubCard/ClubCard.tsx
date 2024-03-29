import { Link } from '@remix-run/react'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

const ClubCard = ({
  club,
}: {
  club: {
    id: string
    title: string
    author: string
    image: string
    members: { id: string; username: string }[]
    progress: number
    chapters: number
    discussions?: number
  }
}) => {
  club.members = [
    { id: '1', username: 'Geordan' },
    { id: '2', username: 'Yvonne' },
    { id: '2', username: 'Yvonne' },
  ]
  // const members = club.members.slice(0, 2)
  // const leftover = club.members.length - 2

  return (
    <div className="relative grid grid-cols-2 gap-6">
      <Link to={`/clubs/${club.id}`}>
        <img
          className="aspect-book w-full rounded-lg object-cover shadow-md"
          src={club.image}
          alt={`${club.title} cover`}
        />
      </Link>
      <div className="flex flex-grow flex-col justify-center gap-2">
        <span className="block text-xs text-red-500">Not Final Appearance</span>
        <TextLink
          to={`/clubs/${club.id}`}
          variant="title2"
          className="flex-shrink-0 text-ellipsis break-words line-clamp-2"
        >
          {club.title}
        </TextLink>
        <Text variant="body2" as="p" className="text-right">
          By: {club.author}
        </Text>
      </div>
    </div>
  )
}

export default ClubCard
