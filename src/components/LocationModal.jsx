import { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { locales } from '../utils/locales';

const LocationModal = ({ isOpen, onClose, onSelect, language }) => {
  const t = locales[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [mapCenter, setMapCenter] = useState([39.75, 37.01]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        onSelect(lat, lon);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onSelect(lat, lng);
      onClose();
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMapCenter([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-lg shadow-xl border border-slate-700 overflow-hidden flex flex-col max-h-full">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">{t.locationPickerTitle}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            {t.close}
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchLocation}
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
            <button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded transition-colors">
              {t.search}
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="number"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              placeholder={t.latitude}
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              placeholder={t.longitude}
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleManualSubmit} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors">
              Go
            </button>
          </div>

          <div className="relative h-64 w-full rounded border border-slate-700 overflow-hidden mb-4">
            <MapContainer center={mapCenter} zoom={6} className="h-full w-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapClickHandler />
            </MapContainer>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1000]">
              <div className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-500/30"></div>
            </div>
          </div>
          
          <button
            onClick={() => {
              onSelect(mapCenter[0], mapCenter[1]);
              onClose();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded font-semibold transition-colors"
          >
            {t.selectOnMap}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;