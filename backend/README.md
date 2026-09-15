# Medical Report OCR Service

Standalone Node.js/TypeScript microservice that accepts a diagnostic report
(image or PDF), OCRs it via the Datalab Marker API, and returns extracted
lab observations as a FHIR R4 `Bundle` of `Observation` resources.

> Auth and Docker are intentionally not included in this build — focus is
> on the OCR → parsing → FHIR mapping → validation pipeline.

## Project structure

```
src/
  config/env.ts             environment variable loading
  types/fhir.types.ts       FHIR R4 Bundle/Observation shapes
  types/ocr.types.ts        Marker API + intermediate parsed shapes
  services/ocr.service.ts        submits + polls the Datalab Marker API
  services/parsing.service.ts    turns OCR text into structured observations
  services/loinc.service.ts      LOINC code lookup for common tests
  services/mapping.service.ts    parsed observation -> FHIR Observation
  services/validation.service.ts sanity checks + needsReview flagging
  routes/extract.route.ts   POST /extract
  routes/health.route.ts    GET /health
  middleware/error-handler.ts
  utils/errors.ts           application error types
  server.ts                 express app + entrypoint
tests/
  validation.service.test.ts
```

## Setup

1. Sign up at [datalab.to](https://datalab.to) and grab an API key (free
   tier is enough).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env template and fill in your key:
   ```bash
   cp .env.example .env
   ```

## Environment variables

| Variable             | Required | Default                                       | Description                        |
|-----------------------|----------|------------------------------------------------|-------------------------------------|
| `DATALAB_API_KEY`     | yes      | —                                              | Datalab Marker API key              |
| `PORT`                | no       | `3000`                                          | HTTP port                           |
| `MARKER_API_BASE_URL` | no       | `https://www.datalab.to/api/v1/marker`          | Marker API base URL                 |
| `POLL_INTERVAL_MS`    | no       | `2000`                                          | Delay between OCR status polls      |
| `POLL_TIMEOUT_MS`     | no       | `60000`                                         | Max time to wait for OCR to finish  |

## Run locally

```bash
npm run dev        # ts-node-dev, hot reload
# or
npm run build && npm start
```

## Run tests

```bash
npm test
```

## Example request

```bash
curl -X POST http://localhost:3000/extract \
  -F "file=@./sample-report.jpg"
```

Response is a FHIR `Bundle` — see the assignment spec for the exact shape.
Observations that fail sanity checks (non-numeric value, missing unit)
are still included but their test name appears in `meta.needsReview[]`.

## Assumptions & trade-offs

- **Parsing is heuristic, not a general table parser.** `parsing.service.ts`
  matches two common lab-report line shapes: markdown table rows
  (`| Test | Value | Unit | Range |`) and loosely-aligned plain text lines
  (`Test   Value Unit   Low-High`). Reports with very different layouts
  (multi-column, nested panels) will need additional patterns.
- **LOINC coverage is a small static map** (`loinc.service.ts`) covering
  common CBC/LFT/KFT tests. Unmapped tests still return a valid
  `Observation` — just with an empty `coding` array and only `code.text`
  set.
- **Interpretation (L/H/N)** is only computed when both the numeric value
  and a full reference range were successfully parsed; otherwise it's
  omitted rather than guessed.
- **No auth layer** — deliberately out of scope for this pass, per request.
- **Multi-page PDFs**: Marker returns the full document as one markdown
  string, and the line-based parser runs across the whole thing, so
  multi-page reports are handled as long as page breaks don't split an
  observation's row across lines.
- **Native `fetch`/`FormData`/`Blob`** (Node 18+) are used instead of
  extra HTTP/form-data dependencies, to keep the dependency surface small.
