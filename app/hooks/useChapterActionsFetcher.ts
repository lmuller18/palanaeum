import { useMemo, useEffect } from 'react'

import { useFetcher } from '@remix-run/react'

import type { ChapterListItem } from '~/models/chapter.server'

const useChapterActionsFetcher = (chapter: ChapterListItem) => {
  const fetcher = useFetcher()
  const state: 'idle' | 'success' | 'error' | 'submitting' = fetcher.submission
    ? 'submitting'
    : fetcher.data?.subscription
    ? 'success'
    : fetcher.data?.error
    ? 'error'
    : 'idle'

  useEffect(() => {
    if (state === 'error') {
      console.error(fetcher.data.error)
      // toast.error(fetcher.data.error)
    }
  }, [state, fetcher.data?.error])

  const actionType = fetcher.submission?.formData?.get('_action')

  const markingRead = state === 'submitting' && actionType === 'MARK_READ'
  const markingUnread = state === 'submitting' && actionType === 'MARK_UNREAD'

  const status: typeof chapter.status = useMemo(() => {
    if (markingRead) {
      if (chapter.count.completed === chapter.count.total - 1)
        return 'all_complete'
      return 'complete'
    }
    if (markingUnread) {
      if (chapter.status === 'not_started') return 'not_started'
      if (chapter.count.completed === 1) return 'not_started'
      return 'incomplete'
    }
    return chapter.status
  }, [markingRead, markingUnread, chapter])

  const floatingPercent =
    (state === 'submitting'
      ? (chapter.count.completed + (markingRead ? 1 : markingUnread ? -1 : 0)) /
        chapter.count.total
      : chapter.count.completed / chapter.count.total) * 100

  const percent = Math.round((floatingPercent + Number.EPSILON) * 100) / 100

  const count = {
    completed:
      chapter.count.completed + (markingRead ? 1 : markingUnread ? -1 : 0),
    total: chapter.count.total,
  }

  return { fetcher, markingRead, markingUnread, status, percent, state, count }
}

export default useChapterActionsFetcher
