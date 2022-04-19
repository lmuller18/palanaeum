import { Link } from 'remix'
import { HeartIcon } from '@heroicons/react/outline'
import { BookOpen, MessageCircle } from 'react-feather'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

const Post = ({
  user,
  chapter,
  post,
}: {
  user: {
    id: string
    avatar: string
    username: string
  }
  chapter: {
    id: string
    name: string
  }
  post: {
    id: string
    content: string
  }
}) => {
  return (
    <article className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Link to="/user/1">
          <img
            className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full object-cover"
            src={user.avatar}
          />
        </Link>

        <div className="flex flex-col">
          <TextLink to="/user/1" variant="subtitle1">
            {user.username}
          </TextLink>

          <TextLink
            variant="body2"
            color="blue"
            to="/chapter/2"
            className="flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            {chapter.name}
          </TextLink>
        </div>
      </div>

      <p className="prose prose-invert prose-violet">{post.content}</p>

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
    </article>
  )
}

export default Post
