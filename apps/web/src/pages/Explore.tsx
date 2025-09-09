import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  TrendingUp, 
  Users, 
  Hash, 
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { usePostsStore } from '../store/posts'
import { formatNumber, cn } from '../lib/utils'
import PostCard from '../components/PostCard'
import type { Post } from '../store/posts'

interface TrendingTopic {
  id: string
  hashtag: string
  postsCount: number
  category: string
}

interface SuggestedUser {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followersCount: number
  isFollowing: boolean
}

interface TrendingEvent {
  id: string
  title: string
  description: string
  location: string
  date: string
  attendeesCount: number
  imageUrl: string
}

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'trending' | 'users' | 'topics' | 'events'>('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [trendingEvents, setTrendingEvents] = useState<TrendingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { posts, fetchTrendingPosts, isLoading: postsLoading } = usePostsStore()

  useEffect(() => {
    const fetchExploreData = async () => {
      setIsLoading(true)
      try {
        // Mock trending topics
        const mockTopics: TrendingTopic[] = [
          {
            id: '1',
            hashtag: 'TecnologíaEspaña',
            postsCount: 15420,
            category: 'Tecnología'
          },
          {
            id: '2',
            hashtag: 'DesarrolloWeb',
            postsCount: 8930,
            category: 'Programación'
          },
          {
            id: '3',
            hashtag: 'StartupMadrid',
            postsCount: 5670,
            category: 'Negocios'
          },
          {
            id: '4',
            hashtag: 'ReactJS',
            postsCount: 12340,
            category: 'Programación'
          },
          {
            id: '5',
            hashtag: 'InnovaciónDigital',
            postsCount: 7890,
            category: 'Tecnología'
          }
        ]

        // Mock suggested users
        const mockUsers: SuggestedUser[] = [
          {
            id: '2',
            name: 'María González',
            username: 'mariagonzalez',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
            bio: 'Frontend Developer especializada en React y TypeScript. Apasionada por el diseño UX/UI.',
            followersCount: 2340,
            isFollowing: false
          },
          {
            id: '3',
            name: 'David Martín',
            username: 'davidmartin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
            bio: 'Full Stack Developer y mentor. Creador de contenido sobre programación y tecnología.',
            followersCount: 5670,
            isFollowing: false
          },
          {
            id: '4',
            name: 'Laura Sánchez',
            username: 'laurasanchez',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura',
            bio: 'Product Manager en startup tecnológica. Experta en metodologías ágiles y gestión de equipos.',
            followersCount: 1890,
            isFollowing: true
          }
        ]

        // Mock trending events
        const mockEvents: TrendingEvent[] = [
          {
            id: '1',
            title: 'Madrid Tech Summit 2024',
            description: 'El evento tecnológico más importante del año en Madrid. Conferencias, networking y workshops.',
            location: 'Madrid, España',
            date: '2024-03-15T09:00:00Z',
            attendeesCount: 1200,
            imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20conference%20madrid%20modern%20venue%20people%20networking&image_size=landscape_4_3'
          },
          {
            id: '2',
            title: 'React Barcelona Meetup',
            description: 'Meetup mensual de la comunidad React en Barcelona. Charlas técnicas y networking.',
            location: 'Barcelona, España',
            date: '2024-02-20T18:30:00Z',
            attendeesCount: 150,
            imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=react%20meetup%20barcelona%20developers%20coding%20presentation&image_size=landscape_4_3'
          },
          {
            id: '3',
            title: 'Startup Weekend Valencia',
            description: '54 horas para crear una startup desde cero. Mentores, inversores y mucha innovación.',
            location: 'Valencia, España',
            date: '2024-02-25T17:00:00Z',
            attendeesCount: 80,
            imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=startup%20weekend%20valencia%20entrepreneurs%20innovation%20workspace&image_size=landscape_4_3'
          }
        ]

        setTrendingTopics(mockTopics)
        setSuggestedUsers(mockUsers)
        setTrendingEvents(mockEvents)
        
        // Fetch trending posts
        await fetchTrendingPosts()
      } catch (error) {
        console.error('Error fetching explore data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExploreData()
  }, [fetchTrendingPosts])

  const handleFollowUser = async (userId: string) => {
    try {
      setSuggestedUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              followersCount: user.isFollowing ? user.followersCount - 1 : user.followersCount + 1
            }
          : user
      ))
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    }
  }

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = suggestedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTopics = trendingTopics.filter(topic =>
    topic.hashtag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEvents = trendingEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar publicaciones, usuarios, temas..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          />
        </div>

        {/* Tabs */}
        <nav className="flex space-x-8">
          {[
            { key: 'trending', label: 'Tendencias', icon: TrendingUp },
            { key: 'users', label: 'Usuarios', icon: Users },
            { key: 'topics', label: 'Temas', icon: Hash },
            { key: 'events', label: 'Eventos', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  'flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'trending' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Publicaciones en tendencia</h2>
              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.slice(0, 10).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron publicaciones</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Usuarios sugeridos</h2>
              {filteredUsers.length > 0 ? (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Link to={`/user/${user.username}`}>
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-12 w-12 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link 
                              to={`/user/${user.username}`}
                              className="font-semibold text-gray-900 hover:text-primary transition-colors"
                            >
                              {user.name}
                            </Link>
                            <p className="text-gray-600">@{user.username}</p>
                            <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {formatNumber(user.followersCount)} seguidores
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFollowUser(user.id)}
                          className={cn(
                            'btn text-sm px-4 py-2',
                            user.isFollowing ? 'btn-secondary' : 'btn-primary'
                          )}
                        >
                          {user.isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Temas en tendencia</h2>
              {filteredTopics.length > 0 ? (
                <div className="grid gap-4">
                  {filteredTopics.map((topic, index) => (
                    <div key={topic.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded-full">
                            <span className="text-primary font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <Link 
                              to={`/search?q=%23${topic.hashtag}`}
                              className="font-semibold text-gray-900 hover:text-primary transition-colors"
                            >
                              #{topic.hashtag}
                            </Link>
                            <p className="text-sm text-gray-600">{topic.category}</p>
                            <p className="text-sm text-gray-500">
                              {formatNumber(topic.postsCount)} publicaciones
                            </p>
                          </div>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron temas</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Eventos destacados</h2>
              {filteredEvents.length > 0 ? (
                <div className="grid gap-6">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                            <p className="text-gray-600 mb-4">{event.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(event.date).toLocaleDateString('es-ES')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{formatNumber(event.attendeesCount)} asistentes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <button className="btn-primary flex items-center space-x-2">
                            <span>Más información</span>
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button className="btn-secondary">
                            Interesado
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas rápidas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Temas trending</span>
                <span className="font-semibold text-gray-900">{trendingTopics.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Usuarios sugeridos</span>
                <span className="font-semibold text-gray-900">{suggestedUsers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Eventos activos</span>
                <span className="font-semibold text-gray-900">{trendingEvents.length}</span>
              </div>
            </div>
          </div>

          {/* Top trending topics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Trending</h3>
            <div className="space-y-3">
              {trendingTopics.slice(0, 5).map((topic, index) => (
                <Link
                  key={topic.id}
                  to={`/search?q=%23${topic.hashtag}`}
                  className="block hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">#{topic.hashtag}</p>
                      <p className="text-sm text-gray-500">{formatNumber(topic.postsCount)} posts</p>
                    </div>
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}