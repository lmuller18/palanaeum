import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  useFetcher,
  useLoaderData,
  ScrollRestoration,
} from 'remix'
import type { LinksFunction, MetaFunction, LoaderFunction } from 'remix'

import PwaMeta from './pwa-meta'
import tailwindStylesheetUrl from './styles/tailwind.css'
import { getUser, prepareUserSession } from './session.server'
import {
  getSubscription,
  subscribe as doSubscribe,
} from './utils/notifications.utils'
import { removeEmpty } from './utils'
import { registerWebPush } from './utils/notifications.server'

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
  ENV: { [key: string]: string }
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)

  registerWebPush()

  const ENV = removeEmpty({
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  })

  if (user) {
    const headers = await prepareUserSession({ request, userId: user.id })
    return json<LoaderData>({ user, ENV }, { headers })
  }

  return json<LoaderData>({ user, ENV })
}

export default function App() {
  const data = useLoaderData() as LoaderData

  const subscriptionFetcher = useFetcher()
  const broadcastFetcher = useFetcher()

  const subscribe = async () => {
    const subscription = await doSubscribe()
    if (subscription) {
      subscriptionFetcher.submit(
        {
          subscription: JSON.stringify(subscription),
        },
        {
          method: 'post',
          replace: true,
          action: '/api/subscription',
        },
      )
    }
  }

  const broadcast = async () => {
    broadcastFetcher.load('/api/broadcast')
  }

  const list = async () => {
    const sub = await getSubscription()
    console.log('found sub: ', sub)
  }

  return (
    <html lang="en" className="dark">
      <head>
        <Meta />
        <Links />
        <PwaMeta />
      </head>
      <body>
        {data.user && (
          <>
            <button type="button" onClick={subscribe}>
              Subscribe
            </button>
            <button type="button" onClick={broadcast}>
              Send notification
            </button>
            <button type="button" onClick={list}>
              List
            </button>
          </>
        )}
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
