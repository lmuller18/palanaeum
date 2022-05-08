import { useFetcher } from 'remix'
import { Image, Info } from 'react-feather'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

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
  const [clickedOutside, setClickedOutside] = useState(false)

  const clickAway = useCallback(() => {
    if (clickedOutside) {
      setFocused(false)
      setClickedOutside(false)
    } else {
      setClickedOutside(true)
    }
  }, [clickedOutside])

  const ref = useClickAway<HTMLDivElement>(clickAway)

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

  useEffect(() => {
    if (fetcher.type === 'done') {
      if (fetcher.data.ok) {
        editor?.commands.clearContent()
      } else {
        console.log(fetcher.data.error)
      }
    }
  }, [fetcher, editor?.commands])

  const createReply = () => {
    const content = editor?.getHTML()
    // const image = undefined

    const newPost = {
      rootId,
      parentId,
      chapterId,
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
    <LayoutGroup>
      <motion.div
        layout
        ref={ref}
        className="fixed bottom-0 left-0 right-0 min-h-[62px] w-full border-t border-background-tertiary bg-background-secondary"
      >
        <motion.div
          layout
          className="min-w-0 flex-grow border-x border-t border-background-tertiary p-4"
        >
          <motion.div layout="position">
            <EditorContent editor={editor} />
          </motion.div>

          <AnimatePresence presenceAffectsLayout exitBeforeEnter>
            {focused && (
              <motion.div
                layout
                initial="blurred"
                animate="focused"
                exit="blurred"
                variants={{
                  blurred: {
                    opacity: 0,
                    y: -10,
                  },
                  focused: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                className="mt-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 text-blue-500">
                  <Image className="h-5 w-5" />
                  <Info className="mt-px h-5 w-5" />
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  )
}

export default ReplyComposer
