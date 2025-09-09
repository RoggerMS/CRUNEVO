import { create } from 'zustand'

export interface Post {
  id: string
  userId: string
  content: string
  mediaUrls: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string
    isVerified: boolean
  }
  isLiked?: boolean
}

export interface Comment {
  id: string
  postId: string
  userId: string
  parentId?: string
  content: string
  likesCount: number
  createdAt: string
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string
    isVerified: boolean
  }
  isLiked?: boolean
  replies?: Comment[]
}

interface PostsState {
  posts: Post[]
  comments: { [postId: string]: Comment[] }
  isLoading: boolean
  hasMore: boolean
  
  // Actions
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (postId: string, updates: Partial<Post>) => void
  removePost: (postId: string) => void
  toggleLike: (postId: string) => void
  
  setComments: (postId: string, comments: Comment[]) => void
  addComment: (postId: string, comment: Comment) => void
  toggleCommentLike: (postId: string, commentId: string) => void
  
  setLoading: (loading: boolean) => void
  setHasMore: (hasMore: boolean) => void
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  comments: {},
  isLoading: false,
  hasMore: true,
  
  setPosts: (posts: Post[]) => {
    set({ posts })
  },
  
  addPost: (post: Post) => {
    set((state) => ({ posts: [post, ...state.posts] }))
  },
  
  updatePost: (postId: string, updates: Partial<Post>) => {
    set((state) => ({
      posts: state.posts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    }))
  },
  
  removePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter(post => post.id !== postId)
    }))
  },
  
  toggleLike: (postId: string) => {
    set((state) => ({
      posts: state.posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.isLiked
          return {
            ...post,
            isLiked: !isLiked,
            likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        }
        return post
      })
    }))
  },
  
  setComments: (postId: string, comments: Comment[]) => {
    set((state) => ({
      comments: { ...state.comments, [postId]: comments }
    }))
  },
  
  addComment: (postId: string, comment: Comment) => {
    set((state) => {
      const existingComments = state.comments[postId] || []
      return {
        comments: {
          ...state.comments,
          [postId]: [comment, ...existingComments]
        },
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        )
      }
    })
  },
  
  toggleCommentLike: (postId: string, commentId: string) => {
    set((state) => {
      const comments = state.comments[postId] || []
      return {
        comments: {
          ...state.comments,
          [postId]: comments.map(comment => {
            if (comment.id === commentId) {
              const isLiked = comment.isLiked
              return {
                ...comment,
                isLiked: !isLiked,
                likesCount: isLiked ? comment.likesCount - 1 : comment.likesCount + 1
              }
            }
            return comment
          })
        }
      }
    })
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  setHasMore: (hasMore: boolean) => {
    set({ hasMore })
  },
}))