import { useState, useEffect } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  Camera,
  Trash2,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { cn, validateEmail, validatePassword } from '../lib/utils'

interface SettingsSection {
  id: string
  title: string
  icon: any
  description: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  likes: boolean
  comments: boolean
  follows: boolean
  messages: boolean
  mentions: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showPhone: boolean
  allowMessages: 'everyone' | 'followers' | 'none'
  allowTags: boolean
  showOnlineStatus: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en' | 'fr'
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
}

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore()
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: '',
    website: '',
    phone: ''
  })

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Settings states
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: 'everyone',
    allowTags: true,
    showOnlineStatus: true
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'es',
    fontSize: 'medium',
    reducedMotion: false
  })

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: User,
      description: 'Gestiona tu información personal y perfil público'
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: Bell,
      description: 'Configura cómo y cuándo recibir notificaciones'
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: Shield,
      description: 'Controla quién puede ver tu información y contenido'
    },
    {
      id: 'appearance',
      title: 'Apariencia',
      icon: Palette,
      description: 'Personaliza el tema y la apariencia de la aplicación'
    },
    {
      id: 'account',
      title: 'Cuenta',
      icon: Lock,
      description: 'Gestiona tu cuenta, contraseña y configuración de seguridad'
    }
  ]

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Validate email
      if (!validateEmail(profileForm.email)) {
        throw new Error('Email inválido')
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user in store
      updateUser({
        name: profileForm.name,
        username: profileForm.username,
        email: profileForm.email,
        bio: profileForm.bio
      })

      alert('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate passwords
      if (!validatePassword(passwordForm.newPassword)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordChange(false)
      alert('Contraseña cambiada correctamente')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error al cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setIsLoading(true)
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      logout()
      alert('Cuenta eliminada correctamente')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error al eliminar la cuenta')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleExportData = async () => {
    try {
      setIsLoading(true)
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create mock data export
      const data = {
        user: user,
        posts: [],
        messages: [],
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crunevo-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Datos exportados correctamente')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error al exportar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 border-r border-gray-200">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                        activeSection === section.id
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="p-6">
              {/* Profile Settings */}
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Información del perfil</h2>
                    <p className="text-gray-600">Actualiza tu información personal y perfil público.</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img
                          src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                          alt="Avatar"
                          className="h-20 w-20 rounded-full"
                        />
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Foto de perfil</h3>
                        <p className="text-sm text-gray-600">Sube una nueva foto de perfil</p>
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de usuario
                        </label>
                        <input
                          type="text"
                          value={profileForm.username}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ubicación
                        </label>
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                          className="input"
                          placeholder="Madrid, España"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sitio web
                        </label>
                        <input
                          type="url"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                          className="input"
                          placeholder="https://ejemplo.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biografía
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="input"
                        rows={4}
                        maxLength={160}
                        placeholder="Cuéntanos sobre ti..."
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {profileForm.bio.length}/160 caracteres
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{isLoading ? 'Guardando...' : 'Guardar cambios'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Notificaciones</h2>
                    <p className="text-gray-600">Configura cómo y cuándo recibir notificaciones.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Email notifications */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones por email</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Activar notificaciones por email</p>
                            <p className="text-sm text-gray-600">Recibe notificaciones importantes en tu email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.email}
                              onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Push notifications */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones push</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'push', label: 'Activar notificaciones push', desc: 'Recibe notificaciones en tiempo real' },
                          { key: 'likes', label: 'Me gusta', desc: 'Cuando alguien le da me gusta a tu publicación' },
                          { key: 'comments', label: 'Comentarios', desc: 'Cuando alguien comenta en tus publicaciones' },
                          { key: 'follows', label: 'Nuevos seguidores', desc: 'Cuando alguien te empiece a seguir' },
                          { key: 'messages', label: 'Mensajes', desc: 'Cuando recibas un nuevo mensaje' },
                          { key: 'mentions', label: 'Menciones', desc: 'Cuando alguien te mencione en una publicación' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications[item.key as keyof NotificationSettings]}
                                onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacidad y seguridad</h2>
                    <p className="text-gray-600">Controla quién puede ver tu información y contenido.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Profile visibility */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Visibilidad del perfil</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Público', desc: 'Cualquiera puede ver tu perfil' },
                          { value: 'private', label: 'Privado', desc: 'Solo tus seguidores pueden ver tu perfil' },
                          { value: 'friends', label: 'Amigos', desc: 'Solo tus amigos pueden ver tu perfil' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={privacy.profileVisibility === option.value}
                              onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-sm text-gray-600">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Contact information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Información de contacto</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'showEmail', label: 'Mostrar email en perfil', desc: 'Otros usuarios podrán ver tu email' },
                          { key: 'showPhone', label: 'Mostrar teléfono en perfil', desc: 'Otros usuarios podrán ver tu teléfono' },
                          { key: 'allowTags', label: 'Permitir etiquetas', desc: 'Otros usuarios pueden etiquetarte en publicaciones' },
                          { key: 'showOnlineStatus', label: 'Mostrar estado en línea', desc: 'Otros usuarios verán cuando estés conectado' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacy[item.key as keyof PrivacySettings] as boolean}
                                onChange={(e) => setPrivacy(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Mensajes</h3>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 mb-3">¿Quién puede enviarte mensajes directos?</p>
                        {[
                          { value: 'everyone', label: 'Cualquiera', desc: 'Todos los usuarios pueden enviarte mensajes' },
                          { value: 'followers', label: 'Solo seguidores', desc: 'Solo tus seguidores pueden enviarte mensajes' },
                          { value: 'none', label: 'Nadie', desc: 'Desactivar mensajes directos' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="allowMessages"
                              value={option.value}
                              checked={privacy.allowMessages === option.value}
                              onChange={(e) => setPrivacy(prev => ({ ...prev, allowMessages: e.target.value as any }))}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-sm text-gray-600">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Apariencia</h2>
                    <p className="text-gray-600">Personaliza el tema y la apariencia de la aplicación.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Tema</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Claro', desc: 'Tema claro para uso diurno' },
                          { value: 'dark', label: 'Oscuro', desc: 'Tema oscuro para uso nocturno' },
                          { value: 'system', label: 'Sistema', desc: 'Sigue la configuración del sistema' }
                        ].map((theme) => (
                          <label key={theme.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value={theme.value}
                              checked={appearance.theme === theme.value}
                              onChange={(e) => setAppearance(prev => ({ ...prev, theme: e.target.value as any }))}
                              className="sr-only peer"
                            />
                            <div className="border-2 border-gray-200 rounded-lg p-4 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                              <div className="text-center">
                                <div className={cn(
                                  'w-16 h-12 mx-auto mb-3 rounded border-2',
                                  theme.value === 'light' && 'bg-white border-gray-300',
                                  theme.value === 'dark' && 'bg-gray-900 border-gray-700',
                                  theme.value === 'system' && 'bg-gradient-to-r from-white to-gray-900 border-gray-400'
                                )}></div>
                                <p className="font-medium text-gray-900">{theme.label}</p>
                                <p className="text-sm text-gray-600">{theme.desc}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Idioma</h3>
                      <select
                        value={appearance.language}
                        onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value as any }))}
                        className="input max-w-xs"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    {/* Font size */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Tamaño de fuente</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'small', label: 'Pequeña', example: 'Texto de ejemplo pequeño' },
                          { value: 'medium', label: 'Mediana', example: 'Texto de ejemplo mediano' },
                          { value: 'large', label: 'Grande', example: 'Texto de ejemplo grande' }
                        ].map((size) => (
                          <label key={size.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="fontSize"
                              value={size.value}
                              checked={appearance.fontSize === size.value}
                              onChange={(e) => setAppearance(prev => ({ ...prev, fontSize: e.target.value as any }))}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{size.label}</p>
                              <p className={cn(
                                'text-gray-600',
                                size.value === 'small' && 'text-sm',
                                size.value === 'medium' && 'text-base',
                                size.value === 'large' && 'text-lg'
                              )}>{size.example}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Accessibility */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Accesibilidad</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Reducir movimiento</p>
                          <p className="text-sm text-gray-600">Reduce las animaciones y transiciones</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appearance.reducedMotion}
                            onChange={(e) => setAppearance(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuración de cuenta</h2>
                    <p className="text-gray-600">Gestiona tu cuenta, contraseña y configuración de seguridad.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Change password */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Cambiar contraseña</h3>
                          <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente para mayor seguridad</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                          className="btn-secondary"
                        >
                          {showPasswordChange ? 'Cancelar' : 'Cambiar'}
                        </button>
                      </div>

                      {showPasswordChange && (
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contraseña actual
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="input pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nueva contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="input pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirmar nueva contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="input pr-12"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowPasswordChange(false)}
                              className="btn-secondary"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="btn-primary"
                            >
                              {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Data export */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Exportar datos</h3>
                          <p className="text-sm text-gray-600">Descarga una copia de todos tus datos</p>
                        </div>
                        <button
                          onClick={handleExportData}
                          disabled={isLoading}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>{isLoading ? 'Exportando...' : 'Exportar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Delete account */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-red-900">Eliminar cuenta</h3>
                          <p className="text-sm text-red-700 mb-4">
                            Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, 
                            publicaciones, mensajes y conexiones.
                          </p>
                          
                          {showDeleteConfirm ? (
                            <div className="space-y-4">
                              <p className="text-sm font-medium text-red-900">
                                ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.
                              </p>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowDeleteConfirm(false)}
                                  className="btn-secondary text-sm"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={handleDeleteAccount}
                                  disabled={isLoading}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>{isLoading ? 'Eliminando...' : 'Sí, eliminar cuenta'}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handleDeleteAccount}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Eliminar cuenta</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}