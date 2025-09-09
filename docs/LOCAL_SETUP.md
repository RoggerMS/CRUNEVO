# Local Setup

## Requisitos
- Node.js 20 con corepack habilitado
- pnpm
- Docker y Docker Compose

## Primeros pasos
```bash
pnpm install
pnpm dev:stack
# copiar .env.example de cada servicio a .env y ajustar variables
pnpm dev
```

## Variables de entorno sugeridas
- POSTGRES_URL=postgres://postgres:postgres@localhost:5432/postgres
- REDIS_URL=redis://localhost:6379
- NATS_URL=nats://localhost:4222
- OPENSEARCH_URL=http://localhost:9200
- S3_ENDPOINT=http://localhost:9000
- S3_ACCESS_KEY=minio
- S3_SECRET_KEY=minio123
- KEYCLOAK_URL=http://localhost:8080
- MAILHOG_SMTP=smtp://localhost:1025
