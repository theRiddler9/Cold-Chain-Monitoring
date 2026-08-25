# System architecture

Each refrigerator contains an ESP32 node, which owns one or more DHT22 sensors. Nodes use the mesh gateway shown in the supplied schematic; the gateway forwards readings to `POST /api/telemetry`. The API persists records in TimescaleDB and provides dashboard data at `GET /api/dashboard`.
