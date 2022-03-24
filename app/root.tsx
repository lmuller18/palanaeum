import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import type { LinksFunction, MetaFunction, LoaderFunction } from 'remix'

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
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (user) {
    const headers = await prepareUserSession({ request, userId: user.id })
    return json<LoaderData>({ user }, { headers })
  }
  return json<LoaderData>({ user })
}

export default function App() {
  return (
    <html lang="en" className="min-h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
