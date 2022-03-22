import { Form, Outlet } from 'remix'
import Header from '~/components/Typography/Header'

export default function AppLayout() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header
        style={{
          backdropFilter: 'blur(2px)',
        }}
        className="fixed top-0 right-0 flex h-16 w-full items-center justify-between bg-background-secondary bg-opacity-50 p-4 text-white"
      >
        <Header size="h3">Palanaeum</Header>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
        <div className="absolute inset-0 h-full w-full blur-lg" />
      </header>

      <main className="h-full">
        <Outlet />
      </main>
    </div>
  )
}
