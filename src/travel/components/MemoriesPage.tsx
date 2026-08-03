import { Camera, Edit3, Plus, Trash2, X } from "lucide-react";
import { countriesById } from "../data/countries";
import type { Country, TravelAppData, TravelRecord } from "../types";

type MemoriesPageProps = {
  data: TravelAppData;
  selectedCountryId?: string | null;
  onClearCountryFilter: () => void;
  onAddRecord: () => void;
  onOpenCountry: (country: Country) => void;
  onDeleteRecord: (record: TravelRecord) => void;
};

export function MemoriesPage({
  data,
  selectedCountryId,
  onClearCountryFilter,
  onAddRecord,
  onOpenCountry,
  onDeleteRecord,
}: MemoriesPageProps) {
  const selectedCountry = selectedCountryId ? countriesById[selectedCountryId] : null;
  const allRecords = [...data.records].sort((a, b) =>
    (b.arrivalDate || b.createdAt).localeCompare(a.arrivalDate || a.createdAt),
  );
  const records = selectedCountryId
    ? allRecords.filter((record) => record.countryId === selectedCountryId)
    : allRecords;

  return (
    <div className="page">
      <header className="page-head">
        <span className="micro-label">Travel notebook</span>
        <h1>回忆手账</h1>
        <p>
          {selectedCountry
            ? `${selectedCountry.flag} ${selectedCountry.nameZh} 共 ${records.length} 条旅行记录`
            : "每一座城市都保存在本地浏览器里，照片不会上传到服务器。"}
        </p>
        <div className="memory-toolbar">
          {selectedCountry && (
            <button type="button" className="ghost-btn mini" onClick={onClearCountryFilter}>
              <X size={14} />
              全部回忆
            </button>
          )}
          <button type="button" className="small-action" onClick={onAddRecord}>
            <Plus size={16} />
            新增记录
          </button>
        </div>
      </header>
      {records.length === 0 ? (
        <div className="empty-state">
          <Plus size={26} />
          <p>{selectedCountry ? `${selectedCountry.nameZh} 还没有旅行记录。` : "你还没有旅行记录。"}</p>
          <button type="button" className="small-action" onClick={onAddRecord}>
            <Plus size={16} />
            新增旅行记录
          </button>
        </div>
      ) : (
        <div className="memory-list">
          {records.map((record) => {
            const country = countriesById[record.countryId];
            const photos = getRecordPhotos(record);
            return (
              <article key={record.id} className="memory-card rich">
                <div className="photo-box large">
                  {photos[0] ? <img src={photos[0]} alt={`${record.cityName}旅行照片`} /> : <Camera size={26} />}
                </div>
                <div className="memory-body">
                  <span className="stamp">{country?.flag} {country?.nameZh}</span>
                  <h2>{record.cityName}</h2>
                  <p>{formatRecordTime(record)} · {record.days ? `${record.days}天 · ` : ""}{record.transport}</p>
                  <strong>{record.summary}</strong>
                  <p>{record.story || "还没有写下详细故事。"}</p>
                  <div className="tag-row">{record.moodTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  {photos.length > 1 && (
                    <div className="photo-strip" aria-label={`${record.cityName}照片集`}>
                      {photos.slice(0, 6).map((photo, index) => (
                        <img key={photo} src={photo} alt={`${record.cityName}旅行照片 ${index + 1}`} />
                      ))}
                      {photos.length > 6 && <span>+{photos.length - 6}</span>}
                    </div>
                  )}
                </div>
                <div className="card-actions horizontal">
                  <button type="button" onClick={() => country && onOpenCountry(country)} title="编辑">
                    <Edit3 size={16} />
                  </button>
                  <button type="button" onClick={() => onDeleteRecord(record)} title="删除">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
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
