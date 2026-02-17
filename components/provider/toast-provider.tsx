'use client'

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e5e7eb',
        },
      //   success: {
      //     duration: 3000,
      //   },
      //   error: {
      //     duration: 5000,
      //   }
      }}
    />
  )
}