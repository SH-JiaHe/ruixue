import { CONTINENTS, countries, countriesById } from "../data/countries";
import type { Achievement, Continent, TravelAppData, TravelRecord, TravelStatistics } from "../types";

export function getStatistics(data: TravelAppData): TravelStatistics {
  const visitedIds = Object.entries(data.countryStates)
    .filter(([, state]) => state.status === "visited")
    .map(([id]) => id);
  const plannedCountries = Object.values(data.countryStates).filter((state) => state.status === "planned").length;
  const cityKeys = new Set(data.records.map((record) => `${record.countryId}:${record.cityName.trim().toLowerCase()}`));
  const visitedContinents = new Set<Continent>(
    visitedIds.map((id) => countriesById[id]?.continent).filter(Boolean) as Continent[],
  );

  return {
    visitedCountries: visitedIds.length,
    plannedCountries,
    unlockedContinents: visitedContinents.size,
    cities: cityKeys.size,
    records: data.records.length,
    days: data.records.reduce((sum, record) => sum + Number(record.days || 0), 0),
    completion: Math.round((visitedIds.length / countries.length) * 1000) / 10,
    continents: CONTINENTS.map((name) => {
      const total = countries.filter((country) => country.continent === name).length;
      const visited = visitedIds.filter((id) => countriesById[id]?.continent === name).length;
      return { name, total, visited };
    }),
  };
}

export function getSortedRecords(records: TravelRecord[]) {
  return [...records].sort((a, b) => (a.arrivalDate || a.createdAt).localeCompare(b.arrivalDate || b.createdAt));
}

export function getAchievements(data: TravelAppData): Achievement[] {
  const stats = getStatistics(data);
  const visitedByContinent = Object.fromEntries(stats.continents.map((item) => [item.name, item.visited])) as Record<
    Continent,
    number
  >;
  const photoCount = data.records.reduce((sum, record) => sum + (record.photos?.length ?? (record.photo ? 1 : 0)), 0);
  const islandIds = new Set(["SGP", "JPN", "AUS", "NZL", "ISL", "MDV", "LKA", "CYP", "MLT", "GBR"]);
  const visitedIslandCount = Object.entries(data.countryStates).filter(
    ([id, state]) => state.status === "visited" && islandIds.has(id),
  ).length;
  const revisitCountry = Object.values(data.countryStates).some((state) => state.visitCount >= 2);
  const soloTravel = data.records.some((record) => record.travelType === "独自旅行" || record.companions.includes("一个人"));
  const crossContinent = new Set(data.records.map((record) => countriesById[record.countryId]?.continent).filter(Boolean))
    .size;

  const definitions = [
    ["first", "Stamp", "第一次出发", "记录第一个国家", 1, stats.visitedCountries],
    ["city", "MapPin", "城市初体验", "记录第一座城市", 1, stats.cities],
    ["explorer", "Compass", "世界探索者", "点亮5个国家", 5, stats.visitedCountries],
    ["passport", "BookOpen", "护照收藏家", "点亮10个国家", 10, stats.visitedCountries],
    ["two-cont", "Route", "跨洲旅行者", "点亮2个大洲", 2, stats.unlockedContinents],
    ["three-cont", "Globe2", "三洲足迹", "点亮3个大洲", 3, stats.unlockedContinents],
    ["dreamer", "Sparkles", "环球梦想家", "点亮5个大洲", 5, stats.unlockedContinents],
    ["asia", "Sun", "亚洲探索者", "点亮5个亚洲国家", 5, visitedByContinent["亚洲"]],
    ["europe", "Landmark", "欧洲漫游者", "点亮5个欧洲国家", 5, visitedByContinent["欧洲"]],
    ["island", "Waves", "海岛旅行家", "记录3个岛屿国家", 3, visitedIslandCount],
    ["solo", "User", "一个人的远方", "记录一次独自旅行", 1, soloTravel ? 1 : 0],
    ["cross", "Plane", "跨越山海", "完成一次跨洲旅行", 2, crossContinent],
    ["memory", "NotebookPen", "回忆记录者", "创建10条旅行记录", 10, stats.records],
    ["camera", "Camera", "镜头里的世界", "收集10张旅行图片", 10, photoCount],
    ["return", "RefreshCcw", "故地重游", "同一国家到访2次以上", 1, revisitCountry ? 1 : 0],
    ["collector", "Trophy", "世界收藏家", "点亮50个国家和地区", 50, stats.visitedCountries],
  ] as const;

  return definitions.map(([id, icon, name, description, target, progress]) => ({
    id,
    icon,
    name,
    description,
    target,
    progress: Math.min(progress, target),
    unlocked: progress >= target,
    unlockedAt: progress >= target ? new Date().toISOString().slice(0, 10) : undefined,
  }));
}

export function generateTravelSentence(data: TravelAppData) {
  const stats = getStatistics(data);
  const favoriteContinent = [...stats.continents].sort((a, b) => b.visited - a.visited)[0]?.name ?? "世界";
  if (stats.records === 0) return "你的下一段旅程，会从世界的哪一个角落开始？";
  return `你已经跨越${stats.unlockedContinents}个大洲，把${stats.cities}座城市写进自己的故事。${favoriteContinent}的光影正在你的地图上慢慢亮起。`;
}
