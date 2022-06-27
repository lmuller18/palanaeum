import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/outline'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'

import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'
import { Upload } from 'react-feather'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return json({})
}

interface ActionData {
  errors: {
    title?: string
    chapters?: string
    author?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const title = formData.get('title')
  const author = formData.get('author')
  const chapters = formData.get('chapters')

  if (typeof title !== 'string' || title.length === 0) {
    return json<ActionData>(
      { errors: { title: 'Title is required' } },
      { status: 400 },
    )
  }

  if (typeof author !== 'string' || author.length === 0) {
    return json<ActionData>(
      { errors: { title: 'Author is required' } },
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
    author,
    userId,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
  })
  return redirect(`/clubs/${club.id}`)
}

export default function NewClubPage() {
  const actionData = useActionData() as ActionData

  const titleRef = useRef<HTMLInputElement>(null)
  const authorRef = useRef<HTMLInputElement>(null)
  const chaptersRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const [img, setImg] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus()
    } else if (actionData?.errors?.chapters) {
      chaptersRef.current?.focus()
    } else if (actionData?.errors?.author) {
      authorRef.current?.focus()
    }
  }, [actionData])

  useEffect(() => {
    if (!img) return

    if (preview) URL.revokeObjectURL(preview)

    const objectUrl = URL.createObjectURL(img)
    setPreview(objectUrl)

    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [img])

  const handleFileUploadClick = () => {
    if (!uploadRef?.current) return
    uploadRef.current.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files?.[0]) return
    const image = e.target.files[0]
    setImg(image)
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Link
          to={`/api/books/search?q=${encodeURIComponent('The Alloy of Law')}`}
        >
          Search
        </Link>
        <p className="my-8 w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-3xl font-bold text-transparent">
          Create New Club
        </p>
        <Form method="post" className="space-y-6">
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
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-black"
              />
              {actionData?.errors?.title && (
                <div className="pt-1 text-red-500" id="title-error">
                  {actionData.errors.title}
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-2 h-32 w-full overflow-hidden rounded-lg">
            {preview && (
              <img src={preview} className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/70 p-4 text-white">
              <button type="button" onClick={handleFileUploadClick}>
                <Upload />
              </button>
            </div>
          </div>
          <input
            ref={uploadRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/webp"
            type="file"
            name="image"
            className="absolute opacity-0"
            required
            style={{ zIndex: -1, width: 0.1, height: 0.1 }}
          />

          <div className="sm:col-span-6">
            <label
              htmlFor="cover-photo"
              className="block text-sm font-medium text-white"
            >
              Cover photo
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-white px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-white"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-white">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-background-primary font-medium text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-white">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-200"
            >
              Author
            </label>
            <div className="mt-1">
              <input
                ref={authorRef}
                id="author"
                required
                type="text"
                name="author"
                aria-invalid={actionData?.errors?.author ? true : undefined}
                aria-describedby="author-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg text-black"
              />
              {actionData?.errors?.author && (
                <div className="pt-1 text-red-700" id="author-error">
                  {actionData.errors.author}
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

          <div className="w-full">
            <div className="rounded-lg bg-purple-100 text-purple-700">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                      <div className="flex items-center gap-2">
                        <InformationCircleIcon className="h-5 w-5" />{' '}
                        <span>How many chapters should I enter?</span>
                      </div>
                      <ChevronUpIcon
                        className={clsx(
                          'h-5 w-5',
                          open && 'rotate-180 transform',
                        )}
                      />
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="p-4 pt-2 text-sm">
                        For the best experience, select the number of regular
                        chapters and insert special chapters like Prologues,
                        Interludes, and Epilogues later through the club
                        settings.
                        <Disclosure>
                          {({ open }) => (
                            <>
                              <Disclosure.Button className="mt-2 flex w-full items-center justify-between border-t py-2 text-sm focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                                <span>Want an example?</span>
                                <span className="font-medium">VIEW</span>
                              </Disclosure.Button>

                              <Transition
                                enter="transition duration-100 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0"
                              >
                                <Disclosure.Panel className="pt-2 text-sm">
                                  For a book with this format:
                                  <ul className="my-2 list-inside list-disc">
                                    <li>Prologue</li>
                                    <li>Chapter 1</li>
                                    <li>Chapter 2</li>
                                    <li>Chapter 3</li>
                                    <li>Chapter 4</li>
                                    <li>Interlude</li>
                                    <li>Chapter 5</li>
                                    <li>Epilogue</li>
                                  </ul>
                                  <p>
                                    Create a club with 5 chapters and insert the
                                    Prologue, Interlude, and Epilogue chapters
                                    later through the chapter management.
                                  </p>
                                </Disclosure.Panel>
                              </Transition>
                            </>
                          )}
                        </Disclosure>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
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

async function createClub({
  title,
  author,
  image,
  chapterCount,
  userId,
}: {
  title: string
  author: string
  image: string
  chapterCount: number
  userId: string
}) {
  const chapters = Array.from(Array(chapterCount).keys()).map(i => ({
    order: i,
    title: `Chapter ${i + 1}`,
  }))

  return prisma.club.create({
    data: {
      title,
      image,
      author,
      ownerId: userId,
      members: {
        create: {
          isOwner: true,
          userId,
        },
      },
      chapters: {
        createMany: {
          data: chapters,
        },
      },
    },
  })
}
