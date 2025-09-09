import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/auth'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    const token = useAuthStore.getState().token
    
    if (!token) {
      console.warn('No auth token available for socket connection')
      return
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4001', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.handleReconnect()
    })

    // Auth events
    this.socket.on('auth_error', () => {
      console.error('Socket authentication failed')
      useAuthStore.getState().logout()
      this.disconnect()
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, 1000 * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Message events
  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback)
  }

  offNewMessage(callback: (message: any) => void) {
    this.socket?.off('new_message', callback)
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId)
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId)
  }

  sendMessage(conversationId: string, content: string) {
    this.socket?.emit('send_message', {
      conversationId,
      content,
    })
  }

  // Typing indicators
  startTyping(conversationId: string) {
    this.socket?.emit('typing_start', conversationId)
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing_stop', conversationId)
  }

  onTypingStart(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.on('typing_start', callback)
  }

  onTypingStop(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.on('typing_stop', callback)
  }

  offTypingStart(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.off('typing_start', callback)
  }

  offTypingStop(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.off('typing_stop', callback)
  }

  // Post events
  onNewPost(callback: (post: any) => void) {
    this.socket?.on('new_post', callback)
  }

  offNewPost(callback: (post: any) => void) {
    this.socket?.off('new_post', callback)
  }

  onPostLiked(callback: (data: { postId: string; likesCount: number }) => void) {
    this.socket?.on('post_liked', callback)
  }

  offPostLiked(callback: (data: { postId: string; likesCount: number }) => void) {
    this.socket?.off('post_liked', callback)
  }

  onNewComment(callback: (data: { postId: string; comment: any }) => void) {
    this.socket?.on('new_comment', callback)
  }

  offNewComment(callback: (data: { postId: string; comment: any }) => void) {
    this.socket?.off('new_comment', callback)
  }

  // Notification events
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback)
  }

  offNotification(callback: (notification: any) => void) {
    this.socket?.off('notification', callback)
  }

  // User status events
  onUserOnline(callback: (userId: string) => void) {
    this.socket?.on('user_online', callback)
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket?.on('user_offline', callback)
  }

  offUserOnline(callback: (userId: string) => void) {
    this.socket?.off('user_online', callback)
  }

  offUserOffline(callback: (userId: string) => void) {
    this.socket?.off('user_offline', callback)
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

export const socketService = new SocketService()
export default socketService