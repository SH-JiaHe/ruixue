import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
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

type LightboxState = {
  record: TravelRecord;
  country?: Country;
  photos: string[];
  index: number;
};

export function MemoriesPage({
  data,
  selectedCountryId,
  onClearCountryFilter,
  onAddRecord,
  onOpenCountry,
  onDeleteRecord,
}: MemoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const selectedCountry = selectedCountryId ? countriesById[selectedCountryId] : null;

  const baseRecords = useMemo(() => {
    const sortedRecords = [...data.records].sort((a, b) =>
      (b.arrivalDate || b.createdAt).localeCompare(a.arrivalDate || a.createdAt),
    );
    return selectedCountryId
      ? sortedRecords.filter((record) => record.countryId === selectedCountryId)
      : sortedRecords;
  }, [data.records, selectedCountryId]);

  const records = useMemo(() => {
    const normalizedQuery = normalizeSearch(searchQuery);
    if (!normalizedQuery) return baseRecords;
    return baseRecords.filter((record) => matchesRecord(record, normalizedQuery));
  }, [baseRecords, searchQuery]);

  function openPhoto(record: TravelRecord, country: Country | undefined, index: number) {
    const photos = getRecordPhotos(record);
    if (!photos.length) return;
    setLightbox({ record, country, photos, index: Math.min(index, photos.length - 1) });
  }

  return (
    <div className="page">
      <header className="page-head">
        <span className="micro-label">Travel notebook</span>
        <h1>回忆手账</h1>
        <p>
          {selectedCountry
            ? `${selectedCountry.flag} ${selectedCountry.nameZh} 共 ${records.length} 条旅行记录`
            : `共 ${records.length} 条旅行记录，照片保存在你的旅行素材里。`}
        </p>
        <div className="memory-tools">
          <div className="search-box memory-search" role="search">
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索城市、国家、故事、标签"
              aria-label="搜索手账"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} title="清空搜索">
                <X size={14} />
              </button>
            )}
          </div>
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
        </div>
      </header>
      {records.length === 0 ? (
        <div className="empty-state">
          <Plus size={26} />
          <p>
            {searchQuery
              ? "没有找到相关手账。"
              : selectedCountry
                ? `${selectedCountry.nameZh} 还没有旅行记录。`
                : "你还没有旅行记录。"}
          </p>
          {searchQuery ? (
            <button type="button" className="ghost-btn" onClick={() => setSearchQuery("")}>
              <X size={16} />
              清空搜索
            </button>
          ) : (
            <button type="button" className="small-action" onClick={onAddRecord}>
              <Plus size={16} />
              新增旅行记录
            </button>
          )}
        </div>
      ) : (
        <div className="memory-list">
          {records.map((record) => {
            const country = countriesById[record.countryId];
            const photos = getRecordPhotos(record);
            return (
              <article key={record.id} className="memory-card rich">
                {photos[0] ? (
                  <button
                    type="button"
                    className="photo-box large photo-button"
                    onClick={() => openPhoto(record, country, 0)}
                    aria-label={`查看${record.cityName}旅行照片大图`}
                  >
                    <img src={photos[0]} alt={`${record.cityName}旅行照片`} />
                  </button>
                ) : (
                  <div className="photo-box large">
                    <Camera size={26} />
                  </div>
                )}
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
                        <button
                          key={photo}
                          type="button"
                          className="photo-thumb-button"
                          onClick={() => openPhoto(record, country, index)}
                          aria-label={`查看${record.cityName}旅行照片 ${index + 1}`}
                        >
                          <img src={photo} alt={`${record.cityName}旅行照片 ${index + 1}`} />
                        </button>
                      ))}
                      {photos.length > 6 && (
                        <button
                          type="button"
                          className="photo-more-button"
                          onClick={() => openPhoto(record, country, 6)}
                          aria-label={`查看${record.cityName}更多旅行照片`}
                        >
                          +{photos.length - 6}
                        </button>
                      )}
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

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            lightbox={lightbox}
            onClose={() => setLightbox(null)}
            onMove={(direction) =>
              setLightbox((current) =>
                current
                  ? {
                      ...current,
                      index: (current.index + direction + current.photos.length) % current.photos.length,
                    }
                  : current,
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PhotoLightbox({
  lightbox,
  onClose,
  onMove,
}: {
  lightbox: LightboxState;
  onClose: () => void;
  onMove: (direction: number) => void;
}) {
  const photo = lightbox.photos[lightbox.index];
  const canMove = lightbox.photos.length > 1;

  return (
    <div className="modal-layer photo-lightbox-layer" role="dialog" aria-modal="true">
      <button className="lightbox-scrim" type="button" onClick={onClose} aria-label="关闭照片预览" />
      <motion.div
        className="photo-lightbox"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
      >
        <div className="lightbox-head">
          <div>
            <span className="stamp">{lightbox.country?.flag} {lightbox.country?.nameZh}</span>
            <strong>{lightbox.record.cityName}</strong>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="lightbox-image-wrap">
          {canMove && (
            <button type="button" className="lightbox-nav prev" onClick={() => onMove(-1)} title="上一张">
              <ChevronLeft size={24} />
            </button>
          )}
          <img src={photo} alt={`${lightbox.record.cityName}旅行照片 ${lightbox.index + 1}`} />
          {canMove && (
            <button type="button" className="lightbox-nav next" onClick={() => onMove(1)} title="下一张">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
        <div className="lightbox-foot">
          <span>{lightbox.index + 1} / {lightbox.photos.length}</span>
          <p>{lightbox.record.summary}</p>
        </div>
      </motion.div>
    </div>
  );
}

function matchesRecord(record: TravelRecord, normalizedQuery: string) {
  const country = countriesById[record.countryId];
  const searchableText = [
    country?.nameZh,
    country?.nameEn,
    country?.continent,
    country?.region,
    record.cityName,
    record.cityNameEn,
    record.arrivalDate,
    record.departureDate,
    record.companions,
    record.transport,
    record.travelType,
    record.favoritePlace,
    record.summary,
    record.story,
    ...record.moodTags,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeSearch(searchableText).includes(normalizedQuery);
}

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase();
}

function getRecordPhotos(record: TravelRecord) {
  return record.photos?.length ? record.photos : record.photo ? [record.photo] : [];
}

function formatRecordTime(record: TravelRecord) {
  if (record.arrivalDate && record.departureDate) return `${record.arrivalDate} - ${record.departureDate}`;
  if (record.arrivalDate) return record.arrivalDate;
  return "日期待补充";
}
