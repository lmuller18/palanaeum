import clsx from 'clsx'
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from 'react'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'

import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaStrikethrough,
} from 'react-icons/fa'

import Button from '~/elements/Button'
import { removeEmpty } from '~/utils'

const CommentReplyComposer = ({
  discussionId,
  parentId,
  rootId,
  onSubmit,
}: {
  discussionId: string
  parentId: string
  rootId: string
  onSubmit: Function
}) => {
  const fetcher = useFetcher()
  const submitRef = useRef<HTMLButtonElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Compose Your Reply …',
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
        submitRef?.current?.blur()
        onSubmit()
      } else {
        console.log(fetcher.data.error)
      }
    }
  }, [fetcher, onSubmit])

  const createComment = () => {
    // shouldnt happen
    if (!editor) return

    const content = editor.getHTML()

    const newPost = {
      discussionId,
      content,
      parentId,
      rootId,
    }

    fetcher.submit(removeEmpty(newPost), {
      action: '/api/comments',
      method: 'post',
      replace: true,
    })
  }

  return (
    <div className="rounded-lg border border-background-tertiary bg-background-secondary p-4">
      <div className="flex flex-col">
        <div className="col-span-full row-start-1 min-h-[48px]">
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <EditorButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={!!editor?.isActive('bold')}
            >
              <FaBold className="h-4 w-4" />
            </EditorButton>
            <EditorButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={!!editor?.isActive('italic')}
            >
              <FaItalic className="h-4 w-4" />
            </EditorButton>
            <EditorButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              active={!!editor?.isActive('strike')}
            >
              <FaStrikethrough className="h-4 w-4" />
            </EditorButton>
            <EditorButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={!!editor?.isActive('bulletList')}
            >
              <FaListUl className="h-4 w-4" />
            </EditorButton>
            <EditorButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={!!editor?.isActive('orderedList')}
            >
              <FaListOl className="h-4 w-4" />
            </EditorButton>
            <EditorButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              active={!!editor?.isActive('blockquote')}
            >
              <FaQuoteLeft className="h-4 w-4" />
            </EditorButton>
          </div>

          <Button
            type="button"
            size="xs"
            ref={submitRef}
            onClick={createComment}
            disabled={
              fetcher.state === 'submitting' || !editor || editor.isEmpty
            }
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  )
}

interface EditorButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  active: boolean
}

const EditorButton = ({ active, ...props }: EditorButtonProps) => (
  <button
    type="button"
    aria-label={active.toString()}
    className={clsx('p-2', active && 'bg-background-primary')}
    {...props}
  />
)

export default CommentReplyComposer
