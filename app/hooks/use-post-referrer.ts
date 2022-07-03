import { useLocation } from '@remix-run/react'
import { useMatch } from 'react-router'

const usePostReferrer = (): {
  currentPostReferrer: PostReferrer
  nextPostReferrer: PostReferrer
} => {
  const state = useLocation().state as {
    postReferrer: PostReferrer | null | undefined
  } | null
  const nextRef = useCurrentPostLocation()
  const defaultRef: PostReferrer = { type: 'CLUB_LIST', path: '/clubs' }

  return {
    nextPostReferrer:
      nextRef.type === 'POST_DETAILS'
        ? state?.postReferrer && isPostReferrer(state.postReferrer)
          ? state.postReferrer
          : defaultRef
        : nextRef,
    currentPostReferrer:
      state?.postReferrer && isPostReferrer(state.postReferrer)
        ? state.postReferrer
        : defaultRef,
  }
}

const POST_REFERRERS = [
  'CLUB_HOME',
  'CLUB_POSTS',
  'CHAPTER_HOME',
  'CHAPTER_POSTS',
  'POST_DETAILS',
  'CLUB_LIST',
] as const
type PostReferrerType = typeof POST_REFERRERS[number]

interface PostReferrer {
  type: PostReferrerType
  path: string
}

function isPostReferrer(postReferrer: any): postReferrer is PostReferrer {
  if (
    'type' in postReferrer &&
    'path' in postReferrer &&
    typeof postReferrer.path === 'string'
  ) {
    return POST_REFERRERS.includes(postReferrer.type as PostReferrerType)
  }
  return false
}

const useCurrentPostLocation = (): PostReferrer => {
  const fromClubHome = useMatch('/clubs/:clubId')
  const fromClubPosts = useMatch('/clubs/:clubId/posts')
  const fromChapterHome = useMatch('/clubs/:clubId/chapters/:chapterId')
  const fromChapterPosts = useMatch('/clubs/:clubId/chapters/:chapterId/posts')
  const fromPostDetails = useMatch('/posts/:postId')

  if (fromClubHome) return { type: 'CLUB_HOME', path: fromClubHome.pathname }
  if (fromClubPosts) return { type: 'CLUB_POSTS', path: fromClubPosts.pathname }
  if (fromChapterHome)
    return { type: 'CHAPTER_HOME', path: fromChapterHome.pathname }
  if (fromChapterPosts)
    return { type: 'CHAPTER_POSTS', path: fromChapterPosts.pathname }
  if (fromPostDetails)
    return { type: 'POST_DETAILS', path: fromPostDetails.pathname }
  return { type: 'CLUB_LIST', path: '/clubs' }
}

export default usePostReferrer
