import { useUser } from '~/utils'
import Post from '~/components/Post'
import Text from '~/elements/Typography/Text'
import DiscussionSummary from '~/components/DiscussionSummary'

export default function ChapterPage() {
  const user = useUser()
  return (
    <>
      {/* Top Post Block */}
      <div className="mb-6 border-b border-t-2 border-sky-400 border-b-background-tertiary bg-gradient-to-b from-sky-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Top Post
        </Text>
        <Post
          user={user}
          chapter={{ id: '3', name: 'Chapter 3' }}
          post={{
            id: '1',
            content: `So Mraize's boss is willing to make deals with the Fused to gain
          Oathgate access. Interesting that he would need them, since Mraize
          seems to have access to things off world already.`,
          }}
        />
      </div>

      {/* Top Discussion Block */}
      <div className="mb-6 border-b border-t-2 border-emerald-400 border-b-background-tertiary bg-gradient-to-b from-emerald-400/10 via-transparent p-4">
        <Text variant="title2" className="mb-4" as="h3">
          Hottest Discussion
        </Text>
        <DiscussionSummary
          user={user}
          chapter={{ id: '1', title: 'Chapter 5' }}
          discussion={{ id: '1', title: '3 Pure Tones and 3 Shards of Roshar' }}
        />
      </div>
    </>
  )
}
