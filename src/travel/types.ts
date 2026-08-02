export type CountryStatus = "visited" | "planned" | "unvisited";

export type Continent =
  | "亚洲"
  | "欧洲"
  | "非洲"
  | "北美洲"
  | "南美洲"
  | "大洋洲"
  | "南极洲";

export type Country = {
  id: string;
  iso2: string;
  iso3: string;
  numericCode: string;
  nameZh: string;
  nameEn: string;
  continent: Continent;
  region: string;
  capital: string;
  mapNames: string[];
  flag: string;
  latlng: [number, number];
};

export type CountryTravelState = {
  status: CountryStatus;
  visitCount: number;
  firstVisitDate?: string;
  lastVisitDate?: string;
  impression?: string;
};

export type City = {
  id: string;
  countryId: string;
  nameZh: string;
  nameEn?: string;
};

export type TravelMemory = {
  id: string;
  text: string;
  photo?: string;
  photos?: string[];
  moodTags: string[];
};

export type TravelRecord = {
  id: string;
  countryId: string;
  cityName: string;
  cityNameEn?: string;
  arrivalDate: string;
  departureDate: string;
  days: number;
  companions: string;
  transport: TransportMode;
  travelType: TravelType;
  favoritePlace: string;
  summary: string;
  story: string;
  photo?: string;
  photos?: string[];
  moodTags: string[];
  revisit: boolean;
  createdAt: string;
};

export type TransportMode = "飞机" | "火车" | "自驾" | "轮船" | "巴士" | "步行" | "其他";
export type TravelType =
  | "自由行"
  | "跟团旅行"
  | "商务出行"
  | "留学生活"
  | "探亲访友"
  | "毕业旅行"
  | "蜜月旅行"
  | "独自旅行"
  | "其他";

export type TravelPlan = {
  id: string;
  countryId: string;
  cityName: string;
  plannedYear: string;
  reason: string;
  experiences: string;
  priority: "高" | "中" | "低";
  status: "想去" | "正在计划" | "已预订" | "已完成";
};

export type Achievement = {
  id: string;
  icon: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
};

export type UserProfile = {
  nickname: string;
  avatar?: string;
  tagline: string;
  homeCity?: string;
  favoriteCountry?: string;
  favoriteCity?: string;
  travelMotto: string;
};

export type PosterTheme = "星空蓝" | "护照复古" | "暖白旅行手记" | "落日橙" | "极简世界地图";

export type TravelStatistics = {
  visitedCountries: number;
  plannedCountries: number;
  unlockedContinents: number;
  cities: number;
  records: number;
  days: number;
  completion: number;
  continents: Array<{ name: Continent; visited: number; total: number }>;
};

export type AppSettings = {
  theme: "dark" | "light";
  routeVisible: boolean;
  globeAutoRotate: boolean;
};

export type TravelAppData = {
  version: 1;
  profile: UserProfile;
  countryStates: Record<string, CountryTravelState>;
  records: TravelRecord[];
  plans: TravelPlan[];
  settings: AppSettings;
  hasSeenIntro: boolean;
};
