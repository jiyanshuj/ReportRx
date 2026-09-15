# Lab Report Reader (frontend)

React + TypeScript + Vite UI for the Medical Report OCR backend. Upload a
report, and each extracted observation is shown next to a small range
indicator so it's fast to check whether a value looks right before it's
confirmed.

## Project structure

```
src/
  types/fhir.types.ts             FHIR Bundle/Observation shapes (mirrors backend)
  api/extract.api.ts              POST /extract client
  hooks/useExtractReport.ts       upload + request state
  components/
    layout/AppHeader.tsx
    upload/UploadPanel.tsx        dropzone + file picker
    results/ResultsSummary.tsx    "N observations, M need review"
    results/ObservationTable.tsx  results table
    results/ObservationRow.tsx    single row
    results/RangeIndicator.tsx    value vs. reference-range visual
    results/ReviewFlag.tsx        N / H / L / needs-review chip
  App.tsx
  main.tsx
  styles/tokens.css, global.css
```

## Setup

```bash
npm install
cp .env.example .env
```

Set `VITE_API_BASE_URL` if the backend isn't running on
`http://localhost:3000`.

## Run

```bash
npm run dev
```

Opens on `http://localhost:5173`. Requires the backend service to be
running separately (see the backend's own README).

## Notes

- The backend needs CORS enabled for this origin — see the `cors`
  addition in the backend's `server.ts`.
- No auth: the UI hits `/extract` directly with no token, matching the
  backend build.
