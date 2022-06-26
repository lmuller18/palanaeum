import clsx from 'clsx'
import { useFetcher } from '@remix-run/react'
import useMeasure from 'react-use-measure'
import { Image, Info } from 'react-feather'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'
import CharacterCount from '@tiptap/extension-character-count'

import Button from '~/elements/Button'
import { removeEmpty } from '~/utils'
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
  const [focused, setFocused] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)
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
      } else {
        console.log(fetcher.data.error)
      }
    }
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

  const createReply = () => {
    const content = editor?.getHTML()
    const context = contextEditor?.getText()
    // const image = undefined

    const newPost = {
      rootId,
      parentId,
      chapterId,
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

  const characters = editor ? editor.storage.characterCount.characters() : 0
  const maximumCharacters = 240
  const remaining = maximumCharacters - characters

  const [animateRef, { height }] = useMeasure()

  return (
    <div
      ref={clickawayRef}
      className="fixed bottom-0 left-0 right-0 min-h-[62px] w-full border-t border-background-tertiary bg-background-secondary"
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
                  blurred: {
                    opacity: 0,
                    y: -10,
                  },
                  focused: {
                    opacity: 1,
                    y: 0,
                  },
                  exit: {
                    opacity: 0,
                    y: 10,
                  },
                }}
                ref={animateRef}
                className={clsx(height ? 'absolute w-full' : 'relative')}
              >
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-blue-500">
                    <Image className="h-5 w-5" />
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
                      disabled={
                        fetcher.state === 'submitting' ||
                        !editor ||
                        editor.isEmpty ||
                        editor.storage.characterCount.characters() < 10 ||
                        editor.storage.characterCount.characters() >
                          maximumCharacters
                      }
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
                        blurred: {
                          opacity: 0,
                          y: 10,
                        },
                        focused: {
                          opacity: 1,
                          y: 0,
                        },
                      }}
                      className="mt-6"
                    >
                      <EditorContent editor={contextEditor} autoFocus />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default ReplyComposer
