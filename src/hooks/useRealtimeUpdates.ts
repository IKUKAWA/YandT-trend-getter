import { useState, useEffect, useCallback, useRef } from 'react'

interface UseRealtimeUpdatesOptions {
  enabled?: boolean
  interval?: number // milliseconds
  onUpdate?: () => void
  onError?: (error: Error) => void
}

interface RealtimeUpdateState {
  isUpdating: boolean
  lastUpdate: Date | null
  updateCount: number
  error: Error | null
}

export function useRealtimeUpdates({
  enabled = false,
  interval = 30000, // 30 seconds default
  onUpdate,
  onError
}: UseRealtimeUpdatesOptions = {}) {
  const [state, setState] = useState<RealtimeUpdateState>({
    isUpdating: false,
    lastUpdate: null,
    updateCount: 0,
    error: null
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isEnabledRef = useRef(enabled)

  // Update ref when enabled changes
  useEffect(() => {
    isEnabledRef.current = enabled
  }, [enabled])

  const performUpdate = useCallback(async () => {
    if (!isEnabledRef.current) return

    setState(prev => ({ ...prev, isUpdating: true, error: null }))

    try {
      await onUpdate?.()
      
      setState(prev => ({
        ...prev,
        isUpdating: false,
        lastUpdate: new Date(),
        updateCount: prev.updateCount + 1
      }))
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Update failed')
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: err
      }))
      onError?.(err)
    }
  }, [onUpdate, onError])

  // Manual update trigger
  const triggerUpdate = useCallback(() => {
    performUpdate()
  }, [performUpdate])

  // Setup interval
  useEffect(() => {
    if (enabled && interval > 0) {
      // Perform initial update
      performUpdate()

      // Setup interval
      intervalRef.current = setInterval(() => {
        performUpdate()
      }, interval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }, [enabled, interval, performUpdate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return {
    ...state,
    triggerUpdate,
    nextUpdateIn: intervalRef.current && state.lastUpdate
      ? Math.max(0, interval - (Date.now() - state.lastUpdate.getTime()))
      : null
  }
}

// Hook for WebSocket-based real-time updates
export function useWebSocketUpdates(
  url: string | null,
  options: {
    enabled?: boolean
    reconnectInterval?: number
    onMessage?: (data: any) => void
    onError?: (error: Event) => void
    onConnect?: () => void
    onDisconnect?: () => void
  } = {}
) {
  const {
    enabled = true,
    reconnectInterval = 5000,
    onMessage,
    onError,
    onConnect,
    onDisconnect
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (!url || !enabled || wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setReconnectAttempts(0)
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (event) => {
        onError?.(event)
      }

      ws.onclose = () => {
        setIsConnected(false)
        onDisconnect?.()
        wsRef.current = null

        // Attempt to reconnect
        if (enabled && reconnectInterval > 0) {
          setReconnectAttempts(prev => prev + 1)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    }
  }, [url, enabled, reconnectInterval, onMessage, onError, onConnect, onDisconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      return true
    }
    return false
  }, [])

  // Connect when enabled
  useEffect(() => {
    if (enabled && url) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, url, connect, disconnect])

  return {
    isConnected,
    reconnectAttempts,
    sendMessage,
    disconnect,
    reconnect: connect
  }
}

// Hook for Server-Sent Events (SSE)
export function useServerSentEvents(
  url: string | null,
  options: {
    enabled?: boolean
    onMessage?: (event: MessageEvent) => void
    onError?: (error: Event) => void
    onConnect?: () => void
    eventTypes?: string[]
  } = {}
) {
  const {
    enabled = true,
    onMessage,
    onError,
    onConnect,
    eventTypes = []
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!url || !enabled) return

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      onConnect?.()
    }

    eventSource.onerror = (event) => {
      setIsConnected(false)
      onError?.(event)
    }

    // Default message handler
    if (onMessage) {
      eventSource.onmessage = onMessage
    }

    // Custom event type handlers
    eventTypes.forEach(eventType => {
      eventSource.addEventListener(eventType, onMessage as EventListener)
    })

    return () => {
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [url, enabled, onMessage, onError, onConnect, eventTypes])

  return {
    isConnected,
    close: () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }
}