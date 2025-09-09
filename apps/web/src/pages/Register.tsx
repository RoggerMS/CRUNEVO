import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { validateEmail, validateUsername, validatePassword } from '../lib/utils'
import { cn } from '../lib/utils'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[]
  })
  const { register, isLoading } = useAuthStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Real-time password validation
    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordValidation(validation)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.username) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'El nombre de usuario debe tener 3-20 caracteres y solo puede contener letras, números y guiones bajos'
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'La contraseña no cumple con los requisitos'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await register({
        name: formData.name.trim(),
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Error al crear la cuenta. Inténtalo de nuevo.' 
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Crear Cuenta
        </h2>
        <p className="mt-2 text-gray-600">
          Únete a la comunidad CRUNEVO
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre completo
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className={cn(
                'input-field',
                errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Tu nombre completo"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Nombre de usuario
          </label>
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className={cn(
                'input-field',
                errors.username && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="tu_usuario"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className={cn(
                'input-field',
                errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className={cn(
                'input-field pr-10',
                errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Password requirements */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              {passwordValidation.errors.map((error, index) => (
                <div key={index} className="flex items-center text-xs">
                  <X className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-600">{error}</span>
                </div>
              ))}
              {passwordValidation.isValid && (
                <div className="flex items-center text-xs">
                  <Check className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600">Contraseña válida</span>
                </div>
              )}
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={cn(
                'input-field pr-10',
                errors.confirmPassword && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Confirma tu contraseña"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            Acepto los{' '}
            <a href="#" className="text-primary hover:text-primary-dark">
              términos y condiciones
            </a>{' '}
            y la{' '}
            <a href="#" className="text-primary hover:text-primary-dark">
              política de privacidad
            </a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}