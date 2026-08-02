import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, BookOpen, Camera, Compass, Globe2, Landmark, NotebookPen, Plane, RefreshCcw, Route, Sparkles, Stamp, Sun, Trophy, User, Waves } from "lucide-react";
import { useMemo } from "react";
import { countriesById } from "../data/countries";
import { generateTravelSentence, getAchievements, getStatistics } from "../utils/stats";
import type { TravelAppData } from "../types";
import { Poster } from "./Poster";

type AchievementsPageProps = {
  data: TravelAppData;
  onToast: (message: string) => void;
};

const iconMap = { Award, BookOpen, Camera, Compass, Globe2, Landmark, NotebookPen, Plane, RefreshCcw, Route, Sparkles, Stamp, Sun, Trophy, User, Waves };

export function AchievementsPage({ data, onToast }: AchievementsPageProps) {
  const stats = useMemo(() => getStatistics(data), [data]);
  const achievements = useMemo(() => getAchievements(data), [data]);
  const transportData = Object.entries(
    data.records.reduce<Record<string, number>>((acc, record) => {
      acc[record.transport] = (acc[record.transport] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const topCountries = Object.entries(data.countryStates)
    .filter(([, state]) => state.status === "visited")
    .map(([id, state]) => ({ name: countriesById[id]?.nameZh ?? id, value: state.visitCount || 1 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="page">
      <header className="page-head">
        <span className="micro-label">Milestones & report</span>
        <h1>成就与报告</h1>
        <p>{generateTravelSentence(data)}</p>
      </header>

      <section className="report-panel">
        <div className="report-grid">
          <Metric label="国家和地区" value={stats.visitedCountries} />
          <Metric label="大洲" value={stats.unlockedContinents} />
          <Metric label="城市" value={stats.cities} />
          <Metric label="旅行天数" value={stats.days} />
        </div>
        <div className="chart-card">
          <h3>各大洲点亮数</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.continents}>
              <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 11 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="visited" radius={[8, 8, 0, 0]} fill="#d9a441" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-row">
          <div className="chart-card small">
            <h3>交通方式</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={transportData.length ? transportData : [{ name: "暂无", value: 1 }]} dataKey="value" innerRadius={38} outerRadius={58}>
                  {(transportData.length ? transportData : [{ name: "暂无", value: 1 }]).map((entry, index) => (
                    <Cell key={entry.name} fill={["#4ac8e0", "#ee8b54", "#d9a441", "#6d7edb"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card small">
            <h3>国家访问排行</h3>
            {(topCountries.length ? topCountries : [{ name: "暂无记录", value: 0 }]).map((item) => (
              <p key={item.name} className="rank-line"><span>{item.name}</span><strong>{item.value}</strong></p>
            ))}
          </div>
        </div>
      </section>

      <section className="achievement-grid">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon as keyof typeof iconMap] ?? Award;
          const percent = Math.round((achievement.progress / achievement.target) * 100);
          return (
            <article key={achievement.id} className={achievement.unlocked ? "achievement-card unlocked" : "achievement-card"}>
              <div className="achievement-icon"><Icon size={20} /></div>
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              <div className="progress-line local"><span style={{ width: `${Math.min(100, percent)}%` }} /></div>
              <p className="small-muted">{achievement.progress} / {achievement.target}{achievement.unlockedAt ? ` · ${achievement.unlockedAt} 解锁` : ""}</p>
            </article>
          );
        })}
      </section>

      <Poster data={data} onToast={onToast} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
