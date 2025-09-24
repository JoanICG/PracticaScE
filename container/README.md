# Contenedores para PracticaScE

Este directorio contiene la configuración de Docker para levantar toda la aplicación (backend, frontend y base de datos Postgres) con un solo comando.

## Estructura
- `docker-compose.yml`: Orquesta los servicios `db`, `backend` y `frontend`.
- `dockerfiles/backend.Dockerfile`: Imagen del backend.
- `dockerfiles/frontend.Dockerfile`: Imagen del frontend (modo dev con Vite).

## Requisitos
- Docker y Docker Compose instalados.

## Variables de entorno
- Crea y rellena `backend/.env` (ya existe en el repo). Importante:
  - `DB_PASSWORD`, `DB_USERNAME`, `DB_DATABASE`
  - `STRIPE_SECRET_KEY` (clave secreta de Stripe)
  - `STRIPE_PUBLISHABLE_KEY` (clave pública de Stripe)

> Nota: Dentro del contenedor, el backend usa `DB_HOST=db` para conectarse a Postgres.

## Levantar los servicios

Desde este directorio `container/` ejecuta:

```powershell
# Windows PowerShell
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Postgres: puerto local 5432

## Parar
```powershell
docker compose down
```

## Datos persistentes
- El volumen `db_data` persiste los datos de Postgres entre reinicios.
