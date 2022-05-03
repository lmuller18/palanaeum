import clsx from 'clsx'
import { Link, useFetcher } from 'remix'
import StarterKit from '@tiptap/starter-kit'
import { CheckIcon } from '@heroicons/react/solid'
import { Fragment, useEffect, useState } from 'react'
import { BookOpen, Image, Smile } from 'react-feather'
import Placeholder from '@tiptap/extension-placeholder'
import { Listbox, Transition } from '@headlessui/react'
import { useEditor, EditorContent } from '@tiptap/react'
import CharacterCount from '@tiptap/extension-character-count'

import Button from '~/elements/Button'
import { removeEmpty, useUser } from '~/utils'
import CircularProgress from '../CircularProgress'

const PostComposer = ({
  chapters,
  defaultChapter,
}: {
  chapters: {
    id: string
    title: string
    order: number
  }[]
  defaultChapter: {
    id: string
    title: string
    order: number
  }
}) => {
  const user = useUser()
  const fetcher = useFetcher()

  const [chapter, setChapter] = useState<{
    id: string
    title: string
    order: number
  }>(defaultChapter)

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount,
      Placeholder.configure({
        placeholder: "What's new?",
      }),
    ],
    autofocus: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0 mb-6 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data.ok) {
        editor?.commands.clearContent()
      } else {
        console.log(fetcher.data.error)
      }
    }
  }, [fetcher, editor?.commands])

  const createPost = () => {
    if (!chapter) return

    const content = editor?.getHTML()
    // const image = undefined

    const newPost = {
      chapterId: chapter.id,
      content,
      // image,
    }

    fetcher.submit(removeEmpty(newPost), {
      action: '/api/posts',
      method: 'post',
      replace: true,
    })
  }

  const characters = editor ? editor.storage.characterCount.characters() : 0
  const maximumCharacters = 240
  const remaining = maximumCharacters - characters

  return (
    <div className="border-x border-t border-background-tertiary p-4">
      <div className="flex items-start gap-4">
        <Link to={`/user/${user.id}`} className="flex-shrink-0">
          <img
            className="h-12 w-12 overflow-hidden rounded-full object-cover"
            src={user.avatar}
            alt="user avatar"
          />
        </Link>

        <div className="min-w-0 flex-grow">
          <div className="min-h-[48px]">
            <EditorContent editor={editor} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-500">
              <ChapterSelect
                setChapter={setChapter}
                chapter={chapter}
                chapters={chapters}
              />
              <Image className="h-5 w-5" />
              <Smile className="mt-px h-5 w-5" />
            </div>

            <div className="flex items-center gap-2">
              <CircularProgress
                label={remaining <= 25 ? remaining : undefined}
                percent={(characters / maximumCharacters) * 100}
              />

              <Button
                type="button"
                size="xs"
                onClick={createPost}
                disabled={
                  fetcher.state === 'submitting' ||
                  !editor ||
                  editor.isEmpty ||
                  editor.storage.characterCount.characters() < 10 ||
                  editor.storage.characterCount.characters() > maximumCharacters
                }
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ChapterSelect = ({
  chapters,
  chapter,
  setChapter,
}: {
  chapters: { id: string; title: string; order: number }[]
  chapter: { id: string; title: string; order: number }
  setChapter: React.Dispatch<
    React.SetStateAction<{
      id: string
      title: string
      order: number
    }>
  >
}) => {
  const chapt = chapters.find(c => c.id === chapter.id)

  if (!chapt) return <BookOpen className="mt-px h-5 w-5 opacity-50" />

  return (
    <Listbox value={chapt} onChange={setChapter}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative flex">
              <BookOpen className="mt-px h-5 w-5" />
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-44 overflow-auto rounded-md border border-background-tertiary bg-background-primary text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {chapters.map(chapter => (
                  <Listbox.Option
                    key={chapter.id}
                    className={({ selected, active }) =>
                      clsx(
                        (selected || active) && 'bg-background-tertiary',
                        'relative cursor-default select-none py-2 pl-3 pr-9 transition-colors duration-200 first:pt-3 last:pb-3',
                      )
                    }
                    value={chapter}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={clsx(
                            selected ? 'font-semibold' : 'font-normal',
                            'block truncate text-white',
                          )}
                        >
                          {chapter.title}
                        </span>

                        {selected ? (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default PostComposer
