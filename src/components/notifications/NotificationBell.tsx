'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { NotificationCenter } from './NotificationCenter'

interface NotificationBellProps {
  className?: string
  showBadge?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function NotificationBell({ 
  className = '', 
  showBadge = true, 
  size = 'md' 
}: NotificationBellProps) {
  const { unreadCount, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  }

  // Animate bell when new notifications arrive
  React.useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationRead = (id: string) => {
    markAsRead(id)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`relative ${buttonSizeClasses[size]} rounded-lg transition-colors hover:bg-white/10 ${className}`}
      >
        <motion.div
          animate={isAnimating ? {
            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
            scale: [1, 1.1, 1, 1.05, 1]
          } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {unreadCount > 0 ? (
            <BellRing className={`${sizeClasses[size]} text-purple-600 dark:text-purple-400`} />
          ) : (
            <Bell className={`${sizeClasses[size]} text-gray-600 dark:text-gray-400`} />
          )}
        </motion.div>

        {/* Notification Badge */}
        {showBadge && unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`absolute -top-1 -right-1 ${badgeSizeClasses[size]} bg-red-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* Pulse Effect for Urgent Notifications */}
        {unreadCount > 0 && (
          <motion.div
            className={`absolute inset-0 rounded-lg bg-purple-500/20`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNotificationRead={handleNotificationRead}
      />
    </>
  )
}