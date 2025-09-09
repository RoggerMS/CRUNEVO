# CRUNEVO

Monorepo para la plataforma social educativa CRUNEVO.

## Estructura
- `apps/` – aplicaciones cliente (web, gateway, realtime).
- `services/` – microservicios de dominio (p.ej. identity).
- `packages/` – paquetes compartidos (config, utilidades, esquemas, proto).
- `docker/` – configuración de Docker Compose para el entorno local.
- `docs/` – documentación del proyecto.

### Servicio identity
Endpoints disponibles:
- `GET /health` → `{ ok: true, service: "identity" }`
- `GET /users/:handle` → información básica del usuario con handle dado.

## Comandos básicos
```bash
pnpm install
pnpm dev:stack     # levanta infraestructura local
pnpm dev           # inicia los servicios (ej. identity)
```

Para más detalles consulta [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md).
