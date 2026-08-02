import { AnimatePresence, motion } from "framer-motion";
import { Plane, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { countriesById } from "./data/countries";
import { emptyData } from "./data/demo";
import { AchievementsPage } from "./components/AchievementsPage";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CountryDrawer } from "./components/CountryDrawer";
import { MemoriesPage } from "./components/MemoriesPage";
import { ProfilePage } from "./components/ProfilePage";
import { RoutesPage } from "./components/RoutesPage";
import { Shell, type TabKey } from "./components/Shell";
import { WorldPage } from "./components/WorldPage";
import { loadTravelData, saveTravelData } from "./utils/storage";
import type { Country, CountryStatus, TravelAppData, TravelRecord } from "./types";

export default function App() {
  const [data, setData] = useState<TravelAppData>(() => loadTravelData());
  const [activeTab, setActiveTab] = useState<TabKey>("world");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [toast, setToast] = useState("");
  const [pendingDelete, setPendingDelete] = useState<TravelRecord | "all" | "states" | null>(null);
  const hasIntro = data.hasSeenIntro;

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
    saveTravelData(data);
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2100);
    return () => window.clearTimeout(id);
  }, [toast]);

  const selectedState = selectedCountry ? data.countryStates[selectedCountry.id] : undefined;
  const drawerRecords = useMemo(() => data.records, [data.records]);

  function updateData(next: TravelAppData) {
    setData(next);
  }

  function showToast(message: string) {
    setToast(message);
  }

  function setCountryStatus(countryId: string, status: CountryStatus) {
    setData((current) => {
      const previous = current.countryStates[countryId];
      const countryRecords = current.records.filter((record) => record.countryId === countryId);
      const visitCount = status === "visited" ? Math.max(previous?.visitCount ?? 0, countryRecords.length || 1) : 0;
      const dates = countryRecords.flatMap((record) => [record.arrivalDate, record.departureDate]).filter(Boolean).sort();
      return {
        ...current,
        countryStates: {
          ...current.countryStates,
          [countryId]: {
            ...previous,
            status,
            visitCount,
            firstVisitDate: dates[0],
            lastVisitDate: dates.at(-1),
          },
        },
      };
    });
    showToast(status === "visited" ? "国家已点亮" : status === "planned" ? "已加入计划" : "已取消点亮");
  }

  function setImpression(countryId: string, impression: string) {
    setData((current) => ({
      ...current,
      countryStates: {
        ...current.countryStates,
        [countryId]: {
          ...current.countryStates[countryId],
          status: current.countryStates[countryId]?.status ?? "unvisited",
          visitCount: current.countryStates[countryId]?.visitCount ?? 0,
          impression,
        },
      },
    }));
  }

  function saveRecord(record: TravelRecord) {
    setData((current) => {
      const exists = current.records.some((item) => item.id === record.id);
      const records = exists
        ? current.records.map((item) => (item.id === record.id ? record : item))
        : [record, ...current.records];
      const countryRecords = records.filter((item) => item.countryId === record.countryId);
      const dates = countryRecords.flatMap((item) => [item.arrivalDate, item.departureDate]).filter(Boolean).sort();
      return {
        ...current,
        records,
        countryStates: {
          ...current.countryStates,
          [record.countryId]: {
            ...current.countryStates[record.countryId],
            status: "visited",
            visitCount: countryRecords.length,
            firstVisitDate: dates[0],
            lastVisitDate: dates.at(-1),
          },
        },
      };
    });
    showToast("旅行记录已保存");
  }

  function deleteRecord(record: TravelRecord) {
    setData((current) => {
      const records = current.records.filter((item) => item.id !== record.id);
      const countryRecords = records.filter((item) => item.countryId === record.countryId);
      const dates = countryRecords.flatMap((item) => [item.arrivalDate, item.departureDate]).filter(Boolean).sort();
      return {
        ...current,
        records,
        countryStates: {
          ...current.countryStates,
          [record.countryId]: {
            ...current.countryStates[record.countryId],
            visitCount: countryRecords.length,
            status: countryRecords.length ? "visited" : current.countryStates[record.countryId]?.status ?? "unvisited",
            firstVisitDate: dates[0],
            lastVisitDate: dates.at(-1),
          },
        },
      };
    });
    showToast("旅行记录已删除");
  }

  function renderPage() {
    if (activeTab === "world") {
      return (
        <WorldPage
          data={data}
          selectedCountryId={selectedCountry?.id}
          onSelectCountry={setSelectedCountry}
          onSetStatus={setCountryStatus}
          onClearStates={() => setPendingDelete("states")}
        />
      );
    }
    if (activeTab === "memories") {
      return <MemoriesPage data={data} onOpenCountry={setSelectedCountry} onDeleteRecord={(record) => setPendingDelete(record)} />;
    }
    if (activeTab === "routes") {
      return (
        <RoutesPage
          data={data}
          onRouteVisibleChange={(visible) =>
            setData((current) => ({ ...current, settings: { ...current.settings, routeVisible: visible } }))
          }
        />
      );
    }
    if (activeTab === "achievements") {
      return <AchievementsPage data={data} onToast={showToast} />;
    }
    return (
      <ProfilePage
        data={data}
        onDataChange={updateData}
        onToast={showToast}
        onClearAll={() => setPendingDelete("all")}
        onSetStatus={setCountryStatus}
      />
    );
  }

  return (
    <div className="app-root">
      <AnimatePresence>
        {!hasIntro && (
          <motion.section className="intro-screen" exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <div className="orbit-map" aria-hidden="true">
              <span className="orbit-plane"><Plane size={22} /></span>
              <span className="orbit-star s1" />
              <span className="orbit-star s2" />
              <span className="orbit-star s3" />
              <div className="globe-outline">
                <span />
                <span />
                <span />
              </div>
            </div>
            <motion.div className="intro-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <span className="micro-label">My Journey Around the World</span>
              <h1>我的世界足迹</h1>
              <p>世界很大，而你的故事正在发生</p>
              <button
                className="primary-btn"
                onClick={() => setData((current) => ({ ...current, hasSeenIntro: true }))}
              >
                <Sparkles size={18} />
                开启我的旅程
              </button>
              <small>点亮你走过的每一个国家</small>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <Shell activeTab={activeTab} onTabChange={setActiveTab} toast={toast}>
        {renderPage()}
      </Shell>

      <CountryDrawer
        country={selectedCountry}
        state={selectedState}
        records={drawerRecords}
        onClose={() => setSelectedCountry(null)}
        onStatusChange={setCountryStatus}
        onImpressionChange={setImpression}
        onSaveRecord={saveRecord}
        onDeleteRecord={(record) => setPendingDelete(record)}
      />

      {pendingDelete && (
        <ConfirmDialog
          title={pendingDelete === "all" ? "清除全部数据？" : pendingDelete === "states" ? "清空旅行状态？" : "删除这条旅行记录？"}
          body={
            pendingDelete === "all"
              ? "这会移除本地浏览器中的足迹、照片、愿望和资料。"
              : pendingDelete === "states"
                ? "这会把所有国家恢复为尚未去过，旅行记录会保留。"
                : `将删除 ${countriesById[pendingDelete.countryId]?.nameZh ?? ""} · ${pendingDelete.cityName} 的记录。`
          }
          confirmText={pendingDelete === "all" ? "清除全部" : "确认"}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            if (pendingDelete === "all") {
              setData({ ...emptyData, hasSeenIntro: true });
              showToast("全部数据已清除");
            } else if (pendingDelete === "states") {
              setData((current) => ({ ...current, countryStates: {} }));
              showToast("旅行状态已清空");
            } else {
              deleteRecord(pendingDelete);
            }
            setPendingDelete(null);
          }}
        />
      )}

    </div>
  );
}
