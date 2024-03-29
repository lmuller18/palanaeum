import clsx from 'clsx'
import { useState } from 'react'
import { DateTime } from 'luxon'
import useMeasure from 'react-use-measure'
import { Info, BookOpen } from 'react-feather'
import { motion, AnimatePresence } from 'framer-motion'

import { Link, useNavigate } from '@remix-run/react'

import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import { pluralize, toLuxonDate } from '~/utils'
import usePostReferrer from '~/hooks/use-post-referrer'

const PostDetails = ({
  chapter,
  post,
  user,
}: {
  user: {
    id: string
    avatar: string
    username: string
  }
  chapter: {
    id: string
    title: string
    clubId: string
  }
  post: {
    id: string
    rootId: string | null
    parentId: string | null
    content: string
    image: string | null
    context: string | null
    replies: number
    createdAt: string
  }
}) => {
  const navigate = useNavigate()
  const [showContext, setShowContext] = useState(false)

  const handleContext = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation()
    setShowContext(c => !c)
  }

  const { nextPostReferrer } = usePostReferrer()
  const toPost = () => {
    navigate(`/posts/${post.id}`, {
      state: {
        postReferrer: nextPostReferrer,
      },
    })
  }

  const date = toLuxonDate(post.createdAt)

  return (
    <article className="flex flex-col gap-2" onClick={toPost}>
      <div className="flex items-start gap-3">
        <Link
          to={`/users/${user.id}`}
          className="flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <img
            className="h-12 w-12 overflow-hidden rounded-full object-cover"
            src={user.avatar}
            alt="user avatar"
          />
        </Link>

        <div className="mt-[2px] flex flex-grow flex-col">
          <div className="flex items-center gap-2">
            <TextLink
              to={`/users/${user.id}`}
              variant="subtitle2"
              onClick={e => e.stopPropagation()}
            >
              {user.username}
            </TextLink>
          </div>

          <div className="flex items-center justify-between">
            <TextLink
              variant="body2"
              color="blue"
              to={`/clubs/${chapter.clubId}/chapters/${chapter.id}`}
              className="flex items-start gap-1"
              onClick={e => e.stopPropagation()}
            >
              <BookOpen className="mt-[2px] h-4 w-4 flex-shrink-0" />
              {chapter.title}
            </TextLink>

            {post.context && (
              <Info
                onClick={handleContext}
                className="h-5 w-5 cursor-pointer text-gray-300 transition duration-300 ease-in-out hover:text-white"
              />
            )}
          </div>
        </div>
      </div>

      <ContextSection showContext={showContext} context={post.context} />

      <div
        className="prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0"
        dangerouslySetInnerHTML={{
          __html: post.content,
        }}
      />

      {post.image && (
        <div className="w-full overflow-hidden rounded-lg">
          <img src={post.image} alt="post attachment" className="w-full" />
        </div>
      )}

      <div>
        <Text variant="body2" className="text-gray-400">
          {date.toLocaleString(DateTime.TIME_SIMPLE)} &#183;{' '}
          {date.toLocaleString({
            day: '2-digit',
          })}{' '}
          {date.toLocaleString({
            month: 'long',
          })}{' '}
          {date.toLocaleString({
            year: '2-digit',
          })}
        </Text>
      </div>

      <div className="flex items-center gap-6 border-y border-background-tertiary py-2">
        <div>
          <Text variant="subtitle2">{post.replies}</Text>{' '}
          <Text variant="body2" className="text-gray-400">
            {pluralize('Reply', 'Replies', post.replies)}
          </Text>
        </div>
        {/* <div>
            <Text variant="subtitle2">5</Text>{' '}
            <Text variant="body2" className="text-gray-400">
              Likes
            </Text>
          </div> */}
      </div>
    </article>
  )
}

const ContextSection = ({
  showContext,
  context,
}: {
  showContext: boolean
  context: string | null
}) => {
  const [ref, { height }] = useMeasure()

  return (
    <motion.div
      animate={{ height: height || 'auto' }}
      className="relative overflow-hidden"
    >
      <AnimatePresence initial={false}>
        {showContext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              height ? 'absolute w-full' : 'relative',
              'border-l-4 border-violet-500 bg-violet-400/20',
            )}
          >
            <div ref={ref} className="flex px-4 py-2">
              <p className="text-sm text-violet-50">{context}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PostDetails
