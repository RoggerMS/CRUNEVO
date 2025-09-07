# CRUNEVO Monorepo

## Development Setup

```bash
pnpm install
pnpm dev
```

Services included:
- identity service (NestJS)
- gateway (Apollo Server)
- realtime (Socket.IO)
- web (Next.js minimal)

Each service listens on its own port:
- identity: 3001
- gateway: 4000
- realtime: 4001

## Notes
This repository is an initial scaffold for the CRUNEVO platform.
