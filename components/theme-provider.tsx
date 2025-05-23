'use client'

import type * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export type Theme = 'dark' | 'light' | 'system'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
