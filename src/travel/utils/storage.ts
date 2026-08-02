import { initialTravelData } from "../data/demo";
import type { TravelAppData } from "../types";

const STORAGE_KEY = "my-world-footprints:v2";

export function loadTravelData(): TravelAppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialTravelData;
    const parsed = JSON.parse(raw) as TravelAppData;
    if (parsed?.version !== 1 || !parsed.profile || !parsed.countryStates) return initialTravelData;
    return parsed;
  } catch {
    return initialTravelData;
  }
}

export function saveTravelData(data: TravelAppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportJson(data: TravelAppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `我的世界足迹-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateImport(input: unknown): input is TravelAppData {
  const candidate = input as TravelAppData;
  return Boolean(
    candidate &&
      candidate.version === 1 &&
      candidate.profile?.nickname &&
      candidate.countryStates &&
      Array.isArray(candidate.records) &&
      Array.isArray(candidate.plans) &&
      candidate.settings,
  );
}
