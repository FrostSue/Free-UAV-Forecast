import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import { getLocale } from '../utils/locales';
import { searchCity, getBestUserLocation } from '../utils/spaceWeather';
import Icon from './Icon';

const DEFAULT_CENTER = [41.0082, 28.9784];

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 9), { animate: true });
  }, [center, map]);
  useEffect(() => {
    // The map mounts inside an animating dialog; recompute its size once visible.
    const id = setTimeout(() => map.invalidateSize(), 220);
    return () => clearTimeout(id);
  }, [map]);
  return null;
};

const MapClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const LocationModal = ({ isOpen, onClose, onSelect, language, initialCoords, initialName }) => {
  const t = getLocale(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [customName, setCustomName] = useState(null);
  const [validationError, setValidationError] = useState('');
  const searchRef = useRef(null);

  // Reset the dialog to the current location whenever it opens
  useEffect(() => {
    if (!isOpen) return;
    const start = initialCoords ? [initialCoords.lat, initialCoords.lon] : DEFAULT_CENTER;
    setMapCenter(start);
    setCustomName(initialName || null);
    setSearchQuery('');
    setSearchResults([]);
    setValidationError('');
    const id = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isOpen, initialCoords, initialName]);

  useEffect(() => {
    setInputLat(mapCenter[0].toFixed(4));
    setInputLng(mapCenter[1].toFixed(4));
  }, [mapCenter]);

  // Escape to close + body scroll lock
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setValidationError('');
    try {
      const results = await searchCity(searchQuery, language);
      setSearchResults(results);
      if (results.length === 0) setValidationError(t.noResults);
    } catch {
      setSearchResults([]);
      setValidationError(t.searchError);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setMapCenter([result.lat, result.lon]);
    setCustomName(result.label);
    setSearchResults([]);
    setSearchQuery(result.label);
  };

  const handleAutoLocation = async () => {
    setIsLocating(true);
    setValidationError('');
    try {
      const loc = await getBestUserLocation();
      setMapCenter([loc.lat, loc.lon]);
      setCustomName(loc.cityName || null);
      if (loc.cityName) setSearchQuery(loc.cityName);
    } catch {
      setValidationError(t.locateError);
    } finally {
      setIsLocating(false);
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setValidationError(t.invalidCoords);
      return;
    }
    setValidationError('');
    setMapCenter([lat, lng]);
    setCustomName(null);
  };

  const handleMapPick = (latlng) => {
    // Wrap longitudes from a panned world map back into -180..180
    const lng = ((((latlng[1] + 180) % 360) + 360) % 360) - 180;
    setMapCenter([latlng[0], lng]);
    setCustomName(null);
    setValidationError('');
  };

  const handleConfirm = () => {
    onSelect(mapCenter[0], mapCenter[1], customName);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[900] flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className="flex max-h-[94vh] w-full max-w-lg animate-scale-in flex-col overflow-hidden rounded-t-3xl border border-white/[0.08] bg-ink-900 shadow-2xl shadow-black/70 sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300 ring-1 ring-brand-400/15">
              <Icon name="mapPin" className="h-4 w-4" />
            </span>
            <div>
              <h3 id="location-modal-title" className="font-display text-base font-semibold text-white">{t.locationPickerTitle}</h3>
              <p className="text-[11.5px] text-slate-500">{t.locationPickerSub}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn h-8 w-8" aria-label={t.close}>
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5 custom-scrollbar">
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-200">
              <Icon name="alert" className="h-4 w-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchLocation}
              className="field pl-9 pr-20"
              aria-label={t.searchLocation}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.14] disabled:opacity-50"
            >
              {isSearching ? <Icon name="refresh" className="h-3.5 w-3.5 animate-spin" /> : t.search}
            </button>
          </form>

          {searchResults.length > 0 && (
            <ul className="max-h-48 divide-y divide-white/[0.05] overflow-y-auto rounded-xl border border-white/[0.08] bg-ink-950/60 custom-scrollbar">
              {searchResults.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
                  >
                    <Icon name="mapPin" className="h-4 w-4 flex-shrink-0 text-brand-300" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{item.name}</span>
                      <span className="block truncate text-[11px] text-slate-500">{item.region}</span>
                    </span>
                    {item.countryCode && (
                      <span className="ml-auto font-mono text-[10px] font-semibold text-slate-500">{item.countryCode}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Coordinates */}
          <form onSubmit={handleManualSubmit} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2">
            <button
              type="button"
              onClick={handleAutoLocation}
              disabled={isLocating}
              title={t.myLocation}
              className="btn px-2.5"
            >
              <Icon name="locate" className={`h-4 w-4 text-brand-300 ${isLocating ? 'animate-spin-slow' : ''}`} />
              <span className="hidden sm:inline">{t.myLocation}</span>
            </button>
            <label className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{t.latitude}</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                className="field pb-1.5 pl-2.5 pt-4 font-mono text-xs"
                aria-label={t.latitude}
              />
            </label>
            <label className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{t.longitude}</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                className="field pb-1.5 pl-2.5 pt-4 font-mono text-xs"
                aria-label={t.longitude}
              />
            </label>
            <button type="submit" className="btn px-3">{t.go}</button>
          </form>

          {/* Map */}
          <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/[0.08] sm:h-72">
            <MapContainer center={mapCenter} zoom={10} className="h-full w-full" worldCopyJump>
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                className="map-tiles-dark"
                maxZoom={19}
              />
              <MapUpdater center={mapCenter} />
              <MapClickHandler onPick={handleMapPick} />
              <CircleMarker center={mapCenter} radius={16} pathOptions={{ color: '#22d3ee', weight: 1, fillColor: '#22d3ee', fillOpacity: 0.12 }} />
              <CircleMarker center={mapCenter} radius={6} pathOptions={{ color: '#04070d', weight: 2, fillColor: '#67e8f9', fillOpacity: 1 }} />
            </MapContainer>
            <div className="pointer-events-none absolute right-3 top-3 z-[500] rounded-lg bg-ink-950/80 px-2 py-1 text-[10.5px] text-slate-300 backdrop-blur">
              {t.mapHint}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <button type="button" onClick={handleConfirm} className="btn-primary w-full py-3">
            <Icon name="check" className="h-4 w-4" />
            {t.confirmLocation}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
