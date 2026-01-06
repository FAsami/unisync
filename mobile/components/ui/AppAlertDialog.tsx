import React from 'react'
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button'
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react-native'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AppAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type?: AlertType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  isLoading?: boolean
}

const ALERT_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: '#10B981',
    bg: 'bg-success-100',
    darkBg: 'dark:bg-success-900/20',
    iconColor: 'text-success-600',
    darkIconColor: 'dark:text-success-400',
    buttonColor: 'bg-success-500',
    buttonHoverColor: 'hover:bg-success-600',
  },
  error: {
    icon: AlertCircle,
    color: '#EF4444',
    bg: 'bg-error-100',
    darkBg: 'dark:bg-error-900/20',
    iconColor: 'text-error-600',
    darkIconColor: 'dark:text-error-400',
    buttonColor: 'bg-error-500',
    buttonHoverColor: 'hover:bg-error-600',
  },
  warning: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: 'bg-warning-100',
    darkBg: 'dark:bg-warning-900/20',
    iconColor: 'text-warning-600',
    darkIconColor: 'dark:text-warning-400',
    buttonColor: 'bg-warning-500',
    buttonHoverColor: 'hover:bg-warning-600',
  },
  info: {
    icon: Info,
    color: '#3B82F6', // info-500
    bg: 'bg-info-100',
    darkBg: 'dark:bg-info-900/20',
    iconColor: 'text-info-600',
    darkIconColor: 'dark:text-info-400',
    buttonColor: 'bg-info-500',
    buttonHoverColor: 'hover:bg-info-600',
  },
}

export function AppAlertDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
}: AppAlertDialogProps) {
  const config = ALERT_CONFIG[type]

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent className="m-4 bg-white dark:bg-background-900 rounded-3xl border border-outline-100 dark:border-outline-800 shadow-xl max-w-[320px]">
        <ModalHeader className="pt-8 px-5 pb-2 flex-col items-center">
          <Icon
            as={config.icon}
            size={48}
            className={`${config.iconColor} ${config.darkIconColor} mb-4`}
          />
          <Heading
            size="lg"
            className="text-center font-bold text-typography-900 leading-tight"
          >
            {title}
          </Heading>
        </ModalHeader>

        <ModalBody className="px-6 pb-6">
          <Text className="text-center text-sm text-typography-500 leading-5">
            {description}
          </Text>
        </ModalBody>

        <ModalFooter className="flex-row px-6 pb-6 pt-0 border-t-0 p-0 justify-center gap-3">
          {onConfirm ? (
            <>
              <Button
                variant="outline"
                action="secondary"
                onPress={onClose}
                className="flex-1 border-outline-200 dark:border-outline-800 rounded-full"
                isDisabled={isLoading}
              >
                <ButtonText className="text-typography-600 font-medium">
                  {cancelText}
                </ButtonText>
              </Button>
              <Button
                onPress={handleConfirm}
                isDisabled={isLoading}
                className={`flex-1 ${config.buttonColor} ${config.buttonHoverColor} rounded-full`}
              >
                {isLoading && <ButtonSpinner color="#fff" />}
                <ButtonText className="text-white font-medium ml-1">
                  {confirmText}
                </ButtonText>
              </Button>
            </>
          ) : (
            <Button
              onPress={handleConfirm}
              isDisabled={isLoading}
              className={`flex-1 ${config.buttonColor} ${config.buttonHoverColor} rounded-full`}
            >
              {isLoading && <ButtonSpinner color="#fff" />}
              <ButtonText className="text-white font-medium ml-1">
                {confirmText === 'Confirm' ? 'Okay' : confirmText}
              </ButtonText>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
