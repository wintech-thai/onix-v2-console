# ---------- Build ----------
FROM node:20-alpine AS builder
ARG version
WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN npm i -g pnpm

COPY . .
ENV NEXT_PUBLIC_APP_VERSION=$version
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm install --prefer-offline --frozen-lockfile
RUN pnpm build

# ---------- Run (standalone) ----------
FROM node:20-alpine AS runner
ARG version
WORKDIR /app

RUN apk add --no-cache libc6-compat

# 1) ตัว server + node_modules ที่ bundle แล้ว
COPY --from=builder /app/.next/standalone ./
# 2) ไฟล์ static ของ Next
COPY --from=builder /app/.next/static ./.next/static
# 3) public assets
COPY --from=builder /app/public ./public

ENV NEXT_PUBLIC_APP_VERSION=$version
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
