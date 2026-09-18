# ReportRx

ReportRx is a medical report reader that turns uploaded diagnostic reports into structured FHIR R4 observations. The frontend provides a drag-and-drop upload and review experience; the backend sends the report to Datalab Marker for OCR, parses the returned markdown, maps common tests to LOINC, and flags observations that need review.

## Features

- Upload JPEG, PNG, WebP, and PDF reports.
- OCR reports through the Datalab Marker API.
- Parse markdown lab-report tables into observations.
- Map common tests to LOINC codes.
- Calculate low, high, and normal interpretations when a complete numeric range is available.
- Flag missing units or invalid numeric values in `meta.needsReview`.
- Cancel an in-flight extraction request from the frontend.
- Download successful results as a FHIR JSON bundle.
- Health check endpoint for deployment monitoring.

## Architecture

```text
React + Vite frontend
        |
        | POST /extract (multipart field: file)
        v
Express + TypeScript backend
        |
        | submit and poll
        v
Datalab Marker API
        |
        v
OCR markdown -> parser -> LOINC mapper -> validator -> FHIR Bundle
```

The repository contains two independent Node.js packages:

- `frontend/`: React 18, TypeScript, and Vite UI.
- `backend/`: Express, TypeScript, Multer, and the Datalab Marker integration.

## Requirements

- Node.js 18 or newer.
- A Datalab account and Marker API key for local backend operation.
- npm.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATALAB_API_KEY` in `backend/.env`. Do not commit `.env` or expose the key in source control.

### Backend Environment

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `DATALAB_API_KEY` | Yes | None | API key for Datalab Marker |
| `PORT` | No | `3000` | Express server port |
| `MARKER_API_BASE_URL` | No | `https://www.datalab.to/api/v1/marker` | Marker submission endpoint |
| `POLL_INTERVAL_MS` | No | `1500` | Delay between Marker status polls |
| `POLL_TIMEOUT_MS` | No | `120000` | Maximum OCR wait time |

### Run the Backend

Development mode with reload:

```bash
cd backend
npm run dev
```

Production-style build and start:

```bash
cd backend
npm run build
npm start
```

Run backend tests:

```bash
cd backend
npm test
```

The local service listens on `http://localhost:3000` by default.

## Frontend Setup

```bash
cd frontend
npm install
```

The frontend extraction client currently targets the deployed backend:

```text
https://reportrx-backend.vercel.app
```

To use a different backend, configure the Vite API URL in the frontend environment and ensure the client reads that variable in the API module:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
cd frontend
npm run preview
```

The Vite development server normally opens at `http://localhost:5173`.

## API

### `GET /health`

Returns a deployment health response:

```json
{
  "status": "ok",
  "timestamp": "2026-09-15T12:00:00.000Z"
}
```

### `POST /extract`

Accepts a multipart form upload with the field name `file`.

Supported MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`
- `application/pdf`

Example:

```bash
curl -X POST http://localhost:3000/extract \
  -F "file=@./sample-report.jpg"
```

Successful responses are FHIR-style collection bundles containing preliminary `Observation` resources:

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "status": "preliminary",
        "code": {
          "coding": [],
          "text": "Hemoglobin"
        },
        "valueQuantity": {
          "value": 11.2,
          "unit": "g/dL"
        }
      }
    }
  ],
  "meta": {
    "source": "ocr-extraction",
    "needsReview": []
  }
}
```

Common errors are returned as JSON with an `error` field. Missing files and unsupported MIME types return a client error; reports with no extractable observations return an unprocessable-entity error; upstream OCR failures return a server error.

## Processing Pipeline

1. Multer receives the report in memory.
2. The backend validates the uploaded MIME type.
3. The file is submitted to Datalab Marker with markdown output requested.
4. The backend polls Marker until completion, failure, or timeout.
5. The parser reads numeric markdown-table rows and extracts test name, value, unit, and numeric reference range.
6. The mapper creates FHIR `Observation` resources and applies a small static LOINC lookup for common tests.
7. The validator flags observations with a missing unit or invalid numeric value.
8. The frontend displays the bundle, review flags, reference-range indicators, and download action.

## Parsing and Validation Notes

- Parsing is heuristic and currently targets markdown table rows. Reports with unusual layouts may need additional parser patterns.
- Reference ranges containing descriptive words are not guessed; interpretation is omitted when a complete numeric range is unavailable.
- Unknown tests still produce observations, but their LOINC coding array is empty.
- Invalid values and missing units remain in the response so they can be reviewed rather than silently discarded.
- OCR output is logged by the extraction route during backend processing. Avoid enabling verbose logs where report data must remain private.
- The current backend has no authentication or authorization layer.
- CORS is enabled globally by the Express server; tighten the policy before exposing the service beyond a controlled deployment.

## Project Layout

```text
backend/
  src/config/              environment loading
  src/middleware/          Express error handling
  src/routes/              /health and /extract routes
  src/services/            OCR, parsing, LOINC, mapping, validation
  src/types/               FHIR and OCR types
  tests/                   backend tests

frontend/
  src/api/                 backend request client
  src/components/          upload, progress, results, and layout UI
  src/hooks/               extraction state and progress hooks
  src/types/               frontend FHIR types
  src/styles/              global tokens and styles
```

## Security

- Keep `DATALAB_API_KEY` in an ignored environment file or deployment secret.
- Do not commit medical reports, OCR output, or generated build artifacts.
- Add authentication, request limits, restricted CORS, and production logging controls before handling sensitive reports in a public deployment.
