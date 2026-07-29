import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, MapLayerType, Report } from '@/store/useMapStore';
import { useAuthStore, isDevUser as checkIsDevUser, hasMapMarkPermission } from '@/store/useAuthStore';
import { Layers, X, MapPin, Globe } from 'lucide-react';
import { setupMapLayers } from './setupMapLayers';

const MAP_STYLES: Record<string, { style: any; label: string }> = {
  dark: {
    label: '🌙 Mode Gelap',
    style: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  streets: {
    label: '🗺️ Mode Jalan',
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  satellite: {
    label: '🛰️ Mode Terang',
    style: {
      version: 8,
      sources: {
        'carto-light': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-light-layer',
          type: 'raster',
          source: 'carto-light',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  }
};

const CATEGORY_ICONS: Record<string, string> = {
  BANJIR: '🌊',
  LONGSOR: '⛰️',
  GEMPA: '🌍',
  KEBAKARAN: '🔥',
  TSUNAMI: '🌊',
  ANGIN_PUTING_BELIUNG: '🌪️',
  LAINNYA: '⚠️',
};

const STATUS_COLORS: Record<string, string> = {
  UNVERIFIED: '#ef4444',
  NEEDS_REVIEW: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#10b981',
  ARCHIVED: '#64748b'
};

export const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const domMarkersRef = useRef<maplibregl.Marker[]>([]);

  const { user } = useAuthStore();
  const canMarkMap = hasMapMarkPermission(user);

  const store = useMapStore();
  const reports = store.reports || [];
  const activeLayer = store.activeLayer || 'dark';
  const setSelectedReport = store.setSelectedReport || store.setSelectedReportId;
  const setIsDrawerOpen = store.setIsDrawerOpen;
  const setIsFormOpen = store.setIsFormOpen;
  const setManualCoords = store.setManualCoords;
  const setActiveLayer = store.setActiveLayer;

  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  const onReportClickRef = useRef((report: Report) => {
    if (typeof setSelectedReport === 'function') setSelectedReport(report);
    if (typeof setIsDrawerOpen === 'function') setIsDrawerOpen(true);
  });

  useEffect(() => {
    onReportClickRef.current = (report: Report) => {
      if (typeof setSelectedReport === 'function') setSelectedReport(report);
      if (typeof setIsDrawerOpen === 'function') setIsDrawerOpen(true);
    };
  }, [setSelectedReport, setIsDrawerOpen]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initialStyle = MAP_STYLES[activeLayer]?.style || MAP_STYLES.dark.style;

    const map = new (maplibregl as any).Map({
      container: mapRef.current,
      style: initialStyle,
      center: [118.0, -2.5],
      zoom: 4.8,
      pitch: 0,
      projection: { type: 'mercator' },
      antialias: true,
      maxZoom: 19,
      attributionControl: false,
    }) as maplibregl.Map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('click', (e) => {
      const currentUser = useAuthStore.getState().user;
      const authorized = hasMapMarkPermission(currentUser);

      if (authorized) {
        setManualCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        setIsFormOpen(true);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    setTimeout(() => {
      try {
        map.resize();
      } catch (_) {}
    }, 150);

    mapInstance.current = map;

    return () => {
      resizeObserver.disconnect();
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const targetStyle = MAP_STYLES[activeLayer]?.style || MAP_STYLES.dark.style;

    const renderAllMarkers = () => {
      if (!mapInstance.current) return;

      setupMapLayers(mapInstance.current, reports, (r) => onReportClickRef.current(r), false);

      domMarkersRef.current.forEach((m) => m.remove());
      domMarkersRef.current = [];

      (reports || []).forEach((report) => {
        const lng = Number(report.longitude);
        const lat = Number(report.latitude);
        if (isNaN(lng) || isNaN(lat)) return;

        const catKey = (report.category || 'LAINNYA').toUpperCase();
        const icon = CATEGORY_ICONS[catKey] || '⚠️';
        const color = STATUS_COLORS[report.status] || '#ef4444';

        const el = document.createElement('div');
        el.className = 'gosiaga-dom-marker group cursor-pointer relative flex flex-col items-center select-none';
        el.style.zIndex = '100';

        el.innerHTML = `
          <div class="relative flex items-center justify-center p-2 rounded-2xl bg-slate-900/90 border-2 text-white shadow-2xl backdrop-blur-md transition-all group-hover:scale-125 group-hover:-translate-y-1" style="border-color: ${color}">
            <span class="text-base leading-none">${icon}</span>
            <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping opacity-75" style="background-color: ${color}"></span>
            <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full" style="background-color: ${color}"></span>
          </div>
          <div class="mt-1 px-2 py-0.5 bg-slate-900/90 text-[10px] font-extrabold text-white rounded-lg border border-slate-700 shadow-md whitespace-nowrap max-w-[120px] truncate group-hover:max-w-none group-hover:whitespace-normal">
            ${report.title || 'Bencana'}
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          mapInstance.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });
          onReportClickRef.current(report);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);

        domMarkersRef.current.push(marker);
      });
    };

    mapInstance.current.setStyle(targetStyle);

    renderAllMarkers();

    mapInstance.current.once('style.load', renderAllMarkers);
    mapInstance.current.once('styledata', renderAllMarkers);
    mapInstance.current.once('idle', renderAllMarkers);
  }, [activeLayer, reports]);

  const toggle3DMode = () => {
    if (!mapInstance.current) return;
    const nextState = !is3DMode;
    setIs3DMode(nextState);

    try {
      if (nextState) {
        (mapInstance.current as any).setProjection({ type: 'globe' });
        mapInstance.current.easeTo({ pitch: 45, duration: 600 });
      } else {
        (mapInstance.current as any).setProjection({ type: 'mercator' });
        mapInstance.current.easeTo({ pitch: 0, duration: 600 });
      }
    } catch (_) {}
  };

  return (
    <section className="relative w-full h-full min-h-[500px] overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full min-h-[500px] z-0 bg-slate-950" />

      {canMarkMap && (
        <aside className="absolute top-3 left-3 sm:top-6 sm:left-6 z-[1000] flex items-center gap-2 max-w-[calc(100vw-120px)] sm:max-w-md">
          <article className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl sm:rounded-2xl border border-red-500/30 shadow-xl flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-200">
            <MapPin className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
            <span className="truncate">Otoritas Akses: Klik lokasi mana saja di peta untuk tandai bencana tanpa GPS</span>
          </article>
        </aside>
      )}

      <aside className="absolute top-3 right-3 sm:top-6 sm:right-6 z-[1000] flex items-center gap-2">
        <button
          onClick={toggle3DMode}
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border flex items-center gap-2 transition-all font-bold text-xs ${
            is3DMode
              ? 'bg-blue-600 border-blue-500 text-white shadow-blue-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
          title="Alihkan Tampilan 2D (Ringan) / 3D"
        >
          <Globe className={`w-4 h-4 sm:w-5 sm:h-5 ${is3DMode ? 'animate-spin' : 'text-blue-500'}`} />
          <span className="hidden sm:inline">{is3DMode ? 'Mode 3D (Aktif)' : 'Mode 2D (Ringan)'}</span>
        </button>

        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="hidden sm:inline">Layer Peta</span>
        </button>

        {showLayerSelector && (
          <nav className="absolute right-0 top-12 mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-2">
            <header className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-500">Pilih Tampilan</span>
              <button onClick={() => setShowLayerSelector(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </header>
            {Object.entries(MAP_STYLES).map(([id, layer]) => (
              <button
                key={id}
                onClick={() => {
                  if (typeof setActiveLayer === 'function') setActiveLayer(id as MapLayerType);
                  setShowLayerSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayer === id
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </nav>
        )}
      </aside>
    </section>
  );
};