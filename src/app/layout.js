import { AppProvider } from '@/context/AppContext'
import "../styles/globals.css"

export const metadata = {
  title: "poll App",
  description: "poll app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}