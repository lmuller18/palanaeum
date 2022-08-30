import clsx from 'clsx'
import { Tab } from '@headlessui/react'
import { useNavigate, useParams } from '@remix-run/react'

import Post from '../Post'
import Text from '~/elements/Typography/Text'
import DiscussionSummary from '../DiscussionSummary'
import ClickableArea from '~/elements/ClickableArea'

const TopConversations = ({
  topPost,
  topDiscussion,
  readChapters,
}: {
  readChapters: string[]
  topPost: {
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
      image: string | null
      context: string | null
      replies: number
      createdAt: string
    }
  } | null
  topDiscussion: {
    user: {
      id: string
      avatar: string
      username: string
    }
    chapter: {
      clubId: string
      id: string
      title: string
    }
    discussion: {
      id: string
      title: string
      replyCount: number
    }
  } | null
}) => {
  const { clubId } = useParams()
  const navigate = useNavigate()
  if (!clubId) return null

  if (topPost && !readChapters.includes(topPost.chapter.id)) {
    topPost.post.image = null
  }

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-background-secondary/40 p-1">
        <Tab
          className={({ selected }) =>
            clsx(
              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
              'focus:outline-none',
              selected
                ? 'bg-sky-900/40 shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
            )
          }
        >
          Top Post
        </Tab>
        <Tab
          className={({ selected }) =>
            clsx(
              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-white',
              'focus:outline-none',
              selected
                ? 'bg-sky-900/40 shadow'
                : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
            )
          }
        >
          Top Discussion
        </Tab>
      </Tab.List>
      <Tab.Panels className="mt-4">
        <Tab.Panel className="focus:outline-none">
          {topPost ? (
            <div className="relative">
              <ClickableArea
                as="div"
                className={clsx(
                  !readChapters.includes(topPost.chapter.id) && 'blur-sm',
                  'p-2 active:rounded-lg',
                )}
              >
                <Post
                  clubId={clubId}
                  user={topPost.user}
                  chapter={topPost.chapter}
                  post={topPost.post}
                />
              </ClickableArea>
              {!readChapters.includes(topPost.chapter.id) && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center text-center">
                  <Text variant="title2" serif>
                    Spoilers! Catch up to your friends to view this post.
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Text variant="title2" as="p" className="-mt-6" serif>
                No Posts Yet.
              </Text>
            </div>
          )}
        </Tab.Panel>

        <Tab.Panel className={clsx('focus:outline-none')}>
          {topDiscussion ? (
            <div className="relative">
              <ClickableArea
                as="div"
                className={clsx(
                  !readChapters.includes(topDiscussion.chapter.id) && 'blur-sm',
                  'p-2 active:rounded-lg',
                )}
                onClick={() =>
                  navigate(
                    `/clubs/${topDiscussion.chapter.clubId}/chapters/${topDiscussion.chapter.id}/discussions/${topDiscussion.discussion.id}`,
                  )
                }
              >
                <DiscussionSummary
                  user={topDiscussion.user}
                  chapter={topDiscussion.chapter}
                  discussion={topDiscussion.discussion}
                />
              </ClickableArea>
              {!readChapters.includes(topDiscussion.chapter.id) && (
                <div className="absolute inset-0 flex h-full w-full items-center justify-center text-center">
                  <Text variant="title2" serif>
                    Spoilers! Catch up to your friends to view this post.
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Text variant="title2" as="p" className="-mt-6" serif>
                No Discussions Yet.
              </Text>
            </div>
          )}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  )
}

export default TopConversations
