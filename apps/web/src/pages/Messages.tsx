import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Search, 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreHorizontal,
  ArrowLeft,
  Circle
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { formatDate, cn } from '../lib/utils'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  read: boolean
  type: 'text' | 'image' | 'file'
  mediaUrl?: string
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    username: string
    avatar: string
    isOnline: boolean
    lastSeen?: string
  }[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export default function Messages() {
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  const targetUser = searchParams.get('user')

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true)
      try {
        // Mock conversations data
        const mockConversations: Conversation[] = [
          {
            id: '1',
            participants: [
              {
                id: '2',
                name: 'Ana García',
                username: 'anagarcia',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
                isOnline: true
              },
              {
                id: user?.id || '1',
                name: user?.name || '',
                username: user?.username || '',
                avatar: user?.avatar || '',
                isOnline: true
              }
            ],
            lastMessage: {
              id: '1',
              content: '¡Hola! ¿Cómo estás?',
              senderId: '2',
              receiverId: user?.id || '1',
              createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              read: false,
              type: 'text'
            },
            unreadCount: 2,
            updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
          },
          {
            id: '2',
            participants: [
              {
                id: '3',
                name: 'Carlos López',
                username: 'carloslopez',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
                isOnline: false,
                lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
              },
              {
                id: user?.id || '1',
                name: user?.name || '',
                username: user?.username || '',
                avatar: user?.avatar || '',
                isOnline: true
              }
            ],
            lastMessage: {
              id: '2',
              content: 'Perfecto, nos vemos mañana',
              senderId: user?.id || '1',
              receiverId: '3',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              read: true,
              type: 'text'
            },
            unreadCount: 0,
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          }
        ]
        
        setConversations(mockConversations)
        
        // Auto-select conversation if user param is provided
        if (targetUser) {
          const targetConversation = mockConversations.find(conv => 
            conv.participants.some(p => p.username === targetUser)
          )
          if (targetConversation) {
            setSelectedConversation(targetConversation.id)
          }
        } else if (mockConversations.length > 0 && !isMobile) {
          setSelectedConversation(mockConversations[0].id)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [targetUser, user, isMobile])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      
      try {
        // Mock messages data
        const mockMessages: Message[] = [
          {
            id: '1',
            content: '¡Hola! ¿Cómo estás?',
            senderId: '2',
            receiverId: user?.id || '1',
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            read: true,
            type: 'text'
          },
          {
            id: '2',
            content: '¡Hola Ana! Todo bien, ¿y tú?',
            senderId: user?.id || '1',
            receiverId: '2',
            createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
            read: true,
            type: 'text'
          },
          {
            id: '3',
            content: 'Muy bien también. ¿Tienes planes para el fin de semana?',
            senderId: '2',
            receiverId: user?.id || '1',
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            read: false,
            type: 'text'
          }
        ]
        
        setMessages(mockMessages)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
  }, [selectedConversation, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: user?.id || '1',
      receiverId: '2', // This should be dynamic
      createdAt: new Date().toISOString(),
      read: false,
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
        : conv
    ))
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id)
  }

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv)
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const otherParticipant = selectedConv ? getOtherParticipant(selectedConv) : null

  const showConversationList = !isMobile || !selectedConversation
  const showChat = !isMobile || selectedConversation

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Conversations list */}
      {showConversationList && (
        <div className={cn(
          'border-r border-gray-200 flex flex-col',
          isMobile ? 'w-full' : 'w-80'
        )}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Mensajes</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversaciones"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => {
                  const participant = getOtherParticipant(conversation)
                  if (!participant) return null

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                        selectedConversation === conversation.id && 'bg-primary/5 border-r-2 border-primary'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="h-12 w-12 rounded-full"
                          />
                          {participant.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 truncate">
                              {participant.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conversation.lastMessage && formatDate(conversation.lastMessage.createdAt, 'HH:mm')}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage?.content || 'No hay mensajes'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conversaciones</h3>
                <p className="text-gray-600">Inicia una conversación enviando un mensaje.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat area */}
      {showChat && selectedConversation && otherParticipant ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <Link to={`/user/${otherParticipant.username}`}>
                <div className="relative">
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    className="h-10 w-10 rounded-full"
                  />
                  {otherParticipant.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
              </Link>
              <div>
                <Link 
                  to={`/user/${otherParticipant.username}`}
                  className="font-medium text-gray-900 hover:text-primary"
                >
                  {otherParticipant.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {otherParticipant.isOnline 
                    ? 'En línea' 
                    : `Visto ${formatDate(otherParticipant.lastSeen || '', 'HH:mm')}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="h-5 w-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                      isOwn
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      isOwn ? 'text-primary-light' : 'text-gray-500'
                    )}>
                      {formatDate(message.createdAt, 'HH:mm')}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-primary transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  newMessage.trim()
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      ) : showChat && !selectedConversation ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
            <p className="text-gray-600">Elige una conversación para empezar a chatear.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}