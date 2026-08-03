import type { TravelAppData, TravelRecord } from "../types";

type ImportedCity = {
  countryId: string;
  countryName: string;
  cityName: string;
  cityNameEn: string;
  countrySlug: string;
  citySlug: string;
  photoCount: number;
};

const MEDIA_BASE = "https://cdn.jsdelivr.net/gh/SH-JiaHe/ruixue@main/public/travel-media";

const importedCities: ImportedCity[] = [
  { countryId: "CHN", countryName: "中国", cityName: "上海", cityNameEn: "Shanghai", countrySlug: "china", citySlug: "shanghai", photoCount: 3 },
  { countryId: "CHN", countryName: "中国", cityName: "北京", cityNameEn: "Beijing", countrySlug: "china", citySlug: "beijing", photoCount: 9 },
  { countryId: "CHN", countryName: "中国", cityName: "南京", cityNameEn: "Nanjing", countrySlug: "china", citySlug: "nanjing", photoCount: 5 },
  { countryId: "CHN", countryName: "中国", cityName: "开封", cityNameEn: "Kaifeng", countrySlug: "china", citySlug: "kaifeng", photoCount: 4 },
  { countryId: "CHN", countryName: "中国", cityName: "杭州", cityNameEn: "Hangzhou", countrySlug: "china", citySlug: "hangzhou", photoCount: 7 },
  { countryId: "CHN", countryName: "中国", cityName: "武汉", cityNameEn: "Wuhan", countrySlug: "china", citySlug: "wuhan", photoCount: 2 },
  { countryId: "CHN", countryName: "中国", cityName: "沈阳", cityNameEn: "Shenyang", countrySlug: "china", citySlug: "shenyang", photoCount: 2 },
  { countryId: "CHN", countryName: "中国", cityName: "洛阳", cityNameEn: "Luoyang", countrySlug: "china", citySlug: "luoyang", photoCount: 8 },
  { countryId: "CHN", countryName: "中国", cityName: "深圳", cityNameEn: "Shenzhen", countrySlug: "china", citySlug: "shenzhen", photoCount: 2 },
  { countryId: "CHN", countryName: "中国", cityName: "西安", cityNameEn: "Xi'an", countrySlug: "china", citySlug: "xian", photoCount: 3 },
  { countryId: "CHN", countryName: "中国", cityName: "重庆", cityNameEn: "Chongqing", countrySlug: "china", citySlug: "chongqing", photoCount: 3 },
  { countryId: "CHN", countryName: "中国", cityName: "长沙", cityNameEn: "Changsha", countrySlug: "china", citySlug: "changsha", photoCount: 2 },
  { countryId: "CHN", countryName: "中国", cityName: "青岛", cityNameEn: "Qingdao", countrySlug: "china", citySlug: "qingdao", photoCount: 3 },
  { countryId: "JPN", countryName: "日本", cityName: "东京", cityNameEn: "Tokyo", countrySlug: "japan", citySlug: "tokyo", photoCount: 30 },
  { countryId: "JPN", countryName: "日本", cityName: "京都", cityNameEn: "Kyoto", countrySlug: "japan", citySlug: "kyoto", photoCount: 9 },
  { countryId: "JPN", countryName: "日本", cityName: "大阪", cityNameEn: "Osaka", countrySlug: "japan", citySlug: "osaka", photoCount: 14 },
  { countryId: "JPN", countryName: "日本", cityName: "奈良", cityNameEn: "Nara", countrySlug: "japan", citySlug: "nara", photoCount: 6 },
  { countryId: "SGP", countryName: "新加坡", cityName: "新加坡", cityNameEn: "Singapore", countrySlug: "singapore", citySlug: "singapore", photoCount: 4 },
  { countryId: "MYS", countryName: "马来西亚", cityName: "亚庇", cityNameEn: "Kota Kinabalu", countrySlug: "malaysia", citySlug: "kota-kinabalu", photoCount: 8 },
  { countryId: "MYS", countryName: "马来西亚", cityName: "吉隆坡", cityNameEn: "Kuala Lumpur", countrySlug: "malaysia", citySlug: "kuala-lumpur", photoCount: 6 },
];

function photoSet(countrySlug: string, citySlug: string, count: number) {
  return Array.from(
    { length: count },
    (_, index) => `${MEDIA_BASE}/${countrySlug}/${citySlug}/${String(index + 1).padStart(2, "0")}.jpg`,
  );
}

const importedRecords: TravelRecord[] = importedCities.map((city) => {
  const photos = photoSet(city.countrySlug, city.citySlug, city.photoCount);
  return {
    id: `media-${city.countrySlug}-${city.citySlug}`,
    countryId: city.countryId,
    cityName: city.cityName,
    cityNameEn: city.cityNameEn,
    arrivalDate: "",
    departureDate: "",
    days: 0,
    companions: "",
    transport: "其他",
    travelType: "其他",
    favoritePlace: city.cityName,
    summary: `已导入 ${city.photoCount} 张 ${city.cityName} 旅行照片。`,
    story: "这条记录来自本地素材文件夹，行程日期、同行人和详细故事还没有补充。",
    photo: photos[0],
    photos,
    moodTags: ["真实素材", "待补充"],
    revisit: false,
    createdAt: "2026-08-03T00:00:00.000+08:00",
  };
});

const importedCountryStates: TravelAppData["countryStates"] = Object.fromEntries(
  Array.from(new Set(importedCities.map((city) => city.countryId))).map((countryId) => {
    const cities = importedCities.filter((city) => city.countryId === countryId);
    const photoCount = cities.reduce((sum, city) => sum + city.photoCount, 0);
    return [
      countryId,
      {
        status: "visited" as const,
        visitCount: cities.length,
        impression: `已从本地素材导入 ${cities.length} 座城市、${photoCount} 张照片，等待补充旅行日期和故事。`,
      },
    ];
  }),
);

export const emptyData: TravelAppData = {
  version: 1,
  profile: {
    nickname: "世界旅行者",
    avatar: `${MEDIA_BASE}/avatar.jpg`,
    tagline: "把每一次抵达，写成自己的经纬线",
    homeCity: "上海",
    favoriteCountry: "日本",
    favoriteCity: "京都",
    travelMotto: "世界很大，而我的故事正在发生",
  },
  countryStates: {},
  records: [],
  plans: [],
  settings: {
    theme: "dark",
    routeVisible: true,
    globeAutoRotate: true,
  },
  hasSeenIntro: false,
};

export const initialTravelData: TravelAppData = {
  ...emptyData,
  hasSeenIntro: true,
  countryStates: importedCountryStates,
  records: importedRecords,
  plans: [],
};

export const demoData = initialTravelData;

export const moods = ["真实素材", "待补充", "治愈", "热烈", "浪漫", "自由", "震撼", "难忘", "冒险", "想再去一次"];
export const transportModes = ["飞机", "火车", "自驾", "轮船", "巴士", "步行", "其他"] as const;
export const travelTypes = ["自由行", "跟团旅行", "商务出行", "留学生活", "探亲访友", "毕业旅行", "蜜月旅行", "独自旅行", "其他"] as const;
