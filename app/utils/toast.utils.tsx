import toast from 'react-hot-toast'

export const notify = (message: string) =>
  toast(t => (
    <span>
      {message}
      <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
    </span>
  ))
