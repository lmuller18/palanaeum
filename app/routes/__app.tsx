import { Link, Form, Outlet } from 'remix'

import Header from '~/components/elements/Typography/Header'

export default function AppLayout() {
  return (
    <>
      <header
        style={{
          backdropFilter: 'blur(2px)',
        }}
        className="sticky top-0 w-full bg-background-secondary shadow-lg sm:fixed sm:bg-opacity-50 sm:shadow-none"
      >
        <div className="absolute inset-0 h-full w-full blur-lg" />
        <div className="relative flex h-16 items-center justify-between px-4 text-white">
          <Link to="/">
            <Header size="h3">Palanaeum</Header>
          </Link>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>
      <Outlet />
    </>
  )

  // return (
  //   <div
  //     // className="flex h-full min-h-screen flex-col"
  //     // className="flex min-w-0 flex-1 flex-col overflow-hidden"
  //     className="min-h-full"
  //   >
  //     <header
  //       style={{
  //         backdropFilter: 'blur(2px)',
  //       }}
  //       className="fixed top-0 right-0 h-16 w-full bg-background-secondary bg-opacity-50"
  //     >
  //       <div className="absolute inset-0 h-full w-full blur-lg" />
  //       <div className="relative flex h-full items-center justify-between px-4 text-white">
  //         <Link to="/">
  //           <Header size="h3">Palanaeum</Header>
  //         </Link>
  //         <Form action="/logout" method="post">
  //           <button
  //             type="submit"
  //             className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
  //           >
  //             Logout
  //           </button>
  //         </Form>
  //       </div>
  //     </header>

  //     <main>
  //       <Outlet />
  //     </main>
  //   </div>
  // )
}
