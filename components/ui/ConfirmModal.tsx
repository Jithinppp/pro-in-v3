'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  onConfirm: () => void
  onClose: () => void
  confirmLabel?: string
  cancelLabel?: string
  children?: ReactNode
}

export function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  children,
}: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          className="absolute top-3 right-3 text-mid-gray hover:text-charcoal"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
        <h2 className="text-lg font-medium text-charcoal mb-3">{title}</h2>
        {description && (
          <p className="text-sm text-mid-gray mb-4">{description}</p>
        )}
        {children}
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
