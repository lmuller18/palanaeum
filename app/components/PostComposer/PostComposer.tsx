import clsx from 'clsx'
import useMeasure from 'react-use-measure'
import { Info, Image, BookOpen } from 'react-feather'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, Fragment, useState, useEffect } from 'react'

import Text from '@tiptap/extension-text'
import type { Editor } from '@tiptap/react'
import History from '@tiptap/extension-history'
import Document from '@tiptap/extension-document'
import { CheckIcon } from '@heroicons/react/solid'
import { Link, useFetcher } from '@remix-run/react'
import Paragraph from '@tiptap/extension-paragraph'
import { XCircleIcon } from '@heroicons/react/outline'
import { Listbox, Transition } from '@headlessui/react'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useEditor, Extension, EditorContent } from '@tiptap/react'

import { useUser, removeEmpty } from '~/utils'

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
  const uploadRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showContextInput, setShowContextInput] = useState(false)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

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
    const hasData = (data: unknown): data is { ok: boolean } => {
      return data != null && Object.hasOwn(data, 'ok')
    }

    const hasError = (data: unknown): data is { error: any } => {
      return data != null && Object.hasOwn(data, 'error')
    }

    if (fetcher.state === 'idle' && fetcher.data != null) {
      if (hasData(fetcher.data) && fetcher.data.ok) {
        editor?.commands.clearContent()
        contextEditor?.commands.clearContent()
        submitRef?.current?.blur()
        if (uploadRef.current?.value) {
          if (preview) URL.revokeObjectURL(preview)
          setPreview(null)
          uploadRef.current.value = ''
        }
        setShowContextInput(false)
      } else {
        if (hasError(fetcher.data)) console.log(fetcher.data.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data, fetcher.state])

  const createPost = () => {
    if (!chapter) return

    const content = editor?.getHTML()
    const context = contextEditor?.getText()
    const image = uploadRef.current?.files?.[0]

    const newPost = {
      chapterId: chapter.id,
      content,
      context,
      image,
    }

    fetcher.submit(removeEmpty(newPost), {
      action: '/api/posts',
      method: 'post',
      encType: 'multipart/form-data',
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

  const clearPhoto = () => {
    if (uploadRef.current?.value) uploadRef.current.value = ''
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  const characters = editor ? editor.storage.characterCount.characters() : 0
  const maximumCharacters = 240
  const remaining = maximumCharacters - characters

  const hasImage = !!preview
  const hasText = !editor?.isEmpty
  const validText =
    editor && editor.storage.characterCount.characters() <= maximumCharacters

  const submitDisabled =
    // submitting
    fetcher.state === 'submitting' ||
    // empty
    (!hasImage && !hasText) ||
    // invalid
    (hasText && !validText)

  return (
    <div className="border border-background-tertiary p-4 pb-0">
      <div className="grid grid-cols-[48px,1fr] gap-4">
        <Link to={`/users/${user.id}`} className="flex-shrink-0">
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
            <button type="button" onClick={changePhoto}>
              <Image className="h-5 w-5" />
            </button>
            <input
              ref={uploadRef}
              onChange={handleImageChange}
              id="image"
              name="image"
              type="file"
              className="sr-only"
            />
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

            <button
              type="button"
              className="inline-flex items-center rounded border border-transparent bg-blue-600 px-5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
              ref={submitRef}
              onClick={createPost}
              disabled={submitDisabled}
            >
              Post
            </button>
          </div>
        </div>

        <ContextInputSection
          editor={contextEditor}
          showContextInput={showContextInput}
        />
      </div>
      {preview && (
        <div className="mb-4 flex snap-x flex-row gap-2 overflow-y-auto border-t border-t-background-tertiary pt-2">
          <div className="relative h-28 w-28 flex-shrink-0 snap-start overflow-hidden rounded-lg shadow-lg">
            <img
              src={preview}
              alt="Upload"
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-0 right-0 mt-1 mr-1 overflow-hidden rounded-full bg-black/40 p-[2px]"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
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
      className="col-span-full"
    >
      <AnimatePresence initial={false}>
        {showContextInput && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-4"
          >
            <div className="border-y border-background-tertiary py-2">
              <EditorContent editor={editor} />
            </div>
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
