# 🚀 LifeLink - Docker & Google Cloud Run Deployment Guide

This guide details how to build the container image and deploy the **LifeLink Agentic AI Emergency Response Platform** to **Google Cloud Run**.

---

## 🏗️ 1. Architecture Overview on Cloud Run

When deployed to Google Cloud Run, LifeLink operates as a high-performance, autoscaling, containerized service:

```
                          ┌───────────────────────────┐
                          │   Google Cloud Run (8080) │
                          │  ┌─────────────────────┐  │
HTTP/HTTPS (User/Citizen) ──>│ React 19 Frontend   │  │
                          │  └─────────────────────┘  │
                          │  ┌─────────────────────┐  │
                          │  │ Express Coordinator │  │
                          │  └──────────┬──────────┘  │
                          └─────────────┼─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
  ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
  │ Google Gemini   │          │ Google BigQuery │          │ Google Cloud    │
  │ 3.7 Flash AI    │          │ lifelink_dw     │          │ Pub/Sub Topic   │
  └─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## 🐳 2. Local Container Build & Run with Docker

### A. Build Docker Image Locally
```bash
docker build -t lifelink-emergency-app .
```

### B. Run Docker Container Locally
```bash
docker run -d -p 8080:8080 \
  -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
  -e GCP_PROJECT_ID="lifelink-agentic-2026" \
  -e GCP_BIGQUERY_DATASET="lifelink_emergency_dw" \
  -e GCP_PUBSUB_TOPIC="lifelink-emergency-telemetry" \
  --name lifelink-instance \
  lifelink-emergency-app
```

Visit **`http://localhost:8080`** in your browser.

---

## ☁️ 3. Deploying to Google Cloud Run

### Option A: One-Command CLI Deployment (Recommended)

Run the automated deployment script:
- **Windows (PowerShell):**
  ```powershell
  .\deploy-cloudrun.ps1 -ProjectId "lifelink-agentic-2026" -Region "us-central1"
  ```
- **Linux / macOS / Cloud Shell (Bash):**
  ```bash
  chmod +x deploy-cloudrun.sh
  ./deploy-cloudrun.sh "lifelink-agentic-2026" "us-central1"
  ```

### Option B: Deploy Direct from Source via `gcloud`
```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project lifelink-agentic-2026

# 2. Deploy directly to Cloud Run
gcloud run deploy lifelink-emergency-app \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production,GCP_PROJECT_ID=lifelink-agentic-2026,GCP_BIGQUERY_DATASET=lifelink_emergency_dw,GCP_PUBSUB_TOPIC=lifelink-emergency-telemetry
```

### Option C: Using Google Cloud Build
```bash
gcloud builds submit --config=cloudbuild.yaml
```

---

## 🔒 4. Environment Variables & Cloud IAM

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `production` |
| `PORT` | Container listening port (injected by Cloud Run) | `8080` |
| `GEMINI_API_KEY` | Google Gemini API Key for Multi-Agent triage | `AIzaSy...` |
| `GCP_PROJECT_ID` | GCP Project ID | `lifelink-agentic-2026` |
| `GCP_BIGQUERY_DATASET` | BigQuery DW dataset name | `lifelink_emergency_dw` |
| `GCP_PUBSUB_TOPIC` | Pub/Sub emergency telemetry topic | `lifelink-emergency-telemetry` |

### Cloud Run Service Account Permissions
Ensure the Cloud Run Service Account (e.g. `PROJECT_NUMBER-compute@developer.gserviceaccount.com`) has the following IAM roles in GCP IAM:
- `roles/bigquery.admin` or `roles/bigquery.dataEditor` + `roles/bigquery.jobUser`
- `roles/pubsub.publisher`
- `roles/pubsub.subscriber`

---

## 🩺 5. Health Check & Validation

Once deployed, Cloud Run will output the HTTPS service URL (e.g. `https://lifelink-emergency-app-xyz-uc.a.run.app`).

You can test the endpoints:
- **UI Web App**: `https://<YOUR-SERVICE-URL>/`
- **Health Check**: `https://<YOUR-SERVICE-URL>/api/health`
- **BigQuery Status**: `https://<YOUR-SERVICE-URL>/api/bigquery/status`
