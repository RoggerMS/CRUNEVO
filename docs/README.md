# CRUNEVO Docs

## Endpoints iniciales

### API Gateway
- `GET /api/health`
- `POST /api/auth/register`

### Identity
- `GET /health`
- `GET /users/:handle`

## Smoke test
```bash
curl http://localhost:3000/health
# {"ok":true,"service":"identity"}

curl http://localhost:3000/users/demo
# {"id":"1","handle":"demo","email":"d***@crunevo.local"}
```

Para configuración local consulta [LOCAL_SETUP.md](./LOCAL_SETUP.md).
