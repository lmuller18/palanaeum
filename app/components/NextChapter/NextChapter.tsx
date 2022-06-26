import { Link, useFetcher } from '@remix-run/react'
import TextLink from '~/elements/TextLink'
import Text from '~/elements/Typography/Text'

const NextChapter = ({
  chapter,
  club,
}: {
  chapter: {
    id: string
    title: string
    membersCompleted: number
    status: 'incomplete' | 'not_started'
  } | null
  club: {
    id: string
    title: string
  }
}) => {
  const nextChapterFetcher = useFetcher()

  if (!chapter)
    return (
      <div>
        <Text as="p" variant="title3">
          You have finished {club.title}!
        </Text>
        <Text as="p" variant="body1">
          Remember to keep continuing in the conversations with other club
          members.
        </Text>
      </div>
    )

  return (
    <div>
      <TextLink
        to={`chapters/${chapter.id}`}
        variant="title3"
        className="mb-2 block w-fit"
      >
        {chapter.title}
      </TextLink>

      {chapter.status === 'incomplete' && (
        <Text variant="body2">
          Completed by {chapter.membersCompleted - 1} other members.
        </Text>
      )}
      {/* <Text variant="body2">Completed by all other members.</Text> */}
      {chapter.status === 'not_started' && (
        <Text variant="body2">Not completed by any other members.</Text>
      )}

      <div className="mt-3 flex items-center justify-around">
        <Link
          to={`chapters/${chapter.id}`}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          View Chapter
        </Link>
        <nextChapterFetcher.Form
          action={`/api/chapters/${chapter.id}/read`}
          method="post"
        >
          <button
            name="_action"
            value="MARK_READ"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-background-tertiary px-4 py-2 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Mark Read
          </button>
        </nextChapterFetcher.Form>
      </div>
    </div>
  )
}

export default NextChapter
