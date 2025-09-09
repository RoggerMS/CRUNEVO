import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 lg:py-12 bg-gradient-to-br from-primary to-primary-dark">
        <div className="mx-auto max-w-md text-center">
          <Link to="/" className="text-4xl font-bold text-white mb-8 block">
            CRUNEVO
          </Link>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Conecta con el mundo
          </h2>
          <p className="text-lg text-primary-light">
            Únete a la comunidad más vibrante y comparte tus momentos con personas de todo el mundo.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center text-primary-light">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Comparte fotos y videos</span>
            </div>
            <div className="flex items-center text-primary-light">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Conecta con amigos</span>
            </div>
            <div className="flex items-center text-primary-light">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Descubre contenido increíble</span>
            </div>
            <div className="flex items-center text-primary-light">
              <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
              <span>Mensajería en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile branding */}
          <div className="text-center lg:hidden mb-8">
            <Link to="/" className="text-3xl font-bold text-primary">
              CRUNEVO
            </Link>
            <p className="mt-2 text-gray-600">
              Conecta con el mundo
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}