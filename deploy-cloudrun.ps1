# ==============================================================================
# LifeLink Emergency Response - Google Cloud Run One-Click Deployment (PowerShell)
# ==============================================================================

param (
    [string]$ProjectId = "lifelink-agentic-2026",
    [string]$Region = "us-central1",
    [string]$ServiceName = "lifelink-emergency-app"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 LifeLink Agentic AI - Google Cloud Run Deployment" -ForegroundColor Green
Write-Host " Project:     $ProjectId" -ForegroundColor Yellow
Write-Host " Region:      $Region" -ForegroundColor Yellow
Write-Host " Service:     $ServiceName" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ 'gcloud' CLI is not installed or not in PATH." -ForegroundColor Yellow
    Write-Host "👉 You can run this in Google Cloud Shell or install Google Cloud SDK:" -ForegroundColor White
    Write-Host "   https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    Write-Host "`nAlternatively, build and run locally with Docker:" -ForegroundColor White
    Write-Host "   docker build -t lifelink-app ." -ForegroundColor Green
    Write-Host "   docker run -p 8080:8080 -e GEMINI_API_KEY=YOUR_KEY lifelink-app" -ForegroundColor Green
    exit 1
}

# 2. Extract GEMINI_API_KEY from .env if present
$GeminiKey = ""
if (Test-Path ".env") {
    $EnvContent = Get-Content ".env" -Raw
    if ($EnvContent -match "GEMINI_API_KEY=(.+)") {
        $GeminiKey = $Matches[1].Trim()
        Write-Host "🔑 Loaded GEMINI_API_KEY from .env" -ForegroundColor Green
    }
}

# 3. Set Active GCP Project
Write-Host "`n🔧 Setting active GCP project to $ProjectId..." -ForegroundColor Cyan
gcloud config set project $ProjectId

# 4. Enable Required GCP APIs
Write-Host "`n🔌 Ensuring required Google Cloud APIs are enabled..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com bigquery.googleapis.com pubsub.googleapis.com

# 5. Build and Deploy to Cloud Run
Write-Host "`n🚀 Submitting build and deploying to Cloud Run..." -ForegroundColor Cyan

$EnvVars = "NODE_ENV=production,GCP_PROJECT_ID=$ProjectId,GCP_BIGQUERY_DATASET=lifelink_emergency_dw,GCP_PUBSUB_TOPIC=lifelink-emergency-telemetry"
if ($GeminiKey -ne "") {
    $EnvVars += ",GEMINI_API_KEY=$GeminiKey"
}

gcloud run deploy $ServiceName `
    --source . `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --memory 1Gi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --set-env-vars $EnvVars

Write-Host "`n✅ LifeLink deployed successfully to Google Cloud Run!" -ForegroundColor Green
