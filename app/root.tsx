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

import PwaMeta from './pwa-meta'
import { ToastMessage } from './toast.server'
import tailwindStylesheetUrl from './styles/tailwind.css'
import {
  getUser,
  getSession,
  sessionStorage,
  prepareUserSession,
} from './session.server'

export const links: LinksFunction = () => {
  return [
    { rel: 'manifest', href: '/site.webmanifest' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&display=swap',
      rel: 'stylesheet',
    },
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Palanaeum',
  viewport: 'width=device-width,initial-scale=1, viewport-fit=cover',
  'apple-mobile-web-app-status-bar-style': 'black-translucent',
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
    <html lang="en" className="dark">
      <head>
        <Meta />
        <Links />
        <PwaMeta />
      </head>
      <body>
        <Outlet />
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
