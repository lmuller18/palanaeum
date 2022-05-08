import { useState } from 'react'
import { Link, useNavigate } from 'remix'
import { HeartIcon } from '@heroicons/react/outline'
import { BookOpen, Info, MessageCircle } from 'react-feather'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

import { toRelative } from '~/utils'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'
import usePostReferrer from '~/hooks/use-post-referrer'

const SecondaryPost = ({
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
    createdAt: Date
  }
}) => {
  const navigate = useNavigate()
  const { nextPostReferrer } = usePostReferrer()
  const [showContext, setShowContext] = useState(false)

  const handleContext = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation()
    setShowContext(c => !c)
  }

  const toPost = () => {
    navigate(`/posts/${post.id}`, {
      state: {
        postReferrer: nextPostReferrer,
      },
    })
  }

  return (
    <article className="flex flex-col gap-2" onClick={toPost}>
      <LayoutGroup>
        <motion.div layout className="flex items-center gap-3">
          <Link to={`/user/${user.id}`} onClick={e => e.stopPropagation()}>
            <img
              className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full object-cover"
              src={user.avatar}
              alt="user avatar"
            />
          </Link>

          <div className="flex flex-grow flex-col">
            <div className="flex items-center gap-2">
              <TextLink
                to={`/user/${user.id}`}
                variant="subtitle2"
                onClick={e => e.stopPropagation()}
              >
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
                to={`/clubs/${chapter.clubId}/chapters/${chapter.id}`}
                className="flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                <BookOpen className="h-4 w-4" />
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
        </motion.div>

        <AnimatePresence presenceAffectsLayout>
          {showContext && (
            <motion.div layout className="grid grid-cols-[48px,1fr] gap-3">
              <motion.div exit={{ opacity: 0 }} className="flex justify-center">
                <div
                  className="w-1 bg-background-tertiary"
                  style={{
                    height: 'calc(100% + 10px)',
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-l-4 border-violet-500 bg-violet-400/20 px-4 py-2"
              >
                <div className="flex">
                  <p className="text-sm text-violet-50">{post.context}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="grid grid-cols-[48px,1fr] gap-3">
          <div className="flex justify-center">
            <div className="h-full w-1 bg-background-tertiary" />
          </div>
          <div
            className="prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />
        </motion.div>

        <motion.div layout className="grid grid-cols-[48px,1fr] gap-3">
          <div className="flex justify-center">
            <div
              className="-mt-2 h-[200%] w-1 bg-background-tertiary"
              style={{
                marginTop: -10,
                height: 'calc(100% + 32px)',
              }}
            />
          </div>
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
        </motion.div>
      </LayoutGroup>
    </article>
  )
}

export default SecondaryPost
