import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, MoreHorizontal, MessageCircle } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { usePostsStore } from '../store/posts'
import { formatDate, getInitials, cn } from '../lib/utils'
import PostCard from '../components/PostCard'

interface UserProfileData {
  id: string
  username: string
  displayName: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  isVerified: boolean
  createdAt: string
  location?: string
  website?: string
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean
}

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuthStore()
  const { posts } = usePostsStore()
  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts')
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    if (username) {
      // Mock user data - in real app, fetch from API
      const mockUser: UserProfileData = {
        id: '2',
        username: username,
        displayName: username === 'johndoe' ? 'John Doe' : 'Jane Smith',
        bio: 'Software developer passionate about technology and innovation. Building the future one line of code at a time.',
        avatarUrl: undefined,
        coverUrl: undefined,
        isVerified: username === 'johndoe',
        createdAt: '2023-01-15T00:00:00Z',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        followersCount: 1234,
        followingCount: 567,
        postsCount: 89,
        isFollowing: false
      }

      setProfileUser(mockUser)
      setIsFollowing(mockUser.isFollowing)

      // Filter posts by user
      const filteredPosts = posts.filter(post => post.author.username === username)
      setUserPosts(filteredPosts)
      
      setIsLoading(false)
    }
  }, [username, posts])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    if (profileUser) {
      setProfileUser({
        ...profileUser,
        followersCount: isFollowing 
          ? profileUser.followersCount - 1 
          : profileUser.followersCount + 1
      })
    }
  }

  const isOwnProfile = currentUser?.username === username

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  const filteredPosts = userPosts.filter(post => {
    switch (activeTab) {
      case 'posts':
        return true
      case 'replies':
        return post.isReply
      case 'media':
        return post.media && post.media.length > 0
      case 'likes':
        return post.isLiked
      default:
        return true
    }
  })

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center space-x-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{profileUser.displayName}</h1>
          <p className="text-sm text-gray-500">{profileUser.postsCount} posts</p>
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-primary to-primary-600">
        {profileUser.coverUrl && (
          <img
            src={profileUser.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="-mt-16">
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.displayName}
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-3xl font-bold">
                {getInitials(profileUser.displayName)}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {!isOwnProfile && (
              <>
                <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={handleFollow}
                  className={cn(
                    "px-6 py-2 rounded-full font-medium transition-colors",
                    isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-primary text-white hover:bg-primary-600"
                  )}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </>
            )}
            {isOwnProfile && (
              <Link
                to="/settings"
                className="px-6 py-2 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Edit profile
              </Link>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-xl font-bold">{profileUser.displayName}</h2>
            {profileUser.isVerified && (
              <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <p className="text-gray-500 mb-2">@{profileUser.username}</p>
          {profileUser.bio && (
            <p className="text-gray-700 mb-3">{profileUser.bio}</p>
          )}
          <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 mb-3">
            {profileUser.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <div className="flex items-center space-x-1">
                <LinkIcon className="h-4 w-4" />
                <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {profileUser.website.replace('https://', '')}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {formatDate(profileUser.createdAt)}</span>
            </div>
          </div>
          <div className="flex space-x-4 text-sm">
            <span>
              <span className="font-semibold text-gray-900">{profileUser.followingCount}</span>
              <span className="text-gray-500 ml-1">Following</span>
            </span>
            <span>
              <span className="font-semibold text-gray-900">{profileUser.followersCount}</span>
              <span className="text-gray-500 ml-1">Followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { key: 'posts', label: 'Posts' },
            { key: 'replies', label: 'Replies' },
            { key: 'media', label: 'Media' },
            { key: 'likes', label: 'Likes' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex-1 py-4 text-center font-medium transition-colors relative",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Posts */}
      <div className="divide-y divide-gray-200">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No posts found in this section.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile