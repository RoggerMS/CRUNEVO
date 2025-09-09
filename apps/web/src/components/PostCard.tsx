import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react'
import { usePostsStore } from '../store/posts'
import { useAuthStore } from '../store/auth'
import { formatDate, formatNumber } from '../lib/utils'
import { cn } from '../lib/utils'
import type { Post } from '../store/posts'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const { likePost, addComment, isLoading } = usePostsStore()
  const { user } = useAuthStore()

  const isLiked = post.likes?.some(like => like.userId === user?.id) || false
  const likesCount = post.likes?.length || 0
  const commentsCount = post.comments?.length || 0

  const handleLike = async () => {
    try {
      await likePost(post.id)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim()) return

    try {
      await addComment(post.id, newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleComment()
    }
  }

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  const shouldTruncateContent = post.content.length > 280
  const displayContent = shouldTruncateContent && !showFullContent 
    ? post.content.slice(0, 280) + '...' 
    : post.content

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Post header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/user/${post.author.username}`}>
              <img
                src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
                alt={post.author.name}
                className="h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
              />
            </Link>
            <div>
              <Link 
                to={`/user/${post.author.username}`}
                className="font-semibold text-gray-900 hover:text-primary transition-colors"
              >
                {post.author.name}
              </Link>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <span>@{post.author.username}</span>
                <span>·</span>
                <time dateTime={post.createdAt}>
                  {formatDate(post.createdAt)}
                </time>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Post content */}
        <div className="mt-3">
          <p className="text-gray-900 whitespace-pre-wrap">
            {displayContent}
            {shouldTruncateContent && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-primary hover:text-primary-dark ml-1 font-medium"
              >
                {showFullContent ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Post media */}
      {post.media && post.media.length > 0 && (
        <div className="relative">
          {post.media.length === 1 ? (
            <div className="relative">
              {post.media[0].type === 'image' ? (
                <img
                  src={post.media[0].url}
                  alt="Post media"
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <div className="relative">
                  <video
                    src={post.media[0].url}
                    className="w-full max-h-96 object-cover"
                    controls={isVideoPlaying}
                    muted
                    loop
                  />
                  {!isVideoPlaying && (
                    <button
                      onClick={toggleVideo}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                    >
                      <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
                        <Play className="h-6 w-6 text-gray-900 ml-1" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.media.slice(0, 4).map((media, index) => (
                <div key={index} className="relative aspect-square">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  {index === 3 && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{post.media.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post actions */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={cn(
                'flex items-center space-x-2 transition-colors',
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
              <span className="text-sm font-medium">
                {formatNumber(likesCount)}
              </span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {formatNumber(commentsCount)}
              </span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share className="h-5 w-5" />
              <span className="text-sm font-medium">Compartir</span>
            </button>
          </div>
          
          <button className="text-gray-500 hover:text-primary transition-colors">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 space-y-4">
            {/* Add comment */}
            <div className="flex space-x-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt={user?.name}
                className="h-8 w-8 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un comentario..."
                  className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim() || isLoading}
                    className={cn(
                      'btn-primary text-sm py-1 px-3',
                      (!newComment.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Link to={`/user/${comment.author.username}`}>
                    <img
                      src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.id}`}
                      alt={comment.author.name}
                      className="h-8 w-8 rounded-full"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <Link 
                          to={`/user/${comment.author.username}`}
                          className="font-medium text-sm text-gray-900 hover:text-primary"
                        >
                          {comment.author.name}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 ml-3">
                      <button className="text-xs text-gray-500 hover:text-red-500">
                        Me gusta
                      </button>
                      <button className="text-xs text-gray-500 hover:text-primary">
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}