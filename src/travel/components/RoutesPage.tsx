import { MapPinned, Plane, Route } from "lucide-react";
import { countriesById } from "../data/countries";
import { getSortedRecords } from "../utils/stats";
import type { TravelAppData } from "../types";
import { WorldMap } from "./WorldMap";

type RoutesPageProps = {
  data: TravelAppData;
  onRouteVisibleChange: (visible: boolean) => void;
};

export function RoutesPage({ data, onRouteVisibleChange }: RoutesPageProps) {
  const records = getSortedRecords(data.records);
  return (
    <div className="page">
      <header className="page-head">
        <span className="micro-label">Global route</span>
        <h1>旅行路线</h1>
        <p>按记录串联城市，用航线把世界上的记忆连起来；未补充日期的素材会保留在路线中。</p>
      </header>
      <label className="switch-row panel">
        <span><Route size={18} /> 世界路线视图</span>
        <input type="checkbox" checked={data.settings.routeVisible} onChange={(event) => onRouteVisibleChange(event.target.checked)} />
      </label>
      <WorldMap countryStates={data.countryStates} records={data.records} routeVisible={data.settings.routeVisible} onCountrySelect={() => {}} />
      {records.length === 0 ? (
        <div className="empty-state">
          <MapPinned size={26} />
          <p>你的下一段旅程，会从世界的哪一个角落开始？</p>
        </div>
      ) : (
        <div className="timeline">
          {records.map((record, index) => {
            const country = countriesById[record.countryId];
            return (
              <article className="timeline-item" key={record.id}>
                <div className="timeline-node"><Plane size={16} /></div>
                <div>
                  <span className="micro-label">{formatRouteDate(record.arrivalDate)} · 第 {index + 1} 站</span>
                  <h3>{country?.flag} {country?.nameZh} · {record.cityName}</h3>
                  <p>{formatRouteDate(record.arrivalDate)} · {record.transport} · {record.summary}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatRouteDate(date: string) {
  return date ? `${new Date(date).getFullYear()}` : "日期待补充";
}
