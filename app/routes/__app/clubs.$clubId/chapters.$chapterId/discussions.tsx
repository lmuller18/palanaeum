import invariant from 'tiny-invariant'
import { json, LoaderFunction, useLoaderData, useNavigate } from 'remix'

import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'
import DiscussionSummary from '~/components/DiscussionSummary'

interface LoaderData {
  discussions: {
    user: {
      id: string
      username: string
      avatar: string
    }
    discussion: {
      id: string
      title: string
    }
    chapter: {
      id: string
      title: string
    }
  }[]
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  invariant(params.chapterId, 'expected chapterId')

  const discussions = await getDiscussions(params.chapterId, userId)

  if (!discussions)
    throw new Response('Problem finding discussions', { status: 500 })

  return json({
    discussions,
  })
}

export default function DiscussionsPage() {
  const { discussions } = useLoaderData() as LoaderData

  const navigate = useNavigate()

  const toChapter = (id: string) => {
    navigate(`/discussions/${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      {discussions.map(d => (
        <button
          onClick={() => toChapter(d.discussion.id)}
          key={d.discussion.id}
          className="block overflow-hidden rounded-lg bg-background-secondary p-4 text-left shadow-sm"
        >
          <DiscussionSummary {...d} />
        </button>
      ))}
    </div>
  )
}

export { default as CatchBoundary } from '~/components/CatchBoundary'

async function getDiscussions(chapterId: string, userId: string) {
  const dbDiscussions = await prisma.discussion.findMany({
    where: {
      chapterId,
      chapter: { club: { members: { some: { userId } } } },
    },
    select: {
      id: true,
      title: true,
      member: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  return dbDiscussions.map(d => ({
    user: {
      id: d.member.user.id,
      username: d.member.user.username,
      avatar: d.member.user.avatar,
    },
    discussion: {
      id: d.id,
      title: d.title,
    },
    chapter: {
      id: d.chapter.id,
      title: d.chapter.title,
    },
  }))
}
