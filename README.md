# OntoEvent ERP

MVP de OntoEvent ERP - herramienta visual para modelar ontologías de negocio e inferir reglas.

## Tecnologías Principales

- Next.js 15 (App Router)
- React Flow v11 (Canvas de UI)
- Zustand v4 (Manejo de estado)
- Drizzle ORM + SQLite
- NextAuth.js v5 (Autenticación)
- Tailwind CSS

## Uso local

```bash
# 1. Instalar dependencias
npm install

# 2. Empujar el schema local SQLite
npx drizzle-kit push

# 3. Correr entorno de desarrollo
npm run dev
```

## Producción (Docker)

```bash
docker-compose up --build
```
