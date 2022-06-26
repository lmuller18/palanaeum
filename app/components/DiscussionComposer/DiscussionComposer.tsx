import clsx from 'clsx'

import type { Editor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'

import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaStrikethrough,
} from 'react-icons/fa'

const DiscussionComposer = ({ editor }: { editor: Editor | null }) => {
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

export default DiscussionComposer
