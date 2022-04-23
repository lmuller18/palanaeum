import { Link } from 'remix'
import { Fragment } from 'react'

import Progress from '~/elements/Progress'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

const ClubCard = ({
  club,
}: {
  club: {
    id: string
    title: string
    author: string
    cover: string
    members: { id: string; username: string }[]
    progress: number
    chapters: number
  }
}) => {
  const members = club.members.slice(0, 2)
  const leftover = club.members.length - 2

  return (
    <div className="grid grid-cols-2 gap-6">
      <Link to={`/clubs/${club.id}`}>
        <img
          className="aspect-[0.66/1] w-full rounded-lg object-cover shadow-md"
          src={club.cover}
        />
      </Link>
      <div className="flex flex-grow flex-col justify-center gap-2">
        <div className="flex flex-grow flex-col justify-start gap-1">
          <TextLink
            to={`/clubs/${club.id}`}
            variant="title2"
            className="line-clamp-2"
          >
            {club.title}
          </TextLink>
          <Text variant="caption" className="text-right">
            By {club.author}
          </Text>
        </div>
        <div className="flex flex-grow flex-col justify-end">
          {members.length > 0 && (
            <div>
              Read along with{' '}
              {members.map((member, i) => (
                <Fragment key={member.id}>
                  <TextLink to={`/user/${member.id}`} color="indigo">
                    {member.username}
                  </TextLink>
                  {i !== members.length - 1 && ', '}
                </Fragment>
              ))}
              {leftover > 0 ? `, and ${leftover} others.` : '.'}
            </div>
          )}
          <div className="flex flex-col items-end gap-1">
            <Text variant="caption" className="text-gray-200">
              {club.chapters} Chapters
            </Text>
            <Progress
              value={club.progress}
              size="lg"
              rounded="full"
              color="indigo"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClubCard
