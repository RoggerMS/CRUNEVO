# CRUNEVO - Red Social

Una red social moderna construida con arquitectura de microservicios usando React, NestJS, PostgreSQL y Redis.

## 🏗️ Arquitectura

### Frontend
- **Web App**: React + TypeScript + Vite + Tailwind CSS

### Backend (Microservicios)
- **API Gateway**: Enrutamiento y autenticación centralizada (Puerto 3000)
- **Identity Service**: Gestión de usuarios y autenticación (Puerto 3001)
- **Posts Service**: Gestión de publicaciones, likes y comentarios (Puerto 3002)
- **Messages Service**: Chat y mensajería en tiempo real (Puerto 3003)
- **Realtime Service**: WebSocket y notificaciones (Puerto 3005)

### Bases de Datos
- **PostgreSQL**: Una base de datos por servicio
- **Redis**: Cache y comunicación en tiempo real

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker
- Docker Compose
- Node.js 18+ (para desarrollo local)

### Desarrollo con Docker

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd CRUNEVO
   ```

2. **Iniciar solo las bases de datos** (recomendado para desarrollo)
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
   Esto iniciará:
   - PostgreSQL (puertos 5432, 5433, 5434)
   - Redis (puerto 6379)
   - pgAdmin (puerto 8080)
   - Redis Commander (puerto 8081)

3. **Ejecutar servicios localmente**
   ```bash
   # Terminal 1 - API Gateway
   cd services/api-gateway
   npm install
   npm run start:dev

   # Terminal 2 - Identity Service
   cd services/identity
   npm install
   npx prisma migrate dev
   npm run start:dev

   # Terminal 3 - Posts Service
   cd services/posts
   npm install
   npx prisma migrate dev
   npm run start:dev

   # Terminal 4 - Messages Service
   cd services/messages
   npm install
   npx prisma migrate dev
   npm run start:dev

   # Terminal 5 - Realtime Service
   cd services/realtime
   npm install
   npm run start:dev

   # Terminal 6 - Frontend
   cd apps/web
   npm install
   npm run dev
   ```

### Producción con Docker

1. **Construir y ejecutar todos los servicios**
   ```bash
   docker-compose up --build
   ```

2. **Ejecutar en segundo plano**
   ```bash
   docker-compose up -d --build
   ```

3. **Ver logs**
   ```bash
   docker-compose logs -f [service-name]
   ```

4. **Detener servicios**
   ```bash
   docker-compose down
   ```

## 🔧 Herramientas de Administración

### pgAdmin (Gestión de PostgreSQL)
- URL: http://localhost:8080
- Email: admin@crunevo.com
- Password: admin123

### Redis Commander (Gestión de Redis)
- URL: http://localhost:8081

## 📱 Acceso a la Aplicación

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Identity Service**: http://localhost:3001
- **Posts Service**: http://localhost:3002
- **Messages Service**: http://localhost:3003
- **Realtime Service**: http://localhost:3005

## 🗄️ Configuración de Base de Datos

### Conexiones PostgreSQL
- **Identity DB**: `postgresql://postgres:postgres123@localhost:5432/identity_db`
- **Posts DB**: `postgresql://postgres:postgres123@localhost:5433/posts_db`
- **Messages DB**: `postgresql://postgres:postgres123@localhost:5434/messages_db`

### Conexión Redis
- **Redis**: `redis://localhost:6379`

## 🔐 Variables de Entorno

Cada servicio necesita un archivo `.env` con las siguientes variables:

### Identity Service
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/identity_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
PORT=3001
```

### Posts Service
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/posts_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3002
```

### Messages Service
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5434/messages_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
REDIS_URL="redis://localhost:6379"
PORT=3003
```

### Realtime Service
```env
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
REDIS_URL="redis://localhost:6379"
PORT=3005
```

### API Gateway
```env
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
IDENTITY_SERVICE_URL="http://localhost:3001"
POSTS_SERVICE_URL="http://localhost:3002"
MESSAGES_SERVICE_URL="http://localhost:3003"
REALTIME_SERVICE_URL="http://localhost:3005"
PORT=3000
```

### Frontend
```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="http://localhost:3005"
```

## 🧪 Testing

```bash
# Ejecutar tests en un servicio específico
cd services/[service-name]
npm run test

# Ejecutar tests e2e
npm run test:e2e
```

## 📦 Comandos Útiles

```bash
# Limpiar volúmenes de Docker
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Ver estado de contenedores
docker-compose ps

# Ejecutar comando en contenedor
docker-compose exec [service-name] [command]

# Ver logs de un servicio específico
docker-compose logs -f [service-name]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Solución de Problemas

### Error de conexión a base de datos
- Asegúrate de que los contenedores de PostgreSQL estén ejecutándose
- Verifica las variables de entorno
- Ejecuta las migraciones de Prisma

### Error de conexión a Redis
- Verifica que el contenedor de Redis esté ejecutándose
- Comprueba la URL de Redis en las variables de entorno

### Puertos ocupados
- Cambia los puertos en docker-compose.yml si están ocupados
- Usa `netstat -an | findstr :PORT` para verificar puertos en uso

### Problemas de permisos
- En Linux/Mac, puede ser necesario usar `sudo` con Docker
- Verifica los permisos de los archivos y directorios