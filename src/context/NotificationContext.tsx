'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success' | 'trend' | 'system'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'system' | 'trends' | 'users' | 'security' | 'performance'
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
  metadata?: {
    source?: string
    url?: string
    data?: any
  }
  autoRemove?: boolean
  duration?: number
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  categories: {
    system: boolean
    trends: boolean
    users: boolean
    security: boolean
    performance: boolean
  }
  priorities: {
    low: boolean
    medium: boolean
    high: boolean
    urgent: boolean
  }
}

interface NotificationContextType {
  notifications: Notification[]
  settings: NotificationSettings
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => string
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  subscribeToRealTimeNotifications: () => void
  unsubscribeFromRealTimeNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: false,
  categories: {
    system: true,
    trends: true,
    users: true,
    security: true,
    performance: true
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }
    }
  }, [])

  // Request desktop notification permission
  useEffect(() => {
    if (settings.desktop && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [settings.desktop])

  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
  ): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = {
      id,
      timestamp: new Date(),
      isRead: false,
      ...notificationData
    }

    // Check if notifications are enabled for this category and priority
    if (!settings.enabled || 
        !settings.categories[notification.category] || 
        !settings.priorities[notification.priority]) {
      return id
    }

    setNotifications(prev => [notification, ...prev])

    // Play sound notification
    if (settings.sound && notification.priority !== 'low') {
      playNotificationSound(notification.type)
    }

    // Show desktop notification
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      showDesktopNotification(notification)
    }

    // Auto-remove notification
    if (notification.autoRemove !== false) {
      const duration = notification.duration || getDefaultDuration(notification.priority)
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [settings])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notification-settings', JSON.stringify(updatedSettings))
  }, [settings])

  // Simulated real-time notification subscription
  const subscribeToRealTimeNotifications = useCallback(() => {
    if (isSubscribed) return

    setIsSubscribed(true)
    console.log('Subscribed to real-time notifications')

    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const mockNotifications = [
          {
            type: 'trend' as const,
            title: '新しいトレンド検出',
            message: `「${['AI', 'Web3', 'メタバース', 'NFT'][Math.floor(Math.random() * 4)]}」カテゴリで急上昇中`,
            priority: 'medium' as const,
            category: 'trends' as const,
            metadata: { source: 'Trend Monitor' }
          },
          {
            type: 'warning' as const,
            title: 'API制限に接近',
            message: 'YouTube API の利用制限に近づいています',
            priority: 'high' as const,
            category: 'system' as const,
            metadata: { source: 'API Monitor' }
          },
          {
            type: 'info' as const,
            title: '新規ユーザー登録',
            message: '5人の新規ユーザーが登録されました',
            priority: 'low' as const,
            category: 'users' as const,
            metadata: { source: 'User Manager' }
          }
        ]

        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)]
        addNotification(randomNotification)
      }
    }, 30000) // Every 30 seconds

    // Store interval ID for cleanup
    ;(window as any).notificationInterval = interval
  }, [isSubscribed, addNotification])

  const unsubscribeFromRealTimeNotifications = useCallback(() => {
    if (!isSubscribed) return

    setIsSubscribed(false)
    console.log('Unsubscribed from real-time notifications')

    if ((window as any).notificationInterval) {
      clearInterval((window as any).notificationInterval)
      delete (window as any).notificationInterval
    }
  }, [isSubscribed])

  // Helper functions
  const playNotificationSound = (type: string) => {
    try {
      const audio = new Audio()
      audio.volume = 0.3
      
      switch (type) {
        case 'error':
          audio.src = 'data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdADAAA='
          break
        case 'warning':
          audio.src = 'data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdADAAA='
          break
        default:
          audio.src = 'data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdADAAA='
      }
      
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  const showDesktopNotification = (notification: Notification) => {
    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: !settings.sound
      })

      desktopNotification.onclick = () => {
        window.focus()
        markAsRead(notification.id)
        desktopNotification.close()
      }

      // Auto close after duration
      setTimeout(() => {
        desktopNotification.close()
      }, getDefaultDuration(notification.priority))
    } catch (error) {
      console.warn('Failed to show desktop notification:', error)
    }
  }

  const getDefaultDuration = (priority: string): number => {
    switch (priority) {
      case 'urgent': return 0 // Don't auto-remove urgent notifications
      case 'high': return 10000 // 10 seconds
      case 'medium': return 7000 // 7 seconds
      case 'low': return 5000 // 5 seconds
      default: return 7000
    }
  }

  const value: NotificationContextType = {
    notifications,
    settings,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    subscribeToRealTimeNotifications,
    unsubscribeFromRealTimeNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Utility hook for creating notifications with common patterns
export function useNotificationHelpers() {
  const { addNotification } = useNotifications()

  const notifySuccess = useCallback((message: string, title = '成功') => {
    return addNotification({
      type: 'success',
      title,
      message,
      priority: 'low',
      category: 'system',
      autoRemove: true,
      duration: 5000
    })
  }, [addNotification])

  const notifyError = useCallback((message: string, title = 'エラー') => {
    return addNotification({
      type: 'error',
      title,
      message,
      priority: 'high',
      category: 'system',
      autoRemove: false
    })
  }, [addNotification])

  const notifyWarning = useCallback((message: string, title = '警告') => {
    return addNotification({
      type: 'warning',
      title,
      message,
      priority: 'medium',
      category: 'system',
      autoRemove: true,
      duration: 8000
    })
  }, [addNotification])

  const notifyInfo = useCallback((message: string, title = '情報') => {
    return addNotification({
      type: 'info',
      title,
      message,
      priority: 'low',
      category: 'system',
      autoRemove: true,
      duration: 6000
    })
  }, [addNotification])

  const notifyTrend = useCallback((message: string, title = 'トレンド', data?: any) => {
    return addNotification({
      type: 'trend',
      title,
      message,
      priority: 'medium',
      category: 'trends',
      autoRemove: true,
      duration: 10000,
      metadata: { source: 'Trend Analyzer', data }
    })
  }, [addNotification])

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyTrend
  }
}