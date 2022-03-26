import Badge from '~/elements/Badge'
import Progress from '~/elements/Progress'
import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'

interface ChapterCardProps {
  chapter: ChapterListItem
}

const ChapterCard = ({ chapter }: ChapterCardProps) => {
  const { fetcher, percent, status, state } = useChapterActionsFetcher(chapter)

  const progressColor = (() => {
    if (percent <= 25) return 'rose'
    if (percent < 100) return 'blue'
    return 'emerald'
  })()

  return (
    <div className="block hover:bg-background-secondary">
      <div className="flex flex-col gap-4 px-8 py-4 sm:px-10">
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <p className="text-lg font-medium text-indigo-400">{chapter.title}</p>
          <div className="flex flex-wrap items-center gap-1">
            <Badge color={status === 'not_started' ? 'emerald' : 'rose'}>
              Not Started
            </Badge>
            <Badge color={status === 'incomplete' ? 'emerald' : 'rose'}>
              Incomplete
            </Badge>
            <Badge color={status === 'complete' ? 'emerald' : 'rose'}>
              Complete
            </Badge>
            <Badge color={status === 'all_complete' ? 'emerald' : 'rose'}>
              All Complete
            </Badge>
          </div>
        </div>

        <fetcher.Form action="chapter-actions" method="post">
          <input type="hidden" name="chapterId" value={chapter.id} />
          {(status === 'incomplete' || status === 'not_started') && (
            <button
              disabled={state === 'submitting'}
              name="_action"
              value="MARK_READ"
            >
              Mark Read
            </button>
          )}
          {(status === 'complete' || status === 'all_complete') && (
            <button
              disabled={state === 'submitting'}
              name="_action"
              value="MARK_UNREAD"
            >
              Mark Unread
            </button>
          )}
        </fetcher.Form>

        <Progress
          color={progressColor}
          size="md"
          rounded="md"
          value={percent}
        />
      </div>
    </div>
  )
}

export default ChapterCard
