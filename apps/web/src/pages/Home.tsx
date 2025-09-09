import { useEffect, useState } from 'react'
import { Plus, Image, Video, Smile } from 'lucide-react'
import { usePostsStore } from '../store/posts'
import { useAuthStore } from '../store/auth'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import { cn } from '../lib/utils'

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const { posts, isLoading, fetchPosts, createPost } = usePostsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleQuickPost = async () => {
    if (!newPostContent.trim()) return

    try {
      await createPost({
        content: newPostContent.trim(),
        media: []
      })
      setNewPostContent('')
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleQuickPost()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quick post composer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            alt={user?.name}
            className="h-10 w-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="¿Qué está pasando?"
              className="w-full resize-none border-none focus:ring-0 text-lg placeholder-gray-500"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-full transition-colors"
                >
                  <Image className="h-5 w-5" />
                  <span className="text-sm font-medium">Foto</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-full transition-colors"
                >
                  <Video className="h-5 w-5" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-full transition-colors"
                >
                  <Smile className="h-5 w-5" />
                  <span className="text-sm font-medium">Emoji</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-secondary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Más opciones
                </button>
                <button
                  onClick={handleQuickPost}
                  disabled={!newPostContent.trim()}
                  className={cn(
                    'btn-primary',
                    !newPostContent.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories/Highlights section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Historias</h3>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {/* Add story */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition-transform">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs text-gray-600">Tu historia</p>
          </div>
          
          {/* Mock stories */}
          {[1, 2, 3, 4, 5].map((story) => (
            <div key={story} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full p-0.5 cursor-pointer hover:scale-105 transition-transform">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=story${story}`}
                  alt={`Historia ${story}`}
                  className="w-full h-full rounded-full bg-white p-0.5"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">Usuario {story}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Posts feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="mt-4 h-48 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Bienvenido a CRUNEVO!
            </h3>
            <p className="text-gray-600 mb-4">
              No hay publicaciones aún. ¡Sé el primero en compartir algo increíble!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Crear tu primera publicación
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Load more button */}
      {posts.length > 0 && (
        <div className="text-center py-4">
          <button className="btn-secondary">
            Cargar más publicaciones
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}