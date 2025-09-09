import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '../store/auth'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password })
    return response.data
  }

  async register(userData: {
    email: string
    username: string
    password: string
    displayName: string
  }) {
    const response = await this.api.post('/auth/register', userData)
    return response.data
  }

  async logout() {
    const response = await this.api.post('/auth/logout')
    return response.data
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh')
    return response.data
  }

  // User endpoints
  async getProfile(userId?: string) {
    const endpoint = userId ? `/users/${userId}` : '/users/me'
    const response = await this.api.get(endpoint)
    return response.data
  }

  async updateProfile(userData: any) {
    const response = await this.api.put('/users/me', userData)
    return response.data
  }

  async followUser(userId: string) {
    const response = await this.api.post(`/users/${userId}/follow`)
    return response.data
  }

  async unfollowUser(userId: string) {
    const response = await this.api.delete(`/users/${userId}/follow`)
    return response.data
  }

  async getFollowers(userId: string) {
    const response = await this.api.get(`/users/${userId}/followers`)
    return response.data
  }

  async getFollowing(userId: string) {
    const response = await this.api.get(`/users/${userId}/following`)
    return response.data
  }

  // Posts endpoints
  async getFeed(page = 1, limit = 20) {
    const response = await this.api.get(`/posts/feed?page=${page}&limit=${limit}`)
    return response.data
  }

  async getUserPosts(userId: string, page = 1, limit = 20) {
    const response = await this.api.get(`/users/${userId}/posts?page=${page}&limit=${limit}`)
    return response.data
  }

  async getPost(postId: string) {
    const response = await this.api.get(`/posts/${postId}`)
    return response.data
  }

  async createPost(postData: {
    content: string
    mediaUrls?: string[]
    isPublic?: boolean
  }) {
    const response = await this.api.post('/posts', postData)
    return response.data
  }

  async updatePost(postId: string, postData: any) {
    const response = await this.api.put(`/posts/${postId}`, postData)
    return response.data
  }

  async deletePost(postId: string) {
    const response = await this.api.delete(`/posts/${postId}`)
    return response.data
  }

  async likePost(postId: string) {
    const response = await this.api.post(`/posts/${postId}/like`)
    return response.data
  }

  async unlikePost(postId: string) {
    const response = await this.api.delete(`/posts/${postId}/like`)
    return response.data
  }

  // Comments endpoints
  async getComments(postId: string) {
    const response = await this.api.get(`/posts/${postId}/comments`)
    return response.data
  }

  async createComment(postId: string, content: string, parentId?: string) {
    const response = await this.api.post(`/posts/${postId}/comments`, {
      content,
      parentId,
    })
    return response.data
  }

  async deleteComment(commentId: string) {
    const response = await this.api.delete(`/comments/${commentId}`)
    return response.data
  }

  async likeComment(commentId: string) {
    const response = await this.api.post(`/comments/${commentId}/like`)
    return response.data
  }

  async unlikeComment(commentId: string) {
    const response = await this.api.delete(`/comments/${commentId}/like`)
    return response.data
  }

  // Search endpoints
  async searchUsers(query: string) {
    const response = await this.api.get(`/search/users?q=${encodeURIComponent(query)}`)
    return response.data
  }

  async searchPosts(query: string) {
    const response = await this.api.get(`/search/posts?q=${encodeURIComponent(query)}`)
    return response.data
  }

  async getTrending() {
    const response = await this.api.get('/trending')
    return response.data
  }

  // Messages endpoints
  async getConversations() {
    const response = await this.api.get('/conversations')
    return response.data
  }

  async getConversation(conversationId: string) {
    const response = await this.api.get(`/conversations/${conversationId}`)
    return response.data
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    const response = await this.api.get(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`)
    return response.data
  }

  async sendMessage(conversationId: string, content: string) {
    const response = await this.api.post(`/conversations/${conversationId}/messages`, {
      content,
    })
    return response.data
  }

  async createConversation(participantIds: string[], name?: string) {
    const response = await this.api.post('/conversations', {
      participantIds,
      name,
    })
    return response.data
  }

  // File upload
  async uploadFile(file: File, type: 'avatar' | 'cover' | 'post') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService