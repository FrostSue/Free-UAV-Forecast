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
      className="fixed inset-0 z-[900] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className="flex max-h-[94vh] w-full max-w-xl animate-fade-in flex-col border border-ink bg-paper shadow-[0_24px_60px_-24px_rgba(22,21,15,0.5)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-ink px-5 py-4">
          <div>
            <h3 id="location-modal-title" className="font-cond text-[20px] font-bold uppercase tracking-[0.04em]">{t.locationPickerTitle}</h3>
            <p className="text-[13px] text-ink-soft">{t.locationPickerSub}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center text-ink-soft hover:text-ink" aria-label={t.close}>
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="thin-scrollbar flex-1 space-y-4 overflow-y-auto p-5">
          {validationError && (
            <div className="flex items-center gap-2 border-l-4 border-nogo bg-nogo-soft px-3 py-2 text-[13px] text-nogo">
              <Icon name="alert" className="h-4 w-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchLocation}
                className="field border-ink pl-9"
                aria-label={t.searchLocation}
              />
            </div>
            <button type="submit" disabled={isSearching} className="btn-solid -ml-px min-w-[84px] py-0">
              {isSearching ? <Icon name="refresh" className="h-4 w-4 animate-spin" /> : t.search}
            </button>
          </form>

          {searchResults.length > 0 && (
            <ul className="thin-scrollbar max-h-52 overflow-y-auto border border-ink">
              {searchResults.map(item => (
                <li key={item.id} className="border-b border-rule last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="flex w-full items-baseline gap-3 px-3 py-2.5 text-left transition-colors hover:bg-paper-deep"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{item.name}</span>
                      <span className="block truncate text-[12px] text-ink-faint">{item.region}</span>
                    </span>
                    {item.countryCode && <span className="font-mono text-[11px] text-ink-faint">{item.countryCode}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Coordinates */}
          <form onSubmit={handleManualSubmit} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <label>
              <span className="label mb-1 block">{t.latitude}</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                className="field py-2 font-mono text-[13px]"
              />
            </label>
            <label>
              <span className="label mb-1 block">{t.longitude}</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                className="field py-2 font-mono text-[13px]"
              />
            </label>
            <button type="submit" className="btn h-[38px]">{t.go}</button>
          </form>

          <button
            type="button"
            onClick={handleAutoLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 text-[13px] font-medium underline decoration-rule underline-offset-4 hover:decoration-ink disabled:opacity-50"
          >
            <Icon name="locate" className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
            {t.myLocation}
          </button>

          {/* Map */}
          <div className="relative h-64 w-full border border-ink sm:h-72">
            <MapContainer center={mapCenter} zoom={10} className="h-full w-full" worldCopyJump>
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                maxZoom={19}
              />
              <MapUpdater center={mapCenter} />
              <MapClickHandler onPick={handleMapPick} />
              <CircleMarker center={mapCenter} radius={14} pathOptions={{ color: '#e8550f', weight: 2, fillOpacity: 0 }} />
              <CircleMarker center={mapCenter} radius={4} pathOptions={{ color: '#16150f', weight: 0, fillColor: '#16150f', fillOpacity: 1 }} />
            </MapContainer>
            <div className="pointer-events-none absolute right-2 top-2 z-[500] border border-ink bg-paper px-2 py-1 text-[11.5px]">
              {t.mapHint}
            </div>
          </div>
        </div>

        <div className="border-t border-ink p-4">
          <button type="button" onClick={handleConfirm} className="btn-solid w-full py-3">
            {t.confirmLocation}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;