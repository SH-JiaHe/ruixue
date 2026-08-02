import { Download, FileJson, Info, Moon, Shield, Sun, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { CONTINENTS, countriesById } from "../data/countries";
import { exportJson, validateImport } from "../utils/storage";
import { getStatistics } from "../utils/stats";
import type { CountryStatus, TravelAppData, TravelPlan } from "../types";

type ProfilePageProps = {
  data: TravelAppData;
  onDataChange: (data: TravelAppData) => void;
  onToast: (message: string) => void;
  onClearAll: () => void;
  onSetStatus: (countryId: string, status: CountryStatus) => void;
};

export function ProfilePage({ data, onDataChange, onToast, onClearAll, onSetStatus }: ProfilePageProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(data.profile);
  const stats = getStatistics(data);
  const plans = [...data.plans].sort((a, b) => {
    const priority = { 高: 0, 中: 1, 低: 2 };
    return priority[a.priority] - priority[b.priority];
  });

  async function importData(file?: File) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!validateImport(parsed)) {
        onToast("导入失败：JSON 格式不符合旅行数据结构");
        return;
      }
      onDataChange(parsed);
      onToast("导入成功，数据已覆盖");
    } catch {
      onToast("导入失败：文件不是有效 JSON");
    }
  }

  function addPlan() {
    const firstPlanned = Object.entries(data.countryStates).find(([, state]) => state.status === "planned")?.[0] ?? "JPN";
    const plan: TravelPlan = {
      id: crypto.randomUUID(),
      countryId: firstPlanned,
      cityName: "新的目的地",
      plannedYear: String(new Date().getFullYear() + 1),
      reason: "想把这里加入下一段旅程。",
      experiences: "写下想体验的事",
      priority: "中",
      status: "想去",
    };
    onDataChange({ ...data, plans: [plan, ...data.plans] });
    onSetStatus(plan.countryId, "planned");
    onToast("愿望已添加");
  }

  function updatePlan(plan: TravelPlan) {
    const plans = data.plans.map((item) => (item.id === plan.id ? plan : item));
    onDataChange({ ...data, plans });
    if (plan.status === "已完成") onSetStatus(plan.countryId, "visited");
  }

  return (
    <div className="page">
      <header className="profile-hero">
        <div className="avatar">{data.profile.avatar ? <img src={data.profile.avatar} alt="头像" /> : data.profile.nickname.slice(0, 1)}</div>
        <div>
          <span className="micro-label">Traveler profile</span>
          <h1>{data.profile.nickname}</h1>
          <p>{data.profile.tagline}</p>
          <p className="small-muted">{data.profile.homeCity} · {data.profile.travelMotto}</p>
        </div>
      </header>

      <section className="stat-strip profile">
        <Stat label="国家" value={stats.visitedCountries} />
        <Stat label="大洲" value={stats.unlockedContinents} />
        <Stat label="天数" value={stats.days} />
      </section>

      <section className="panel">
        <h2>个人资料</h2>
        <div className="form-grid">
          <label>昵称<input value={draft.nickname} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} /></label>
          <label>个性标签<input value={draft.tagline} onChange={(event) => setDraft({ ...draft, tagline: event.target.value })} /></label>
          <label>常住城市<input value={draft.homeCity ?? ""} onChange={(event) => setDraft({ ...draft, homeCity: event.target.value })} /></label>
          <label>最喜欢的国家<input value={draft.favoriteCountry ?? ""} onChange={(event) => setDraft({ ...draft, favoriteCountry: event.target.value })} /></label>
          <label>最喜欢的城市<input value={draft.favoriteCity ?? ""} onChange={(event) => setDraft({ ...draft, favoriteCity: event.target.value })} /></label>
          <label>旅行座右铭<input value={draft.travelMotto} onChange={(event) => setDraft({ ...draft, travelMotto: event.target.value })} /></label>
        </div>
        <button className="primary-btn full" onClick={() => { onDataChange({ ...data, profile: draft }); onToast("个人资料已保存"); }}>保存资料</button>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>想去的地方</h2>
          <button className="small-action" onClick={addPlan}>添加愿望</button>
        </div>
        <div className="filter-row">
          {CONTINENTS.map((continent) => <span className="tiny-chip" key={continent}>{continent}</span>)}
        </div>
        <div className="plan-list">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.id}>
              <div>
                <h3>{countriesById[plan.countryId]?.flag} {countriesById[plan.countryId]?.nameZh} · {plan.cityName}</h3>
                <p>{plan.plannedYear} · {plan.priority}优先级 · {plan.status}</p>
                <p>{plan.reason}</p>
              </div>
              <select value={plan.status} onChange={(event) => updatePlan({ ...plan, status: event.target.value as TravelPlan["status"] })}>
                <option>想去</option>
                <option>正在计划</option>
                <option>已预订</option>
                <option>已完成</option>
              </select>
              <button className="ghost-btn mini" onClick={() => onDataChange({ ...data, plans: data.plans.filter((item) => item.id !== plan.id) })}>删除</button>
            </article>
          ))}
        </div>
      </section>

      <section className="settings-grid">
        <button onClick={() => onDataChange({ ...data, settings: { ...data.settings, theme: data.settings.theme === "dark" ? "light" : "dark" } })}>
          {data.settings.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          切换深浅色
        </button>
        <button onClick={() => exportJson(data)}><Download size={18} />导出旅行数据</button>
        <button onClick={() => fileRef.current?.click()}><Upload size={18} />导入旅行数据</button>
        <button onClick={onClearAll}><Trash2 size={18} />清除全部数据</button>
        <button onClick={() => onToast("数据说明：国家使用 ISO Alpha-3 作为主键，照片以压缩 DataURL 保存在 localStorage。")}><Info size={18} />数据说明</button>
        <button onClick={() => onToast("隐私说明：本应用无后端、无登录，旅行记录只保存在当前浏览器。")}><Shield size={18} />隐私说明</button>
      </section>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(event) => importData(event.target.files?.[0])} />
      <p className="small-muted data-note"><FileJson size={14} /> 导入前会校验版本、资料、国家状态、记录和愿望清单结构。</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="stat-item"><strong>{value}</strong><span>{label}</span></div>;
}
