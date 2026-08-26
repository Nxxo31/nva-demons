#!/usr/bin/env bash
# ─── NVA Demons — Deploy Script ────────────────────────────────────
# Usage:
#   ./scripts/deploy.sh          # production deploy
#   ./scripts/deploy.sh --preview # preview deployment
#
# Prerequisites:
#   - Vercel CLI installed:  npm i -g vercel
#   - Vercel authenticated:  vercel login
#   - .env.local configured (or Vercel project env vars set)
#
set -euo pipefail

cd "$(dirname "$0")/.."

# ── Preflight checks ───────────────────────────────────────────────
if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found. Copy .env.example and fill in values."
  echo "   cp .env.example .env.local"
  # Continue anyway — Vercel project env vars may be set.
fi

# ── Install dependencies ───────────────────────────────────────────
echo "📦 Installing dependencies..."
npm install

# ── Lint ────────────────────────────────────────────────────────────
echo "🧹 Linting..."
npm run lint || echo "⚠️  Lint warnings found (non-blocking)"

# ── Build ───────────────────────────────────────────────────────────
echo "🏗️  Building..."
npm run build

echo "✅ Build complete."

# ── Deploy ──────────────────────────────────────────────────────────
if [ "${1:-}" = "--preview" ]; then
  echo "🚀 Deploying preview..."
  vercel
else
  echo "🚀 Deploying to production..."
  vercel --prod
fi

echo ""
echo "✅ Deployment complete."
