'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type Session } from 'next-auth'
import { ToastProvider } from './toast-provider'

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export default function Providers({ children, session, ...props }: ProvidersProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <NextThemesProvider {...props}>
        {children}
        <ToastProvider />
      </NextThemesProvider>
    </SessionProvider>
  )
}