# syntax=docker/dockerfile:1

# Next.js necesita Node >=20.9 (ver node_modules/next/package.json -> engines).
ARG NODE_VERSION=20-alpine

# ---- deps: instala dependencias (incluye devDependencies, hacen falta para el build) ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compila con next build (output: "standalone" en next.config.ts) ----
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: solo lo trazado por output file tracing, corre como usuario sin privilegios ----
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# public/uploads debe quedar escribible por nextjs: ahi se guardan las
# imagenes subidas desde el admin (ver src/lib/storage.ts).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# /api/health ya existe en la app y prueba la conexion a Mongo, no solo que
# el proceso responda.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
