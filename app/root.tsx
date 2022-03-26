import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  useLoaderData,
  ScrollRestoration,
} from 'remix'
import type { LinksFunction, MetaFunction, LoaderFunction } from 'remix'

import { ToastMessage } from './toast.server'
import tailwindStylesheetUrl from './styles/tailwind.css'
import {
  getSession,
  getUser,
  prepareUserSession,
  sessionStorage,
} from './session.server'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css', as: '' },
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Palanaeum',
  viewport: 'width=device-width,initial-scale=1',
})

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>
  toastMessage: ToastMessage | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  const session = await getSession(request)
  const toastMessage = session.get('toastMessage') as ToastMessage

  if (user) {
    const headers = await prepareUserSession({ request, userId: user.id })
    return json<LoaderData>(
      { user, toastMessage: toastMessage ?? null },
      { headers },
    )
  }

  const options = toastMessage
    ? { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } }
    : {}

  return json<LoaderData>({ user, toastMessage: toastMessage ?? null }, options)
}

export default function App() {
  const data = useLoaderData() as LoaderData

  useEffect(() => {
    if (!data.toastMessage) {
      return
    }
    const { message, type } = data.toastMessage

    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      default:
        throw new Error(`${type} is not handled`)
    }
  }, [data.toastMessage])

  return (
    <html lang="en" className="min-h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full">
        <Outlet />
        <ScrollRestoration />
        <Toaster />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
