import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react'
import { usePostsStore } from '../store/posts'
import { useAuthStore } from '../store/auth'
import { formatDate, getInitials, cn } from '../lib/utils'
import PostCard from '../components/PostCard'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string
  }
  createdAt: string
  likes: number
  isLiked: boolean
}

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const { user } = useAuthStore()
  const { posts } = usePostsStore()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (postId) {
      // Find post in store or fetch from API
      const foundPost = posts.find(p => p.id === postId)
      if (foundPost) {
        setPost(foundPost)
        // Mock comments
        setComments([
          {
            id: '1',
            content: 'Great post! Thanks for sharing.',
            author: {
              id: '2',
              username: 'johndoe',
              displayName: 'John Doe',
              avatarUrl: undefined
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 5,
            isLiked: false
          },
          {
            id: '2',
            content: 'Interesting perspective. I agree with your points.',
            author: {
              id: '3',
              username: 'janesmith',
              displayName: 'Jane Smith',
              avatarUrl: undefined
            },
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            likes: 2,
            isLiked: true
          }
        ])
      }
      setIsLoading(false)
    }
  }, [postId, posts])

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center space-x-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Post</h1>
      </div>

      {/* Post */}
      <div className="border-b border-gray-200">
        <PostCard post={post} showActions={true} />
      </div>

      {/* Comment Form */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSubmitComment} className="flex space-x-3">
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {getInitials(user.displayName)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className={cn(
                    "px-4 py-2 rounded-full font-medium transition-colors",
                    newComment.trim()
                      ? "bg-primary text-white hover:bg-primary-600"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Comment
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                {comment.author.avatarUrl ? (
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {getInitials(comment.author.displayName)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">{comment.author.displayName}</h4>
                  <span className="text-gray-500">@{comment.author.username}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={cn(
                      "flex items-center space-x-1 text-sm transition-colors",
                      comment.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", comment.isLiked && "fill-current")} />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  )
}

export default PostDetail