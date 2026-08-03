import { memo, useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Graticule, Line, Marker, ZoomableGroup } from "react-simple-maps";
import worldMap from "world-atlas/countries-110m.json";
import { RotateCcw } from "lucide-react";
import { countriesById, findCountryByMapFeature } from "../data/countries";
import type { Country, CountryTravelState, TravelRecord } from "../types";

type WorldMapProps = {
  countryStates: Record<string, CountryTravelState>;
  records: TravelRecord[];
  selectedCountryId?: string;
  routeVisible: boolean;
  onCountrySelect: (country: Country) => void;
};

const statusClass = {
  visited: "map-visited",
  planned: "map-planned",
  unvisited: "map-unvisited",
};

function cityPoint(record: TravelRecord, fallback: [number, number], index: number): [number, number] {
  const known: Record<string, [number, number]> = {
    北京: [116.4074, 39.9042],
    上海: [121.4737, 31.2304],
    东京: [139.6503, 35.6762],
    京都: [135.7681, 35.0116],
    曼谷: [100.5018, 13.7563],
    新加坡: [103.8198, 1.3521],
    巴黎: [2.3522, 48.8566],
    罗马: [12.4964, 41.9028],
    悉尼: [151.2093, -33.8688],
    纽约: [-74.006, 40.7128],
  };
  if (known[record.cityName]) return known[record.cityName];
  const [lat, lng] = fallback;
  return [lng + ((index % 3) - 1) * 3, lat + ((index % 2) - 0.5) * 2];
}

function WorldMapComponent({ countryStates, records, selectedCountryId, routeVisible, onCountrySelect }: WorldMapProps) {
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [12, 22],
    zoom: 1,
  });
  const [hovered, setHovered] = useState<Country | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const routePoints = useMemo(() => {
    return records
      .slice()
      .sort((a, b) => (a.arrivalDate || a.createdAt).localeCompare(b.arrivalDate || b.createdAt))
      .slice(0, 80)
      .map((record, index) => {
        const country = findCountryForRecord(record);
        return {
          record,
          country,
          coordinates: cityPoint(record, country?.latlng ?? [0, 0], index),
        };
      })
      .filter((item) => item.country);
  }, [records]);

  return (
    <section className="map-panel" aria-label="世界地图">
      <div className="map-toolbar">
        <div>
          <span className="micro-label">Map mode</span>
          <strong>平面世界地图</strong>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setPosition({ coordinates: [12, 22], zoom: 1 })}
          title="恢复默认视图"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <div className="map-canvas">
        <ComposableMap projectionConfig={{ rotate: [-8, 0, 0], scale: 152 }} width={900} height={520}>
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={0.9}
            maxZoom={6}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          >
            <Graticule stroke="rgba(157, 196, 214, .16)" />
            <Geographies geography={worldMap}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const country = findCountryByMapFeature(geo);
                  const state = country ? countryStates[country.id] : undefined;
                  const status = state?.status ?? "unvisited";
                  const selected = country?.id === selectedCountryId;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={`map-country ${statusClass[status]} ${selected ? "selected" : ""}`}
                      tabIndex={country ? 0 : -1}
                      onPointerDown={(event) => {
                        pointerStart.current = { x: event.clientX, y: event.clientY };
                      }}
                      onPointerUp={(event) => {
                        if (!country || !pointerStart.current) return;
                        const moved = Math.hypot(
                          event.clientX - pointerStart.current.x,
                          event.clientY - pointerStart.current.y,
                        );
                        pointerStart.current = null;
                        if (moved <= 6) onCountrySelect(country);
                      }}
                      onMouseEnter={() => country && setHovered(country)}
                      onMouseLeave={() => setHovered(null)}
                      onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && country) onCountrySelect(country);
                      }}
                      aria-label={country ? `${country.nameZh} ${country.nameEn}` : "未匹配区域"}
                    />
                  );
                })
              }
            </Geographies>

            {routeVisible &&
              routePoints.slice(1).map((point, index) => (
                <Line
                  key={`${point.record.id}-line`}
                  from={routePoints[index].coordinates}
                  to={point.coordinates}
                  stroke="rgba(74, 200, 224, .72)"
                  strokeWidth={1.6 / position.zoom}
                  strokeLinecap="round"
                />
              ))}

            {routeVisible &&
              routePoints.map((point, index) => (
                <Marker key={point.record.id} coordinates={point.coordinates}>
                  <circle r={Math.max(2.8, 4.8 / position.zoom)} className="route-dot" />
                  {position.zoom > 2.1 && (
                    <text y={-8} textAnchor="middle" className="route-label">
                      {index + 1}
                    </text>
                  )}
                </Marker>
              ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="map-hint">
        {hovered ? `${hovered.flag} ${hovered.nameZh} · ${hovered.nameEn}` : "拖拽和双指缩放地图，点击国家管理足迹"}
      </div>
    </section>
  );
}

function findCountryForRecord(record: TravelRecord) {
  return countriesById[record.countryId];
}

export const WorldMap = memo(WorldMapComponent);
