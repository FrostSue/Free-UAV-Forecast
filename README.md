# 🚁 UAV Forecast

![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**UAV Forecast** is a high-performance, web-based meteorological and space-weather intelligence tool designed specifically for Unmanned Aerial Vehicle (UAV) and FPV drone pilots. It provides critical, real-time atmospheric and orbital GNSS data required for safe and efficient flight planning, eliminating the guesswork from pre-flight checks.

---

## ✨ Key Features

* **Physics-Based Wind Profiling (Power Law):** Implements atmospheric boundary layer wind shear modeling ($v(z) = v_{ref} \cdot (z / z_{ref})^\alpha$) across 10 altitude tiers (20m, 40m, 60m, 80m, 120m, 150m, 180m, 250m, 300m, 400m) to prevent extrapolation runaway or unrealistic zeroing.
* **Real-Time Space Weather (NOAA SWPC):** Integrates live planetary K-index telemetry directly from the NOAA Space Weather Prediction Center API to monitor geomagnetic storm activity that causes GPS signal degradation and compass flyaways.
* **Live GNSS / GPS Orbital Tracking (CelesTrak):** Real-time orbital propagation using Keplerian orbital mechanics against active GPS constellation elements to calculate true line-of-sight satellite visibility (>0°) and locked satellites above a 15° elevation mask.
* **Interactive Map & Reliable Geocoding:** Features a `react-leaflet` map with coordinate boundary protection. Resolves city names via BigDataCloud client API and Open-Meteo Geocoding without 403 rate limits.
* **Multi-Factor Flight Safety Analysis:** Evaluates flight safety across sustained wind, gusts, precipitation probability, cloud cover, visibility (VLOS compliance), LiPo battery safe temperature thresholds, and geomagnetic conditions.
* **72-Hour Rolling Forecast & JSON Export:** Export 1, 2, or 3-day meteorological data directly to `.json` format for mission planners or flight logs.
* **Dynamic Bilingual Interface:** Turkish and English support with localized metric/imperial units and time formats.

---

## 🛠️ Tech Stack & Live APIs

* **Core:** React 18 + Vite
* **Styling:** Tailwind CSS
* **Maps:** React-Leaflet (OpenStreetMap)
* **APIs Used (No API Keys Required):**
  * **[Open-Meteo](https://open-meteo.com/):** High-resolution atmospheric and multi-tier wind forecast.
  * **[NOAA SWPC](https://services.swpc.noaa.gov/):** Real-time planetary K-index (Space Weather).
  * **[CelesTrak](https://celestrak.org/):** Live GPS constellation Keplerian orbital elements.
  * **[BigDataCloud](https://www.bigdatacloud.com/) & Open-Meteo Geocoding:** CORS-enabled reverse and search geocoding.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
