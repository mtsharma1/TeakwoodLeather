'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from "next-themes"

export default function Providers({ children, ...props
}: { children: React.ReactNode }) {
  return <SessionProvider>
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  </SessionProvider>
}