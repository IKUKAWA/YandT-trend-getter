'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import { useMobileDetection } from '@/hooks/useMobileDetection'

interface MobileActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  height?: 'auto' | 'half' | 'full'
  showHandle?: boolean
  closeOnBackdrop?: boolean
}

export function MobileActionSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  closeOnBackdrop = true
}: MobileActionSheetProps) {
  const { isMobile, screenHeight } = useMobileDetection()

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  const getSheetHeight = () => {
    switch (height) {
      case 'half':
        return screenHeight * 0.5
      case 'full':
        return screenHeight * 0.9
      default:
        return 'auto'
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Close if dragged down more than 150px
    if (info.offset.y > 150) {
      onClose()
    }
  }

  // For desktop, render as a modal
  if (!isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeOnBackdrop ? onClose : undefined}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
                {title && (
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                )}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Mobile action sheet
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Action Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl"
            style={{
              height: getSheetHeight(),
              maxHeight: screenHeight * 0.9
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Specialized action sheet for filters
export function MobileFilterSheet({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <MobileActionSheet
      isOpen={isOpen}
      onClose={onClose}
      title="フィルター"
      height="half"
    >
      {children}
    </MobileActionSheet>
  )
}

// Action sheet for export options
export function MobileExportSheet({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <MobileActionSheet
      isOpen={isOpen}
      onClose={onClose}
      title="エクスポート"
      height="auto"
    >
      {children}
    </MobileActionSheet>
  )
}