import { Form } from '@remix-run/react'

export default function UploadTestPage() {
  return (
    <div className="grid">
      <Form method="post" action="/api/file" encType="multipart/form-data">
        <input
          accept="image/jpeg,image/png,image/webp"
          type="file"
          name="image"
          required
        />
        <button>upload</button>
      </Form>
    </div>
  )
}
