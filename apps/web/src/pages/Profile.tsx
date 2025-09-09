import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  MoreHorizontal,
  UserPlus,
  UserMinus,
  MessageCircle,
  Settings
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { usePostsStore } from '../store/posts'
import { formatDate, formatNumber } from '../lib/utils'
import { cn } from '../lib/utils'
import PostCard from '../components/PostCard'
import type { User } from '../store/auth'

interface ProfileUser extends User {
  bio?: string
  location?: string
  website?: string
  joinedAt: string
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing?: boolean
}

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts')
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const { user: currentUser } = useAuthStore()
  const { posts, fetchUserPosts, isLoading: postsLoading } = usePostsStore()

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return
      
      setIsLoading(true)
      try {
        // Mock profile data - replace with actual API call
        const mockProfile: ProfileUser = {
          id: username === currentUser?.username ? currentUser.id : '2',
          username: username,
          name: username === 'johndoe' ? 'John Doe' : 'Jane Smith',
          email: `${username}@example.com`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          bio: 'Desarrollador Full Stack apasionado por la tecnología y la innovación. Me encanta crear soluciones que impacten positivamente en la vida de las personas.',
          location: 'Madrid, España',
          website: 'https://johndoe.dev',
          joinedAt: '2023-01-15T00:00:00Z',
          followersCount: 1234,
          followingCount: 567,
          postsCount: 89,
          isFollowing: Math.random() > 0.5
        }
        
        setProfileUser(mockProfile)
        setIsFollowing(mockProfile.isFollowing || false)
        
        // Fetch user posts
        await fetchUserPosts(mockProfile.id)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [username, currentUser, fetchUserPosts])

  const handleFollow = async () => {
    if (!profileUser) return
    
    try {
      // Mock follow/unfollow - replace with actual API call
      setIsFollowing(!isFollowing)
      setProfileUser(prev => prev ? {
        ...prev,
        followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      } : null)
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    }
  }

  const filteredPosts = posts.filter(post => {
    switch (activeTab) {
      case 'posts':
        return post.author.id === profileUser?.id
      case 'replies':
        return post.author.id === profileUser?.id && post.parentId
      case 'media':
        return post.author.id === profileUser?.id && post.media && post.media.length > 0
      case 'likes':
        return post.likes?.some(like => like.userId === profileUser?.id)
      default:
        return false
    }
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
        <p className="text-gray-600">El usuario que buscas no existe o ha sido eliminado.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Cover photo */}
        <div className="h-48 bg-gradient-to-r from-primary to-primary-dark"></div>
        
        {/* Profile info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="h-20 w-20 rounded-full border-4 border-white -mt-12 bg-white"
              />
              <div className="mt-2">
                <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
                <p className="text-gray-600">@{profileUser.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              {isOwnProfile ? (
                <Link
                  to="/settings"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Editar perfil</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={cn(
                      'btn flex items-center space-x-2',
                      isFollowing ? 'btn-secondary' : 'btn-primary'
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        <span>Dejar de seguir</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                  <Link
                    to={`/messages?user=${profileUser.username}`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Mensaje</span>
                  </Link>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {profileUser.bio && (
            <p className="text-gray-900 mb-4">{profileUser.bio}</p>
          )}
          
          {/* Profile details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {profileUser.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center space-x-1">
                <LinkIcon className="h-4 w-4" />
                <a 
                  href={profileUser.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profileUser.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Se unió en {formatDate(profileUser.joinedAt, 'MMMM yyyy')}</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="font-bold text-gray-900">{formatNumber(profileUser.followingCount)}</span>
              <span className="text-gray-600 ml-1">Siguiendo</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">{formatNumber(profileUser.followersCount)}</span>
              <span className="text-gray-600 ml-1">Seguidores</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">{formatNumber(profileUser.postsCount)}</span>
              <span className="text-gray-600 ml-1">Publicaciones</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'posts', label: 'Publicaciones' },
              { key: 'replies', label: 'Respuestas' },
              { key: 'media', label: 'Multimedia' },
              { key: 'likes', label: 'Me gusta' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'flex-1 py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="divide-y divide-gray-200">
          {postsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando publicaciones...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-0">
              {filteredPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 last:border-b-0">
                  <div className="p-4">
                    <PostCard post={post} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'posts' && 'No hay publicaciones aún'}
                {activeTab === 'replies' && 'No hay respuestas aún'}
                {activeTab === 'media' && 'No hay contenido multimedia'}
                {activeTab === 'likes' && 'No hay publicaciones que le gusten'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'posts' && isOwnProfile && 'Cuando publiques algo, aparecerá aquí.'}
                {activeTab === 'posts' && !isOwnProfile && `${profileUser.name} no ha publicado nada aún.`}
                {activeTab === 'replies' && 'Las respuestas aparecerán aquí.'}
                {activeTab === 'media' && 'Las fotos y videos aparecerán aquí.'}
                {activeTab === 'likes' && 'Los me gusta aparecerán aquí.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}