import { useMemo, useState } from "react";
import { BarChart3, Globe2, ListFilter, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { CONTINENTS, countries, countriesById } from "../data/countries";
import { getStatistics } from "../utils/stats";
import type { Continent, Country, CountryStatus, TravelAppData } from "../types";
import { WorldMap } from "./WorldMap";

type WorldPageProps = {
  data: TravelAppData;
  selectedCountryId?: string;
  onSelectCountry: (country: Country) => void;
  onSetStatus: (countryId: string, status: CountryStatus) => void;
  onClearStates: () => void;
};

export function WorldPage({ data, selectedCountryId, onSelectCountry, onSetStatus, onClearStates }: WorldPageProps) {
  const [mode, setMode] = useState<"map" | "list" | "continents">("map");
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState<"全部" | Continent>("全部");
  const [status, setStatus] = useState<"全部" | CountryStatus>("全部");
  const stats = useMemo(() => getStatistics(data), [data]);

  const filteredCountries = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return countries.filter((country) => {
      const state = data.countryStates[country.id]?.status ?? "unvisited";
      const matchKeyword =
        !keyword ||
        country.nameZh.toLowerCase().includes(keyword) ||
        country.nameEn.toLowerCase().includes(keyword) ||
        country.iso3.toLowerCase().includes(keyword);
      return matchKeyword && (continent === "全部" || country.continent === continent) && (status === "全部" || state === status);
    });
  }, [query, continent, status, data.countryStates]);

  return (
    <div className="page world-page">
      <header className="top-card">
        <div>
          <span className="micro-label">My Journey Around the World</span>
          <h1>我的世界足迹</h1>
          <p>{data.profile.nickname}，你已经点亮了 {stats.visitedCountries} 个国家和地区，足迹遍布 {stats.unlockedContinents} 个大洲。</p>
        </div>
        <div className="progress-ring" aria-label={`全球探索完成度 ${stats.completion}%`}>
          <span>{stats.completion}%</span>
        </div>
        <div className="progress-line">
          <span style={{ width: `${Math.min(100, stats.completion)}%` }} />
        </div>
      </header>

      <div className="segmented">
        <button className={mode === "map" ? "active" : ""} onClick={() => setMode("map")}><Globe2 size={16} />地图</button>
        <button className={mode === "list" ? "active" : ""} onClick={() => setMode("list")}><ListFilter size={16} />国家</button>
        <button className={mode === "continents" ? "active" : ""} onClick={() => setMode("continents")}><BarChart3 size={16} />大洲</button>
      </div>

      {mode === "map" && (
        <WorldMap
          countryStates={data.countryStates}
          records={data.records}
          selectedCountryId={selectedCountryId}
          routeVisible={data.settings.routeVisible}
          onCountrySelect={onSelectCountry}
        />
      )}

      {mode === "list" && (
        <section className="panel">
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索中文、英文或 ISO 代码" />
          </div>
          <div className="filter-row">
            <select value={continent} onChange={(event) => setContinent(event.target.value as "全部" | Continent)}>
              <option>全部</option>
              {CONTINENTS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value as "全部" | CountryStatus)}>
              <option>全部</option>
              <option value="visited">已去过</option>
              <option value="planned">计划前往</option>
              <option value="unvisited">尚未去过</option>
            </select>
            <button type="button" className="ghost-btn mini" onClick={onClearStates}><Trash2 size={15} />清空状态</button>
          </div>
          <p className="count-note">当前显示 {filteredCountries.length} 个国家和地区</p>
          <div className="country-grid">
            {filteredCountries.map((country) => {
              const state = data.countryStates[country.id]?.status ?? "unvisited";
              const cityCount = new Set(data.records.filter((record) => record.countryId === country.id).map((record) => record.cityName)).size;
              return (
                <motion.article className="country-card" key={country.id} whileTap={{ scale: 0.98 }} onClick={() => onSelectCountry(country)}>
                  <div className="country-line">
                    <span className="flag">{country.flag}</span>
                    <div>
                      <h3>{country.nameZh}</h3>
                      <p>{country.nameEn}</p>
                    </div>
                  </div>
                  <div className={`status-pill ${state}`}>{state === "visited" ? "已去过" : state === "planned" ? "计划前往" : "尚未去过"}</div>
                  <p className="small-muted">{country.continent} · {country.capital} · 已记录 {cityCount} 座城市</p>
                  <div className="quick-actions" onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => onSetStatus(country.id, "visited")}>已去过</button>
                    <button onClick={() => onSetStatus(country.id, "planned")}>想去</button>
                    <button onClick={() => onSetStatus(country.id, "unvisited")}>取消</button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {mode === "continents" && (
        <section className="continent-grid">
          {stats.continents.map((item) => {
            const visitedCountries = Object.entries(data.countryStates)
              .filter(([id, state]) => state.status === "visited" && countriesById[id]?.continent === item.name)
              .map(([id]) => countriesById[id]?.nameZh)
              .filter(Boolean)
              .slice(0, 4);
            const percent = item.total ? Math.round((item.visited / item.total) * 100) : 0;
            return (
              <article key={item.name} className="continent-card">
                <span className="continent-art">{item.name.slice(0, 1)}</span>
                <h3>{item.name}</h3>
                <p>{item.visited} / {item.total} 个国家和地区</p>
                <div className="progress-line local"><span style={{ width: `${percent}%` }} /></div>
                <p className="small-muted">探索完成度 {percent}%</p>
                <p className="small-muted">代表城市：{visitedCountries.length ? visitedCountries.join("、") : "等待第一枚印章"}</p>
              </article>
            );
          })}
        </section>
      )}

      <section className="stat-strip">
        <Stat label="已去过" value={stats.visitedCountries} />
        <Stat label="计划" value={stats.plannedCountries} />
        <Stat label="大洲" value={stats.unlockedContinents} />
        <Stat label="城市" value={stats.cities} />
        <Stat label="次数" value={stats.records} />
        <Stat label="天数" value={stats.days} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-item">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
