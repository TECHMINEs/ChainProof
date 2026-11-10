#!/bin/bash
set -e

echo "🚀 Starting ChainProof Setup..."
echo ""

# Step 1: Verify .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
  if [ -f ".env.example" ]; then
    echo "📋 Creating apps/web/.env.local from .env.example..."
    cp .env.example apps/web/.env.local
  else
    echo "❌ ERROR: apps/web/.env.local not found!"
    exit 1
  fi
fi
echo "✅ Environment file found."

# Step 2: Start Docker containers
echo "📦 Starting PostgreSQL and Redis..."
# Prefer the Compose v2 plugin; fall back to the legacy standalone binary
if docker compose version >/dev/null 2>&1; then COMPOSE="docker compose"; else COMPOSE="docker-compose"; fi
$COMPOSE up -d db redis

if [ $? -ne 0 ]; then
  echo "❌ Docker Compose failed. Is Docker Desktop running?"
  exit 1
fi

# Step 3: Wait for DB
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Step 4: Push schema to database
echo "🗄️  Pushing database schema..."
DATABASE_URL=$(grep DATABASE_URL apps/web/.env.local | cut -d '=' -f2-) npm run db:push

# Step 5: Generate Prisma client
echo "💎 Generating Prisma client..."
DATABASE_URL=$(grep DATABASE_URL apps/web/.env.local | cut -d '=' -f2-) npm run db:generate

# Step 6: Compile smart contracts
echo "📜 Compiling smart contracts..."
npm run contracts:compile

# Step 7: Seed admin user
echo "🌱 Seeding admin account..."
cd apps/web
DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-) \
  node ../../scripts/seed-admin.js
cd ../..

echo ""
echo "✅ Setup complete!"
echo "─────────────────────────────────────────"
echo "  Run:  npm run dev"
echo "  URL:  http://localhost:3000/login"
echo "  ID:   ADMIN-001"
echo "  Pass: admin-password-2026"
echo "─────────────────────────────────────────"
