import invariant from 'tiny-invariant'
import { useEffect, useRef, useState } from 'react'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'
import Header from '~/elements/Typography/Header'
import { sendPush } from '~/utils/notifications.server'
import DiscussionComposer from '~/components/DiscussionComposer'
import { createNotification } from '~/utils/notifications.utils'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return json({})
}

interface ActionData {
  errors: {
    title?: string
    content?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  const { clubId, chapterId } = params
  invariant(clubId, 'Expected clubId')
  invariant(chapterId, 'Expected chapterId')

  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')

  if (typeof title !== 'string' || title.length === 0) {
    return json<ActionData>(
      { errors: { title: 'Title is required' } },
      { status: 400 },
    )
  }

  if (
    typeof content !== 'string' ||
    content.length === 0 ||
    content === '<p></p>'
  ) {
    return json<ActionData>(
      { errors: { content: 'Discussion content is required' } },
      { status: 400 },
    )
  }

  const memberId = await getMemberIdFromUser(userId, clubId)

  const discussion = await createDiscussion({
    memberId,
    chapterId,
    title,
    content,
  })

  const discussionUrl = `/clubs/${clubId}/chapters/${chapterId}/discussions/${discussion.id}`

  await notifyNewDiscussion(discussion, discussionUrl)

  return redirect(discussionUrl)
}

async function notifyNewDiscussion(
  discussion: Awaited<ReturnType<typeof createDiscussion>>,
  discussionUrl: string,
) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      User: {
        members: {
          some: {
            removed: false,
            id: {
              not: discussion.member.id,
            },
            progress: {
              some: {
                chapterId: discussion.chapter.id,
              },
            },
          },
        },
      },
    },
  })

  // const origin = new URL(request.url).origin
  const notification = createNotification({
    title: `New Discussion: ${discussion.title}`,
    body: `${discussion.member.user.username} posted a new discussion in ${discussion.chapter.title}`,
    icon: discussion.member.user.avatar,
    image: discussion.image ?? discussion.chapter.club.image,
    data: {
      options: {
        action: 'navigate',
        url: discussionUrl,
      },
    },
  })

  const notifications: Promise<any>[] = []
  subscriptions.forEach(subscription => {
    notifications.push(sendPush(subscription, notification))
  })
  return Promise.allSettled(notifications)
}

export default function NewDiscussionPage() {
  const actionData = useActionData() as ActionData

  const [htmlContent, setHtmlContent] = useState('')

  const titleRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '…',
      }),
    ],
    onUpdate({ editor }) {
      setHtmlContent(editor.getHTML())
    },
    autofocus: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus()
    } else if (actionData?.errors?.content) {
      editor?.commands.focus()
    }
  }, [actionData, editor?.commands])

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-screen-md px-4">
        <Header size="h4" font="serif" className="mb-4">
          New Discussion
        </Header>
        <Form method="post" className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-200"
            >
              Title
            </label>
            <div className="mt-1">
              <input
                ref={titleRef}
                id="title"
                required
                type="text"
                name="title"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-describedby="title-error"
                className="w-full rounded border border-background-tertiary bg-background-secondary px-2 py-1 text-lg"
              />
              {actionData?.errors?.title && (
                <div className="pt-1 text-red-500" id="title-error">
                  {actionData.errors.title}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-200"
            >
              Content
            </label>
            <div className="mt-1">
              <DiscussionComposer editor={editor} />
              <input
                type="hidden"
                minLength={'<p></p>'.length}
                required
                value={htmlContent}
                name="content"
              />
              {actionData?.errors?.content && (
                <div className="pt-1 text-red-500" id="content-error">
                  {actionData.errors.content}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Discussion
          </button>
        </Form>
      </div>
    </div>
  )
}

export const handle = {
  backNavigation: () => 'discussions',
}

async function getMemberIdFromUser(userId: string, clubId: string) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      clubId,
    },
    select: { id: true },
  })
  if (!member) {
    throw new Response('Member not associated with Club', { status: 403 })
  }

  return member.id
}

async function createDiscussion({
  title,
  chapterId,
  content,
  image,
  memberId,
}: {
  title: string
  chapterId: string
  image?: string
  content?: string
  memberId: string
}) {
  return prisma.discussion.create({
    data: {
      title,
      chapterId,
      image,
      content,
      memberId,
    },
    select: {
      id: true,
      image: true,
      title: true,
      member: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              avatar: true,
              username: true,
            },
          },
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          club: {
            select: {
              id: true,
              title: true,
              image: true,
            },
          },
        },
      },
    },
  })
}
