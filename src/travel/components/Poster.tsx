import { toPng } from "html-to-image";
import { Download, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { countriesById } from "../data/countries";
import { generateTravelSentence, getStatistics } from "../utils/stats";
import type { PosterTheme, TravelAppData } from "../types";

const themes: PosterTheme[] = ["星空蓝", "护照复古", "暖白旅行手记", "落日橙", "极简世界地图"];

type PosterProps = {
  data: TravelAppData;
  onToast: (message: string) => void;
};

export function Poster({ data, onToast }: PosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<PosterTheme>("星空蓝");
  const stats = useMemo(() => getStatistics(data), [data]);
  const topMemories = data.records.slice(0, 3);
  const sentence = generateTravelSentence(data);

  async function downloadPoster() {
    if (!posterRef.current) return;
    try {
      const url = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: theme === "暖白旅行手记" || theme === "极简世界地图" ? "#f7f1e4" : "#07192f",
        filter: (node) => !(node instanceof HTMLElement && node.dataset.excludePoster === "true"),
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `我的世界足迹海报-${theme}.png`;
      a.click();
      onToast("海报已生成并开始下载");
    } catch {
      onToast("海报截图失败，已保留备用海报预览");
    }
  }

  return (
    <section className="poster-section">
      <div className="section-title-row">
        <div>
          <span className="micro-label">Share poster</span>
          <h2>分享海报</h2>
        </div>
        <button type="button" className="small-action" onClick={downloadPoster}><Download size={16} />下载PNG</button>
      </div>
      <div className="theme-row" data-exclude-poster="true">
        {themes.map((item) => (
          <button key={item} className={theme === item ? "theme-chip active" : "theme-chip"} onClick={() => setTheme(item)}>
            {item}
          </button>
        ))}
        <button className="theme-chip" onClick={() => onToast("已重新生成当前旅行总结")}><RefreshCw size={14} />重新生成</button>
      </div>
      <div className={`poster-card poster-${theme}`} ref={posterRef}>
        <div className="poster-map" aria-hidden="true">
          {Object.entries(data.countryStates)
            .filter(([, state]) => state.status === "visited")
            .slice(0, 24)
            .map(([id], index) => {
              const country = countriesById[id];
              return <span key={id} style={{ left: `${8 + (index * 17) % 78}%`, top: `${18 + (index * 23) % 58}%` }}>{country?.flag}</span>;
            })}
        </div>
        <span className="poster-kicker">My Journey Around the World</span>
        <h2>我的世界足迹</h2>
        <p>{data.profile.nickname}</p>
        <div className="poster-stats">
          <strong>{stats.visitedCountries}<span>国家</span></strong>
          <strong>{stats.unlockedContinents}<span>大洲</span></strong>
          <strong>{stats.cities}<span>城市</span></strong>
        </div>
        <p className="poster-sentence">{sentence}</p>
        <div className="poster-memories">
          {topMemories.length ? topMemories.map((record) => (
            <span key={record.id}>{countriesById[record.countryId]?.flag} {record.cityName}</span>
          )) : <span>等待第一段旅程</span>}
        </div>
        <footer>
          <span>{new Date().toLocaleDateString("zh-CN")}</span>
          <span>世界很大，而我的故事正在发生</span>
        </footer>
      </div>
    </section>
  );
}
