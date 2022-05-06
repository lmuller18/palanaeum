import { Link } from 'remix'
import { useState } from 'react'
import { HeartIcon } from '@heroicons/react/outline'
import { BookOpen, Info, MessageCircle } from 'react-feather'

import { toRelative } from '~/utils'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

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
    createdAt: Date
    context: string | null
  }
  clubId: string
}) => {
  const [showContext, setShowContext] = useState(false)
  return (
    <article className="flex flex-col gap-2">
      <LayoutGroup>
        <motion.div layout className="flex items-center gap-3">
          <Link to={`/user/${user.id}`}>
            <img
              className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full object-cover"
              src={user.avatar}
              alt="user avatar"
            />
          </Link>

          <div className="flex flex-grow flex-col">
            <div className="flex items-center gap-2">
              <TextLink to={`/user/${user.id}`} variant="subtitle2">
                {user.username}
              </TextLink>
              <Text variant="caption" className="text-gray-500">
                {toRelative(post.createdAt, { style: 'short' })}
              </Text>
            </div>

            <div className="flex items-center justify-between">
              <TextLink
                variant="body2"
                color="blue"
                to={`/clubs/${clubId}/chapters/${chapter.id}`}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                {chapter.title}
              </TextLink>

              {post.context && (
                <Info
                  onClick={() => setShowContext(x => !x)}
                  className="h-5 w-5 text-gray-300 transition duration-300 ease-in-out hover:text-white"
                />
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence presenceAffectsLayout>
          {showContext && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-l-4 border-violet-500 bg-violet-400/20 px-4 py-2"
            >
              <div className="flex">
                <p className="text-sm text-violet-50">{post.context}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0"
          dangerouslySetInnerHTML={{
            __html: post.content,
          }}
        />

        <motion.div layout className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <MessageCircle className="h-5 w-5" />
            <Text variant="subtitle1">{post.replies}</Text>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <HeartIcon className="h-5 w-5" />
            <Text variant="subtitle1">1</Text>
          </div>
        </motion.div>
      </LayoutGroup>
    </article>
  )
}

export default Post
