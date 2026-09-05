#!/usr/bin/env bash
# ==============================================================================
# LifeLink Emergency Response - Google Cloud Run Deployment Script (Bash)
# ==============================================================================

set -euo pipefail

PROJECT_ID="${1:-lifelink-agentic-2026}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-lifelink-emergency-app}"

echo "=========================================================="
echo " 🚀 LifeLink Agentic AI - Google Cloud Run Deployment"
echo " Project:     $PROJECT_ID"
echo " Region:      $REGION"
echo " Service:     $SERVICE_NAME"
echo "=========================================================="

# Check for gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: 'gcloud' CLI is not installed."
    echo "👉 Please install Google Cloud SDK or run this in Google Cloud Shell."
    exit 1
fi

# Load GEMINI_API_KEY from .env if present
GEMINI_KEY=""
if [ -f .env ]; then
    GEMINI_KEY=$(grep -E '^GEMINI_API_KEY=' .env | cut -d '=' -f2- || true)
fi

# Set active project
echo "🔧 Setting active GCP project to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

# Enable required GCP APIs
echo "🔌 Ensuring required GCP APIs are enabled..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    bigquery.googleapis.com \
    pubsub.googleapis.com

# Deploy directly from source to Cloud Run
echo "🚀 Building container and deploying to Cloud Run..."
ENV_VARS="NODE_ENV=production,GCP_PROJECT_ID=$PROJECT_ID,GCP_BIGQUERY_DATASET=lifelink_emergency_dw,GCP_PUBSUB_TOPIC=lifelink-emergency-telemetry"
if [ -n "$GEMINI_KEY" ]; then
    ENV_VARS="$ENV_VARS,GEMINI_API_KEY=$GEMINI_KEY"
fi

gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "$ENV_VARS"

echo ""
echo "✅ LifeLink successfully deployed to Google Cloud Run!"
