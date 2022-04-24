import { Link } from 'remix'
import { HeartIcon } from '@heroicons/react/outline'
import { BookOpen, MessageCircle } from 'react-feather'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

const Post = ({
  user,
  chapter,
  post,
  clubId,
}: {
  user: {
    id: string
    avatar: string
    username: string
  }
  chapter: {
    id: string
    title: string
  }
  post: {
    id: string
    content: string
    replies: number
  }
  clubId: string
}) => {
  return (
    <article className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Link to={`/user/${user.id}`}>
          <img
            className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full object-cover"
            src={user.avatar}
          />
        </Link>

        <div className="flex flex-col">
          <TextLink to={`/user/${user.id}`} variant="subtitle1">
            {user.username}
          </TextLink>

          <TextLink
            variant="body2"
            color="blue"
            to={`/clubs/${clubId}/chapters/${chapter.id}`}
            className="flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            {chapter.title}
          </TextLink>
        </div>
      </div>

      <p className="prose prose-invert prose-violet">{post.content}</p>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <MessageCircle className="h-5 w-5" />
          <Text variant="subtitle1">{post.replies}</Text>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <HeartIcon className="h-5 w-5" />
          <Text variant="subtitle1">1</Text>
        </div>
      </div>
    </article>
  )
}

export default Post
