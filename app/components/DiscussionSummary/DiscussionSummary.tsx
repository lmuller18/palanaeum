import { Link } from 'remix'
import { HeartIcon } from '@heroicons/react/outline'
import { BookOpen, MessageCircle } from 'react-feather'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

const DiscussionSummary = ({
  user,
  discussion,
  chapter,
}: {
  user: {
    id: string
    username: string
    avatar: string
  }
  discussion: {
    id: string
    title: string
  }
  chapter: {
    id: string
    title: string
  }
}) => {
  return (
    <div className="">
      <Text variant="title3" className="mb-1 line-clamp-2">
        {discussion.title}
      </Text>

      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/user/1">
            <img
              className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full object-cover"
              src={user.avatar}
            />
          </Link>

          <TextLink to="/user/1" variant="subtitle1">
            {user.username}
          </TextLink>
        </div>
        <TextLink
          variant="body2"
          color="blue"
          to="/chapter/2"
          className="flex items-center gap-1"
        >
          <BookOpen className="h-4 w-4" />
          {chapter.title}
        </TextLink>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <MessageCircle className="h-5 w-5" />
          <Text variant="subtitle1">2</Text>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <HeartIcon className="h-5 w-5" />
          <Text variant="subtitle1">1</Text>
        </div>
      </div>
    </div>
  )
}

export default DiscussionSummary
