import clsx from 'clsx'
import useMeasure from 'react-use-measure'
import { Info, Image } from 'react-feather'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'

import Text from '@tiptap/extension-text'
import { useFetcher } from '@remix-run/react'
import History from '@tiptap/extension-history'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import { XCircleIcon } from '@heroicons/react/outline'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'
import CharacterCount from '@tiptap/extension-character-count'

import { removeEmpty } from '~/utils'
import Button from '~/elements/Button'
import useClickAway from '~/hooks/use-click-away'

import CircularProgress from '../CircularProgress'

const ReplyComposer = ({
  chapterId,
  rootId,
  parentId,
}: {
  chapterId: string
  rootId: string
  parentId: string
}) => {
  const uploadRef = useRef<HTMLInputElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)

  const [focused, setFocused] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [clickedOutside, setClickedOutside] = useState(false)
  const [showContextInput, setShowContextInput] = useState(false)

  const fetcher = useFetcher()

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Compose your reply',
      }),
    ],
    autofocus: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-violet max-w-none prose-p:mt-0 prose-p:mb-0 focus:outline-none',
      },
    },
    onFocus() {
      setFocused(true)
    },
  })

  const contextEditor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
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
        setFocused(false)
        setClickedOutside(false)
        if (uploadRef.current?.value) {
          if (preview) URL.revokeObjectURL(preview)
          setPreview(null)
          uploadRef.current.value = ''
        }
      } else {
        console.log(fetcher.data.error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher])

  const clickAway = useCallback(() => {
    if (clickedOutside) {
      setFocused(false)
      setShowContextInput(false)
      setClickedOutside(false)
      contextEditor?.commands.clearContent()
    } else {
      setClickedOutside(true)
    }
  }, [clickedOutside, contextEditor?.commands])

  const clickawayRef = useClickAway<HTMLDivElement>(clickAway)

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

  const createReply = () => {
    const content = editor?.getHTML()
    const context = contextEditor?.getText()
    const image = uploadRef.current?.files?.[0]

    const newPost = {
      rootId,
      parentId,
      chapterId,
      content,
      context,
      image,
    }

    fetcher.submit(removeEmpty(newPost), {
      action: '/api/posts',
      method: 'post',
      replace: true,
      encType: 'multipart/form-data',
    })
  }

  const characters = editor ? editor.storage.characterCount.characters() : 0
  const maximumCharacters = 240
  const remaining = maximumCharacters - characters

  const [animateRef, { height }] = useMeasure()

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
    <div
      ref={clickawayRef}
      className="fixed bottom-0 left-0 right-0 min-h-[62px] w-full border-t border-background-tertiary bg-background-secondary pb-safe-bottom"
    >
      <div className="min-w-0 flex-grow border-x border-t border-background-tertiary p-4">
        <EditorContent editor={editor} />

        <motion.div
          animate={{ height: height || 'auto' }}
          className="relative overflow-hidden"
        >
          <AnimatePresence>
            {focused && (
              <motion.div
                initial="blurred"
                animate="focused"
                exit="exit"
                variants={{
                  blurred: { opacity: 0, y: -10 },
                  focused: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 10 },
                }}
                ref={animateRef}
                className={clsx(height ? 'absolute w-full' : 'relative')}
              >
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-blue-500">
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
                    <button type="button" onClick={handleContextButton}>
                      <Info className="mt-px h-5 w-5" />
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
                      onClick={createReply}
                      ref={submitRef}
                      disabled={submitDisabled}
                    >
                      Post
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {showContextInput && (
                    <motion.div
                      initial="blurred"
                      animate="focused"
                      exit="blurred"
                      variants={{
                        blurred: { opacity: 0, y: 10 },
                        focused: { opacity: 1, y: 0 },
                      }}
                      className="mt-6"
                    >
                      <EditorContent editor={contextEditor} autoFocus />
                    </motion.div>
                  )}
                </AnimatePresence>
                {preview && (
                  <div className="flex snap-x flex-row gap-2 overflow-y-auto border-t border-t-background-tertiary pt-2">
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ReplyComposer
