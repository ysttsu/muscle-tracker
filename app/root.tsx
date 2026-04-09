import { Links, Outlet, Scripts, ScrollRestoration } from 'react-router'
import './tailwind.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="cupcake">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>腹筋トラッカー 💪</title>
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
