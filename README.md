# 🚁 UAV Forecast

![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**UAV Forecast** is a high-performance, web-based meteorological intelligence tool designed specifically for Unmanned Aerial Vehicle (UAV) and FPV drone pilots. It provides critical, real-time atmospheric and space-weather data required for safe and efficient flight planning, eliminating the guesswork from pre-flight checks.

---

## ✨ Key Features

* **Advanced Wind Profiling:** Uses linear interpolation and extrapolation to calculate wind speed, gusts, and temperature across multiple altitude tiers (20m, 40m, 60m, 80m, 120m, 150m, 180m, 250m, 300m, 400m).
* **Real-Time Space Weather:** Integrates live planetary K-index data from the GFZ Potsdam API (routed through a secure CORS proxy) to monitor geomagnetic storms that can cause GPS degradation or satellite lock failures.
* **Interactive Map & Reverse Geocoding:** Features a `react-leaflet` map for exact coordinate targeting. Automatically converts raw coordinates into readable city/region names using OpenStreetMap Nominatim.
* **72-Hour Forecast:** Delivers a rolling 3-day hourly forecast for temperature, precipitation probability, cloud cover, and algorithmic flight suitability.
* **Data Export:** Seamlessly export 1, 2, or 3-day filtered meteorological data into standard `.json` format for use in external flight planners or mission control software.
* **Dynamic Localization:** Fully bilingual interface (English/Turkish) that automatically adjusts visibility metrics (Miles/Kilometers) and compass directions (e.g., NW vs. KB).

---

## 🛠️ Tech Stack

* **Core:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Maps:** [React-Leaflet](https://react-leaflet.js.org/) (OpenStreetMap)
* **APIs Used (No Keys Required):**
  * [Open-Meteo](https://open-meteo.com/) (Weather Data)
  * [GFZ Potsdam](https://kp.gfz.de/en/) (Kp Index)
  * OpenStreetMap Nominatim (Geocoding)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
If you have a suggestion that would make this better, please fork the repo and create a pull request. 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.