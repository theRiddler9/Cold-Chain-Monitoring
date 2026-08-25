# Cold Chain Monitor

A Vercel-ready TypeScript dashboard for pharmaceutical refrigerator telemetry. Each DHT22 sensor belongs to an ESP32 node, and each node belongs to a refrigerator.

## Quick start

```bash
npm install
npm run dev
```

The web dashboard runs at `http://localhost:5173`; API routes run at `http://localhost:3000/api`.

## Database

Create a PostgreSQL database with the TimescaleDB extension enabled, set `DATABASE_URL`, then run:

```bash
npm run migrate
npm run seed
```

Without `DATABASE_URL`, the API returns useful demo data so the UI remains previewable.

## Telemetry ingestion

`POST /api/telemetry` accepts:

```json
{"sensorId":"SENS-A-01","temperatureC":4.2,"humidityRh":66,"recordedAt":"2026-08-25T10:00:00Z"}
```

An optional `x-api-key` header is checked when `INGEST_API_KEY` is configured.
