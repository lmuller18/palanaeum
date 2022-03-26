import { useEffect, useRef } from 'react'
import { Form, json, useActionData, redirect } from 'remix'
import type { ActionFunction, LoaderFunction, MetaFunction } from 'remix'

import { requireUserId } from '~/session.server'
import { createClub } from '~/models/club.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return json({})
}

interface ActionData {
  errors: {
    title?: string
    chapters?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const title = formData.get('title')
  const chapters = formData.get('chapters')

  if (typeof title !== 'string' || title.length === 0) {
    return json<ActionData>(
      { errors: { title: 'Title is required' } },
      { status: 400 },
    )
  }

  if (typeof chapters !== 'string' || chapters.length === 0) {
    return json<ActionData>(
      { errors: { chapters: 'Number of chapters is required' } },
      { status: 400 },
    )
  }

  const chapterCount = parseInt(chapters)

  if (isNaN(chapterCount)) {
    return json<ActionData>(
      { errors: { chapters: 'Number of chapters is not a number' } },
      { status: 400 },
    )
  }

  const club = await createClub({
    title,
    chapterCount,
    userId,
    image: ' https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
  })
  return redirect(`/clubs/${club.id}`)
}

export const meta: MetaFunction = () => {
  return {
    title: 'Sign Up',
  }
}

export default function NewClubPage() {
  const actionData = useActionData() as ActionData

  const titleRef = useRef<HTMLInputElement>(null)
  const chaptersRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus()
    } else if (actionData?.errors?.chapters) {
      chaptersRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
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
                autoFocus={true}
                name="title"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-describedby="title-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-black"
              />
              {actionData?.errors?.title && (
                <div className="pt-1 text-red-700" id="title-error">
                  {actionData.errors.title}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="chapters"
              className="block text-sm font-medium text-gray-200"
            >
              How Many Chapters?
            </label>
            <div className="mt-1">
              <input
                ref={chaptersRef}
                id="chapters"
                required
                type="number"
                name="chapters"
                aria-invalid={actionData?.errors?.chapters ? true : undefined}
                aria-describedby="chapters-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-black"
              />
              {actionData?.errors?.chapters && (
                <div className="pt-1 text-red-700" id="chapters-error">
                  {actionData.errors.chapters}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Club
          </button>
        </Form>
      </div>
    </div>
  )
}
