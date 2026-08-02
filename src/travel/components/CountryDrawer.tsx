import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, Heart, Plane, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { moods, transportModes, travelTypes } from "../data/demo";
import { compressImage } from "../utils/image";
import type { Country, CountryTravelState, TravelRecord, TravelType, TransportMode } from "../types";

type CountryDrawerProps = {
  country: Country | null;
  state?: CountryTravelState;
  records: TravelRecord[];
  onClose: () => void;
  onStatusChange: (countryId: string, status: CountryTravelState["status"]) => void;
  onImpressionChange: (countryId: string, impression: string) => void;
  onSaveRecord: (record: TravelRecord) => void;
  onDeleteRecord: (record: TravelRecord) => void;
};

const emptyRecord = (countryId: string): TravelRecord => ({
  id: crypto.randomUUID(),
  countryId,
  cityName: "",
  cityNameEn: "",
  arrivalDate: "",
  departureDate: "",
  days: 1,
  companions: "",
  transport: "飞机",
  travelType: "自由行",
  favoritePlace: "",
  summary: "",
  story: "",
  moodTags: [],
  revisit: false,
  createdAt: new Date().toISOString(),
});

export function CountryDrawer({
  country,
  state,
  records,
  onClose,
  onStatusChange,
  onImpressionChange,
  onSaveRecord,
  onDeleteRecord,
}: CountryDrawerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<TravelRecord | null>(null);
  const [error, setError] = useState("");
  const [impression, setImpression] = useState("");

  useEffect(() => {
    if (country) {
      setFormOpen(false);
      setForm(null);
      setError("");
      setImpression(state?.impression ?? "");
    }
  }, [country, state?.impression]);

  const countryRecords = useMemo(
    () => (country ? records.filter((record) => record.countryId === country.id) : []),
    [country, records],
  );

  if (!country) return null;

  const currentStatus = state?.status ?? "unvisited";
  const firstVisit = countryRecords.map((record) => record.arrivalDate).filter(Boolean).sort()[0] ?? "尚未记录";
  const latestVisit = countryRecords.map((record) => record.departureDate).filter(Boolean).sort().at(-1) ?? "尚未记录";
  const days = countryRecords.reduce((sum, record) => sum + record.days, 0);

  async function handlePhoto(file?: File) {
    if (!file || !form) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("图片过大，建议选择 8MB 以下的照片。");
      return;
    }
    const photo = await compressImage(file);
    setForm({ ...form, photo, photos: [photo] });
  }

  function submitRecord() {
    if (!form || !country) return;
    if (!form.cityName.trim()) {
      setError("请填写城市名称。");
      return;
    }
    if (!form.arrivalDate || !form.departureDate) {
      setError("请填写抵达和离开日期。");
      return;
    }
    if (form.departureDate < form.arrivalDate) {
      setError("离开日期不能早于抵达日期。");
      return;
    }
    const days = Math.max(
      1,
      Math.round((new Date(form.departureDate).getTime() - new Date(form.arrivalDate).getTime()) / 86400000) + 1,
    );
    onSaveRecord({ ...form, days, summary: form.summary.trim() || `${form.cityName}的一段旅行回忆` });
    onStatusChange(country.id, "visited");
    setFormOpen(false);
    setForm(null);
    setError("");
  }

  return (
    <AnimatePresence>
      <div className="drawer-layer">
        <button className="drawer-scrim" type="button" onClick={onClose} aria-label="关闭国家详情" />
        <motion.aside
          className="country-drawer"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
        >
          <div className="drawer-handle" />
          <div className="drawer-head">
            <div>
              <span className="flag-xl">{country.flag}</span>
              <h2>{country.nameZh}</h2>
              <p>
                {country.nameEn} · {country.iso3} · {country.continent}
              </p>
            </div>
            <button className="icon-btn" type="button" onClick={onClose} title="关闭">
              <X size={18} />
            </button>
          </div>

          <div className="status-grid">
            <button className={currentStatus === "visited" ? "status-btn active visited" : "status-btn"} onClick={() => onStatusChange(country.id, "visited")}>
              <Check size={16} />
              已去过
            </button>
            <button className={currentStatus === "planned" ? "status-btn active planned" : "status-btn"} onClick={() => onStatusChange(country.id, "planned")}>
              <Heart size={16} />
              计划前往
            </button>
            <button className={currentStatus === "unvisited" ? "status-btn active" : "status-btn"} onClick={() => onStatusChange(country.id, "unvisited")}>
              <X size={16} />
              尚未去过
            </button>
          </div>

          <div className="mini-stats">
            <span>首都<strong>{country.capital}</strong></span>
            <span>到访<strong>{state?.visitCount ?? countryRecords.length}</strong></span>
            <span>城市<strong>{new Set(countryRecords.map((record) => record.cityName)).size}</strong></span>
            <span>天数<strong>{days}</strong></span>
          </div>

          <label className="field-block">
            <span>一句话国家印象</span>
            <textarea
              value={impression}
              onChange={(event) => setImpression(event.target.value)}
              onBlur={() => onImpressionChange(country.id, impression)}
              placeholder="例如：黄昏、铁道、街角咖啡和一枚新的护照章。"
            />
          </label>

          <div className="record-summary">
            <p>首次到访：{firstVisit}</p>
            <p>最近到访：{latestVisit}</p>
          </div>

          <div className="section-title-row">
            <h3>旅行回忆</h3>
            <button
              type="button"
              className="small-action"
              onClick={() => {
                setForm(emptyRecord(country.id));
                setFormOpen(true);
              }}
            >
              <Plus size={16} />
              添加
            </button>
          </div>

          {countryRecords.length === 0 ? (
            <div className="empty-state compact">
              <Plane size={22} />
              <p>还没有这片土地的回忆。添加第一段旅程，让它在地图上亮起来。</p>
            </div>
          ) : (
            <div className="memory-list compact-list">
              {countryRecords.map((record) => (
                <article key={record.id} className="memory-card">
                  <div className="photo-box">
                    {getRecordPhotos(record)[0] ? <img src={getRecordPhotos(record)[0]} alt={`${record.cityName}旅行照片`} /> : <Camera size={22} />}
                  </div>
                  <div>
                    <h4>{record.cityName}</h4>
                    <p>{formatRecordTime(record)} · {record.days ? `${record.days}天 · ` : ""}{record.transport}</p>
                    <p>{record.summary}</p>
                    <div className="tag-row">{record.moodTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    {getRecordPhotos(record).length > 1 && (
                      <div className="photo-strip compact-strip" aria-label={`${record.cityName}照片集`}>
                        {getRecordPhotos(record).slice(0, 5).map((photo, index) => (
                          <img key={photo} src={photo} alt={`${record.cityName}旅行照片 ${index + 1}`} />
                        ))}
                        {getRecordPhotos(record).length > 5 && <span>+{getRecordPhotos(record).length - 5}</span>}
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button type="button" onClick={() => { setForm(record); setFormOpen(true); }} title="编辑记录">
                      <Save size={16} />
                    </button>
                    <button type="button" onClick={() => onDeleteRecord(record)} title="删除记录">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <AnimatePresence>
            {formOpen && form && (
              <motion.div className="record-form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-title-row">
                  <h3>{records.some((item) => item.id === form.id) ? "编辑旅行记录" : "添加旅行记录"}</h3>
                  <button className="icon-btn" type="button" onClick={() => setFormOpen(false)} title="收起表单">
                    <X size={16} />
                  </button>
                </div>
                <div className="form-grid">
                  <label>
                    城市名称
                    <input value={form.cityName} onChange={(event) => setForm({ ...form, cityName: event.target.value })} />
                  </label>
                  <label>
                    城市英文名
                    <input value={form.cityNameEn} onChange={(event) => setForm({ ...form, cityNameEn: event.target.value })} />
                  </label>
                  <label>
                    抵达日期
                    <input type="date" value={form.arrivalDate} onChange={(event) => setForm({ ...form, arrivalDate: event.target.value })} />
                  </label>
                  <label>
                    离开日期
                    <input type="date" value={form.departureDate} onChange={(event) => setForm({ ...form, departureDate: event.target.value })} />
                  </label>
                  <label>
                    同行的人
                    <input value={form.companions} onChange={(event) => setForm({ ...form, companions: event.target.value })} placeholder="朋友、家人、一个人" />
                  </label>
                  <label>
                    交通方式
                    <select value={form.transport} onChange={(event) => setForm({ ...form, transport: event.target.value as TransportMode })}>
                      {transportModes.map((mode) => <option key={mode}>{mode}</option>)}
                    </select>
                  </label>
                  <label>
                    旅行类型
                    <select value={form.travelType} onChange={(event) => setForm({ ...form, travelType: event.target.value as TravelType })}>
                      {travelTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <label>
                    最喜欢的地点
                    <input value={form.favoritePlace} onChange={(event) => setForm({ ...form, favoritePlace: event.target.value })} />
                  </label>
                </div>
                <label className="field-block">
                  <span>一句话回忆</span>
                  <input value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
                </label>
                <label className="field-block">
                  <span>详细旅行故事</span>
                  <textarea value={form.story} onChange={(event) => setForm({ ...form, story: event.target.value })} />
                </label>
                <div className="chips">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      className={form.moodTags.includes(mood) ? "chip selected" : "chip"}
                      onClick={() =>
                        setForm({
                          ...form,
                          moodTags: form.moodTags.includes(mood)
                            ? form.moodTags.filter((tag) => tag !== mood)
                            : [...form.moodTags, mood],
                        })
                      }
                    >
                      {mood}
                    </button>
                  ))}
                </div>
                <label className="upload-box">
                  <Camera size={18} />
                  {form.photo ? "已添加照片，可重新选择" : "上传旅行照片，本地压缩保存"}
                  <input type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={form.revisit} onChange={(event) => setForm({ ...form, revisit: event.target.checked })} />
                  愿意再次前往
                </label>
                {error && <p className="form-error">{error}</p>}
                <button type="button" className="primary-btn full" onClick={submitRecord}>
                  保存足迹
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

function getRecordPhotos(record: TravelRecord) {
  return record.photos?.length ? record.photos : record.photo ? [record.photo] : [];
}

function formatRecordTime(record: TravelRecord) {
  if (record.arrivalDate && record.departureDate) return `${record.arrivalDate} - ${record.departureDate}`;
  if (record.arrivalDate) return record.arrivalDate;
  return "日期待补充";
}
