import { Link } from 'remix'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDoubleDownIcon } from '@heroicons/react/outline'

import TextLink from '~/elements/TextLink'
import useValueChanged from '~/hooks/use-value-changed'
import { ChapterListItem } from '~/models/chapter.server'
import useChapterActionsFetcher from '~/hooks/useChapterActionsFetcher'

interface NextChapterSectionProps {
  chapter: ChapterListItem | null
}

const NextChapterSection = ({ chapter }: NextChapterSectionProps) => {
  const chapterChanged = useValueChanged(chapter)

  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        initial={chapterChanged ? { opacity: 0, x: '100%' } : false}
        animate={{ x: '0%', opacity: 1 }}
        exit={{ opacity: 0 }}
        key={chapter?.id ?? 'complete'}
        layoutId={chapter?.id ?? 'complete'}
        data-cy="next-chapter"
        className="mx-auto mb-4 min-h-[275px] max-w-screen-md rounded-lg bg-background-secondary py-8 px-8 text-gray-100 shadow-xl md:min-h-[368px] lg:max-w-screen-lg"
      >
        {chapter ? <NextChapter chapter={chapter} /> : <NoChapter />}
      </motion.div>
    </AnimatePresence>
  )
}

interface NextChapterProps {
  chapter: ChapterListItem
}

const NextChapter = ({ chapter }: NextChapterProps) => {
  const { state, fetcher } = useChapterActionsFetcher(chapter)

  return (
    <>
      <div className="mb-4 text-3xl font-bold md:text-5xl">
        <p className="w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
          Up Next
        </p>

        <Link
          className="bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text transition-colors duration-300 hover:text-transparent"
          to={chapter.id}
        >
          {chapter.title}
        </Link>
      </div>

      {chapter.status !== 'not_started' ? (
        <>
          <p className="mb-2 bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-lg md:text-3xl">
            Completed by{' '}
            <span className="text-3xl font-bold text-transparent md:text-5xl">
              {chapter.count.completed}{' '}
            </span>
            of
            <span className="text-3xl font-bold text-transparent md:text-5xl">
              {' '}
              {chapter.count.total}{' '}
            </span>
            members.
          </p>

          {chapter.count.completed === chapter.count.total - 1 &&
            chapter.status !== 'complete' && (
              <p className="text-xl font-medium md:text-4xl">
                Don't
                <span className="bg-gradient-to-l from-red-300 to-pink-500 bg-clip-text font-bold text-transparent">
                  {' '}
                  fall behind{' '}
                </span>
                now!
              </p>
            )}
        </>
      ) : (
        <p className="text-xl font-medium md:text-4xl">
          It's a race
          <span className="bg-gradient-to-l from-green-400 to-emerald-500 bg-clip-text font-bold text-transparent">
            {' '}
            to be first!
          </span>
        </p>
      )}

      <fetcher.Form action="chapter-actions" method="post" className="mt-3">
        <input type="hidden" name="chapterId" value={chapter.id} />
        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-md border border-transparent text-sm font-medium text-white shadow-sm md:w-48">
          <button
            name="_action"
            value="MARK_READ"
            disabled={
              state === 'submitting' ||
              chapter.status === 'complete' ||
              chapter.status === 'all_complete'
            }
            className="peer mr-[50px] h-full w-full bg-indigo-600 px-4 py-2 pr-[25px] hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-600/70 disabled:text-white/70 disabled:focus:ring-indigo-500/70"
          >
            <span className="mr-[20px] block translate-x-[25px] transform pl-[20px]">
              {state === 'submitting' ? 'Completing...' : 'Complete'}
            </span>
          </button>
          <button
            type="button"
            className="absolute right-0 top-0 h-full border-l-2 border-l-indigo-500 bg-indigo-600 px-4 py-2 hover:bg-indigo-700 focus:ring-indigo-500 peer-hover:bg-indigo-700 peer-disabled:bg-indigo-600/70 peer-disabled:text-white/70 peer-disabled:focus:ring-indigo-500/70"
            onClick={() =>
              document
                .querySelector(`#${chapter.id}`)
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <ChevronDoubleDownIcon className="h-4 w-4" />
          </button>
        </div>
      </fetcher.Form>
    </>
  )
}

const NoChapter = () => (
  <>
    <div className="mb-4 text-3xl font-bold md:text-5xl">
      <p>Book</p>

      <p className="w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-transparent">
        Complete
      </p>
    </div>

    <p className="text-xl font-medium md:text-4xl">
      Continue participating in{' '}
      <TextLink to="." color="indigo">
        the conversation
      </TextLink>
    </p>

    {/* <div className="mt-4 flex flex-col items-start gap-2">
      <Badge color="cyan">3 Discussions</Badge>
      <Badge color="indigo">6 Comments</Badge>
      <Badge color="rose">14 Tweets</Badge>
    </div> */}
  </>
)

export default NextChapterSection
