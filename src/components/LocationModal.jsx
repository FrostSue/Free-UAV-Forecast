import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import { locales } from '../utils/locales';
import { searchCity, getBestUserLocation } from '../utils/spaceWeather';

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const LocationModal = ({ isOpen, onClose, onSelect, language }) => {
  const t = locales[language] || locales['tr'];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [mapCenter, setMapCenter] = useState([41.0082, 28.9784]);
  const [customName, setCustomName] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setInputLat(mapCenter[0].toFixed(4));
    setInputLng(mapCenter[1].toFixed(4));
  }, [mapCenter]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery || !searchQuery.trim()) return;
    setIsSearching(true);
    setValidationError('');
    try {
      const results = await searchCity(searchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        const first = results[0];
        setMapCenter([first.lat, first.lon]);
        setCustomName(first.name);
      } else {
        setValidationError(language === 'tr' ? 'Konum bulunamadı.' : 'No locations found.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setValidationError(language === 'tr' ? 'Arama sırasında hata oluştu.' : 'Search error.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setMapCenter([result.lat, result.lon]);
    setCustomName(result.name);
    setSearchResults([]);
    setSearchQuery(result.name);
  };

  // Robust Auto Location: Uses Browser GPS + Automatic IP Geolocation Fallback
  const handleAutoLocation = async () => {
    setIsLocating(true);
    setValidationError('');
    try {
      const loc = await getBestUserLocation();
      setMapCenter([loc.lat, loc.lon]);
      if (loc.cityName) {
        setCustomName(loc.cityName);
        setSearchQuery(loc.cityName);
      } else {
        setCustomName(null);
      }
    } catch (err) {
      setValidationError(language === 'tr' ? 'Konum tespit edilemedi.' : 'Could not determine location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setValidationError(t.invalidCoords || 'Geçersiz koordinat! (Enlem -90/90, Boylam -180/180)');
      return;
    }

    setValidationError('');
    setMapCenter([lat, lng]);
    setCustomName(null);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setMapCenter([e.latlng.lat, e.latlng.lng]);
        setCustomName(null);
        setValidationError('');
      }
    });
    return null;
  };

  const handleConfirm = () => {
    onSelect(mapCenter[0], mapCenter[1], customName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <span>📍</span>
            <span>{t.locationPickerTitle}</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
          {validationError && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl font-medium">
              {validationError}
            </div>
          )}

          {/* Search Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchLocation}
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-xs md:text-sm font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              {isSearching ? '...' : t.search}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-36 overflow-y-auto bg-slate-800/90 border border-slate-700 rounded-xl divide-y divide-slate-700">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-2.5 text-xs text-slate-200 hover:bg-slate-700/80 transition-colors font-medium"
                >
                  📍 {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Coordinate Inputs & Auto-Location Trigger */}
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleAutoLocation} 
              disabled={isLocating}
              title={t.myLocation} 
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              {isLocating ? (
                <span className="animate-spin text-emerald-400">🌀</span>
              ) : (
                <span>🎯</span>
              )}
              <span className="hidden sm:inline">{t.myLocation}</span>
            </button>
            <input
              type="number"
              step="any"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              placeholder={t.latitude}
              className="flex-1 bg-slate-800 text-white px-2.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
            <input
              type="number"
              step="any"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              placeholder={t.longitude}
              className="flex-1 bg-slate-800 text-white px-2.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
            <button 
              onClick={handleManualSubmit} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95"
            >
              Git
            </button>
          </div>

          {/* Leaflet Interactive Map */}
          <div className="relative h-60 w-full rounded-xl border border-slate-700 overflow-hidden shadow-inner">
            <MapContainer center={mapCenter} zoom={11} className="h-full w-full">
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapUpdater center={mapCenter} />
              <MapClickHandler />
              <CircleMarker
                center={mapCenter}
                radius={8}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.85, weight: 2 }}
              />
            </MapContainer>
          </div>
          
          <button
            onClick={handleConfirm}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-950/50 active:scale-98"
          >
            {t.confirmLocation}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
