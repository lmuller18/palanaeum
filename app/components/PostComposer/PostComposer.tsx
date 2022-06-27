import clsx from 'clsx'
import { Link, useFetcher } from '@remix-run/react'
import useMeasure from 'react-use-measure'
import { CheckIcon } from '@heroicons/react/solid'
import { BookOpen, Image, Info } from 'react-feather'
import { Listbox, Transition } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useEffect, useRef, useState } from 'react'

import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { Editor } from '@tiptap/react'
import { useEditor, EditorContent, Extension } from '@tiptap/react'

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
  const submitRef = useRef<HTMLButtonElement>(null)
  const [showContextInput, setShowContextInput] = useState(false)

  const [chapter, setChapter] = useState<{
    id: string
    title: string
    order: number
  }>(defaultChapter)

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      CharacterCount,
      Placeholder.configure({
        placeholder: 'What just happened?',
      }),
    ],
    autofocus: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0 focus:outline-none',
      },
    },
  })

  const contextEditor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      Extension.create({
        addKeyboardShortcuts() {
          return {
            Enter() {
              return true
            },
          }
        },
      }),
      CharacterCount.configure({
        limit: 100,
      }),
      Placeholder.configure({
        placeholder: 'Provide some context',
      }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data.ok) {
        editor?.commands.clearContent()
        contextEditor?.commands.clearContent()
        submitRef?.current?.blur()
        setShowContextInput(false)
      } else {
        console.log(fetcher.data.error)
      }
    }
  }, [fetcher.type, fetcher.data])

  const createPost = () => {
    if (!chapter) return

    const content = editor?.getHTML()
    const context = contextEditor?.getText()
    // const image = undefined

    const newPost = {
      chapterId: chapter.id,
      content,
      context,
      // image,
    }

    fetcher.submit(removeEmpty(newPost), {
      action: '/api/posts',
      method: 'post',
      replace: true,
    })
  }

  const handleContextButton = () => {
    if (showContextInput) {
      setShowContextInput(false)
      contextEditor?.commands.clearContent()
    } else {
      setShowContextInput(true)
      contextEditor?.commands.focus()
    }
  }

  const characters = editor ? editor.storage.characterCount.characters() : 0
  const maximumCharacters = 240
  const remaining = maximumCharacters - characters

  return (
    <div className="border-x border-t border-background-tertiary p-4">
      <div className="grid grid-cols-[48px,1fr] gap-4">
        <Link to={`/user/${user.id}`} className="flex-shrink-0">
          <img
            className="h-12 w-12 overflow-hidden rounded-full object-cover"
            src={user.avatar}
            alt="user avatar"
          />
        </Link>

        <div className="min-h-[48px] overflow-hidden">
          <EditorContent editor={editor} />
        </div>

        <div className="col-start-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-500">
            <ChapterSelect
              setChapter={setChapter}
              chapter={chapter}
              chapters={chapters}
            />
            <Image className="h-5 w-5" />
            <button
              type="button"
              className="mt-px"
              onClick={handleContextButton}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CircularProgress
              label={remaining <= 25 ? remaining : undefined}
              percent={(characters / maximumCharacters) * 100}
            />

            <Button
              type="button"
              size="xs"
              ref={submitRef}
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

        <ContextInputSection
          editor={contextEditor}
          showContextInput={showContextInput}
        />
      </div>
    </div>
  )
}

const ContextInputSection = ({
  editor,
  showContextInput,
}: {
  editor: Editor | null
  showContextInput: boolean
}) => {
  const [ref, { height }] = useMeasure()

  return (
    <motion.div
      animate={{ height: height || 'auto' }}
      className="relative col-span-full overflow-hidden"
    >
      <AnimatePresence initial={false}>
        {showContextInput && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              height ? 'absolute w-full' : 'relative',
              'border-y border-background-tertiary py-2',
            )}
          >
            <EditorContent editor={editor} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
