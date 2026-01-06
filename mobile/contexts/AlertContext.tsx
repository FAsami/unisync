import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AppAlertDialog, AlertType } from '@/components/ui/AppAlertDialog'

interface AlertOptions {
  title: string
  description: string
  type?: AlertType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void
  hideAlert: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<AlertOptions>({
    title: '',
    description: '',
  })

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions)
    setIsOpen(true)
  }

  const hideAlert = () => {
    setIsOpen(false)
    setIsLoading(false)
  }

  const handleConfirm = async () => {
    if (options.onConfirm) {
      const result = options.onConfirm()
      if (result instanceof Promise) {
        setIsLoading(true)
        try {
          await result
          hideAlert()
        } catch (error) {
          console.error('Alert confirm error:', error)
          // Optional: Don't close on error? Or show error?
          // For now, we stop loading but keep alert open if error?
          // Or we close it.
          // Let's stop loading so user can try again or cancel.
          setIsLoading(false)
        }
      } else {
        hideAlert()
      }
    } else {
      hideAlert()
    }
  }

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AppAlertDialog
        isOpen={isOpen}
        onClose={hideAlert}
        title={options.title}
        description={options.description}
        type={options.type}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
