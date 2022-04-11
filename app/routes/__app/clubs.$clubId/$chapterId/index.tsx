import { Link } from 'remix'

import Badge from '~/elements/Badge'
import { pluralize, toLuxonDate } from '~/utils'
import { BookOpen, Type as TypeIcon } from 'react-feather'

export default function ChapterPage() {
  return (
    <div className="mx-auto max-w-screen-md lg:max-w-screen-lg">
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex w-fit flex-col gap-1">
            <h3 className="text-xl font-bold md:text-2xl">Discussions</h3>
            <div className="h-1 w-full bg-gradient-to-l from-fuchsia-300 to-blue-400" />
          </div>

          <div className="flex w-fit flex-col gap-1">
            <Link to="./new" className="text-xl font-bold md:text-2xl">
              New +
            </Link>
            <div className="h-1 w-full bg-gradient-to-l from-orange-400 to-pink-500" />
          </div>
        </div>
        <div className="divide-y">
          {[
            {
              discussion: {
                id: '1',
                title: 'Text Post',
                createdAt: new Date(),
                commentCount: 5,
                threadCount: 2,
              },
              author: { name: 'lmuller18' },
            },
            {
              discussion: {
                id: '2',
                title: 'Image Post',
                imageUrl: '/test.jpg',
                createdAt: new Date(),
                commentCount: 2,
                threadCount: 1,
              },
              author: { name: 'lmuller18' },
            },
          ]?.map(({ discussion, author }, index) => (
            <div className="grid gap-2 py-2" key={discussion.id}>
              <div className="grid grid-cols-[1fr,56px] gap-4">
                <div className="grid">
                  <Link
                    prefetch="intent"
                    className="mb-2 underline line-clamp-2"
                    to={discussion.id}
                  >
                    {discussion.title}
                  </Link>

                  <span className="text-xs text-[9px] font-light">
                    Posted by <Badge color="sky">{author.name}</Badge>{' '}
                    {toLuxonDate(discussion.createdAt).toRelative()}
                  </span>
                </div>
                <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-50">
                  {index % 3 === 0 && (
                    // {discussion.type === DiscussionType.TEXT && (
                    <div className="flex h-full w-full items-center justify-center">
                      <TypeIcon className="h-4 text-gray-800" />
                    </div>
                  )}
                  {index % 3 === 1 && (
                    // {discussion.type === DiscussionType.MEGA_THREAD && (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-4 text-gray-800" />
                    </div>
                  )}
                  {index % 3 === 2 && (
                    // {discussion.type === DiscussionType.IMAGE && (
                    <a
                      href={discussion.imageUrl ?? ''}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        alt="post"
                        src={discussion.imageUrl ?? ''}
                        className="h-full w-full object-cover object-center"
                      />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge color="teal">
                    {discussion.commentCount}{' '}
                    {pluralize('Comment', 'Comments', discussion.commentCount)}
                  </Badge>
                  <Badge color="rose">
                    {discussion.threadCount}{' '}
                    {pluralize('Thread', 'Threads', discussion.threadCount)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
