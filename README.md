<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="UAV Forecast logo" />
</p>

<h1 align="center">UAV Forecast</h1>

<p align="center">
  Real-time weather, wind-shear, space-weather and GNSS intelligence for drone &amp; UAV pilots.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646cff.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38b2ac.svg" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## ✨ Features

- **Pre-flight briefing layout** — a print-style briefing sheet with a GO / CAUTION / NO-GO verdict, every criterion shown next to its limits, and a copyable METAR-style summary line.
- **Flight readiness checklist** — wind, gusts, precipitation, visibility (VLOS), geomagnetic activity, LiPo battery temperature and GNSS coverage, each rated *ok / caution / critical*.
- **Physics-based altitude wind profile** — atmospheric boundary-layer power law ($v(z) = v_{ref} \cdot (z / z_{ref})^\alpha$) over 10 tiers from 20 m to 400 m AGL, rendered as a sounding-style bar chart.
- **Interactive 24/48/72-hour timeline** — wind & gust chart with caution/critical thresholds, a colour-coded flyability strip and a detailed hourly table. Export to JSON for mission planners or flight logs.
- **Live space weather** — planetary Kp index from NOAA SWPC (supports both current and legacy API formats).
- **Live GNSS geometry** — Keplerian propagation of CelesTrak GPS ephemeris (UTC epochs, sidereal-time Earth rotation) with a 15° elevation mask, scaled for multi-constellation receivers.
- **Location picker** — city search, GPS / IP auto-location, manual coordinates and an interactive OpenStreetMap picker.
- **Bilingual UI (TR / EN)**, four wind units (km/h, kn, m/s, mph), remembered preferences, auto-refresh every 10 minutes, installable as a PWA.

## 🛠️ Tech stack & data sources

- **Core:** React 18 + Vite 5, Tailwind CSS 3, React-Leaflet
- **APIs (no keys required):**
  - [Open-Meteo](https://open-meteo.com/) — forecast & geocoding
  - [NOAA SWPC](https://www.swpc.noaa.gov/) — planetary K-index
  - [CelesTrak](https://celestrak.org/) — GPS orbital elements
  - [BigDataCloud](https://www.bigdatacloud.com/) / [Nominatim](https://nominatim.org/) — reverse geocoding
  - [OpenStreetMap](https://www.openstreetmap.org/copyright) — map tiles

## 🚀 Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run unit tests (node:test)
npm run build    # production build into dist/
```

Pushing to `main` runs the tests, builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## ⚠️ Disclaimer

UAV Forecast is an advisory tool. Always follow your local aviation authority's drone regulations and use your own judgement before flying.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
