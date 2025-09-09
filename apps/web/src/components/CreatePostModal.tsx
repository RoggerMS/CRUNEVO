import { useState, useRef } from 'react'
import { X, Image, Video, Smile, MapPin, Calendar } from 'lucide-react'
import { usePostsStore } from '../store/posts'
import { useAuthStore } from '../store/auth'
import { cn } from '../lib/utils'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

interface MediaFile {
  file: File
  url: string
  type: 'image' | 'video'
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { createPost } = usePostsStore()
  const { user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && mediaFiles.length === 0) return

    setIsSubmitting(true)
    try {
      const mediaData = mediaFiles.map(media => ({
        url: media.url,
        type: media.type
      }))

      await createPost({
        content: content.trim(),
        media: mediaData.length > 0 ? mediaData : undefined
      })

      // Reset form
      setContent('')
      setMediaFiles([])
      onClose()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      if (mediaFiles.length >= 4) return // Max 4 files
      
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      
      if (!isImage && !isVideo) return
      
      const url = URL.createObjectURL(file)
      const mediaFile: MediaFile = {
        file,
        url,
        type: isImage ? 'image' : 'video'
      }
      
      setMediaFiles(prev => [...prev, mediaFile])
    })
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].url)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleClose = () => {
    // Clean up object URLs
    mediaFiles.forEach(media => URL.revokeObjectURL(media.url))
    setContent('')
    setMediaFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Crear publicación</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {/* User info */}
            <div className="p-4">
              <div className="flex space-x-3">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt={user?.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-sm text-gray-500">@{user?.username}</div>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="px-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué está pasando?"
                className="w-full resize-none border-none outline-none text-lg placeholder-gray-500 min-h-[120px]"
                maxLength={500}
              />
            </div>

            {/* Media preview */}
            {mediaFiles.length > 0 && (
              <div className="px-4 pb-4">
                <div className={cn(
                  'grid gap-2 rounded-lg overflow-hidden',
                  mediaFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                )}>
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-32 object-cover rounded-lg"
                          muted
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            {/* Media options */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={mediaFiles.length >= 4}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    mediaFiles.length >= 4
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-primary hover:bg-primary/10'
                  )}
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Video className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {content.length}/500
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={(!content.trim() && mediaFiles.length === 0) || isSubmitting || content.length > 500}
                className={cn(
                  'btn-primary px-6 py-2',
                  ((!content.trim() && mediaFiles.length === 0) || isSubmitting || content.length > 500) && 
                  'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}