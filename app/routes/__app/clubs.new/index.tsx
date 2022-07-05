import clsx from 'clsx'
import cuid from 'cuid'
import { useEffect, useRef, useState } from 'react'
import { Disclosure, Transition } from '@headlessui/react'
import { Form, useActionData, useNavigate } from '@remix-run/react'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import {
  BookOpenIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import {
  json,
  redirect,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node'

import Button from '~/elements/Button'
import { uploadS3Handler } from '~/s3.server'
import { requireUserId } from '~/session.server'
import OutlinedInput from '~/elements/OutlinedInput'
import { createManualClub } from '~/models/clubs.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request)
  return null
}

export default function NewClubPage() {
  const navigate = useNavigate()

  const actionData = useActionData() as ActionData

  const titleRef = useRef<HTMLInputElement>(null)
  const authorRef = useRef<HTMLInputElement>(null)
  const chaptersRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

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
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files?.[0]) return
    const image = e.target.files[0]
    if (preview) URL.revokeObjectURL(preview)
    const objectUrl = URL.createObjectURL(image)
    setPreview(objectUrl)
  }

  const changePhoto = () => {
    uploadRef.current?.click()
  }

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <p className="my-8 w-fit bg-gradient-to-l from-fuchsia-300 to-blue-400 bg-clip-text text-3xl font-bold text-transparent">
          Create New Club
        </p>

        <div className="flex items-center justify-center">
          <Button onClick={() => navigate('search')}>
            <BookOpenIcon className="mr-2 h-5 w-5" /> Search Books
          </Button>
        </div>

        <div className="relative my-6">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background-primary px-2 text-white">
              Or create manually
            </span>
          </div>
        </div>

        <Form method="post" className="space-y-6" encType="multipart/form-data">
          <div>
            <label
              htmlFor="cover-photo"
              className="block text-sm font-medium text-white"
            >
              {preview ? 'Preview Cover' : 'Cover photo'}
            </label>
            {preview && (
              <div>
                <div className="relative py-6">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='transparent'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke-linecap='square' stroke-width='1' stroke='hsla(220, 17%, 14%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
                    }}
                  />
                  <div className="relative my-2 mx-auto aspect-[0.66/1] w-full max-w-[200px] overflow-hidden rounded-lg shadow-md">
                    <img
                      className="h-full w-full object-cover"
                      src={preview}
                      alt="preview cover"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={changePhoto}
                  >
                    Change Cover
                  </Button>
                </div>
              </div>
            )}
            <div
              className={clsx(
                preview && 'hidden',
                'mt-1 flex justify-center rounded-md border-2 border-dashed border-white px-6 pt-5 pb-6',
              )}
            >
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
                    htmlFor="image"
                    className="relative cursor-pointer rounded-md bg-background-primary font-medium text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      ref={uploadRef}
                      onChange={handleImageChange}
                      id="image"
                      name="image"
                      type="file"
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-white">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          {actionData?.errors?.image && (
            <div className="pt-1 text-red-700" id="image-error">
              {actionData.errors.image}
            </div>
          )}

          <OutlinedInput
            labelProps={{
              htmlFor: 'title',
              children: 'Title',
            }}
            inputProps={{
              id: 'title',
              required: true,
              type: 'text',
              name: 'title',
              'aria-invalid': actionData?.errors?.title ? true : undefined,
              'aria-describedby': 'title-error',
            }}
          />
          {actionData?.errors?.title && (
            <div className="pt-1 text-red-500" id="title-error">
              {actionData.errors.title}
            </div>
          )}

          <OutlinedInput
            labelProps={{
              htmlFor: 'author',
              children: 'Author',
            }}
            inputProps={{
              id: 'author',
              required: true,
              type: 'text',
              name: 'author',
              'aria-invalid': actionData?.errors?.author ? true : undefined,
              'aria-describedby': 'author-error',
            }}
          />
          {actionData?.errors?.author && (
            <div className="pt-1 text-red-700" id="author-error">
              {actionData.errors.author}
            </div>
          )}

          <OutlinedInput
            labelProps={{
              htmlFor: 'chapters',
              children: 'How Many Chapters?',
            }}
            inputProps={{
              id: 'chapters',
              required: true,
              type: 'text',
              name: 'chapters',
              'aria-invalid': actionData?.errors?.chapters ? true : undefined,
              'aria-describedby': 'chapters-error',
            }}
          />
          {actionData?.errors?.chapters && (
            <div className="pt-1 text-red-700" id="chapters-error">
              {actionData.errors.chapters}
            </div>
          )}

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

interface ActionData {
  errors: {
    title?: string
    chapters?: string
    author?: string
    image?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const clubId = cuid()
  const imgKey = cuid()

  const formData = await parseMultipartFormData(
    request,
    composeUploadHandlers(
      uploadS3Handler({
        key: `clubs/${clubId}/${imgKey}`,
        filename: imgKey,
      }),
      createMemoryUploadHandler(),
    ),
  )

  const title = formData.get('title')
  const author = formData.get('author')
  const chapters = formData.get('chapters')
  const image = formData.get('image')

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

  if (typeof image !== 'string' || image.length === 0 || image === '_') {
    return json<ActionData>(
      { errors: { image: 'Club image is required' } },
      { status: 400 },
    )
  }

  const club = await createManualClub({
    clubId,
    title,
    chapterCount,
    author,
    userId,
    image: `/reserve/${image}`,
  })

  return redirect(`/clubs/${club.id}/members/manage`)
}

export { default as CatchBoundary } from '~/components/CatchBoundary'
