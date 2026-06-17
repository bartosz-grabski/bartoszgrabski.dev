'use client'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Toast } from '@/components/ui/Toast'

const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

/** Holds a single transient toast; persists across route navigations. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={toast} />
    </ToastContext.Provider>
  )
}
