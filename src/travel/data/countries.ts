import worldCountries from "world-countries";
import type { Continent, Country } from "../types";

const continentNames: Record<string, Continent> = {
  Asia: "亚洲",
  Europe: "欧洲",
  Africa: "非洲",
  Americas: "北美洲",
  Oceania: "大洋洲",
  Antarctic: "南极洲",
};

const southAmerica = new Set([
  "ARG",
  "BOL",
  "BRA",
  "CHL",
  "COL",
  "ECU",
  "FLK",
  "GUF",
  "GUY",
  "PRY",
  "PER",
  "SUR",
  "URY",
  "VEN",
]);

const specialZh: Record<string, string> = {
  USA: "美国",
  GBR: "英国",
  RUS: "俄罗斯",
  KOR: "韩国",
  PRK: "朝鲜",
  LAO: "老挝",
  VNM: "越南",
  IRN: "伊朗",
  SYR: "叙利亚",
  PSE: "巴勒斯坦",
  CZE: "捷克",
  COD: "刚果（金）",
  COG: "刚果（布）",
  AUS: "澳大利亚",
  NZL: "新西兰",
};

export const CONTINENTS: Continent[] = ["亚洲", "欧洲", "非洲", "北美洲", "南美洲", "大洋洲", "南极洲"];

export const countries: Country[] = worldCountries
  .filter((country) => country.cca3 && country.ccn3)
  .map((country) => {
    const iso3 = country.cca3;
    const isSouthAmerica = southAmerica.has(iso3);
    const continent = isSouthAmerica ? "南美洲" : continentNames[country.region] ?? "北美洲";
    const nameZh = specialZh[iso3] ?? country.translations?.zho?.common ?? country.name.common;
    const numericCode = String(country.ccn3).padStart(3, "0");

    return {
      id: iso3,
      iso2: country.cca2,
      iso3,
      numericCode,
      nameZh,
      nameEn: country.name.common,
      continent,
      region: country.subregion ?? country.region,
      capital: country.capital?.[0] ?? "暂无首都数据",
      mapNames: [country.name.common, country.name.official, nameZh, iso3, numericCode],
      flag: country.flag,
      latlng: country.latlng,
    };
  })
  .sort((a, b) => a.nameZh.localeCompare(b.nameZh, "zh-Hans-CN"));

export const countriesById = Object.fromEntries(countries.map((country) => [country.id, country])) as Record<
  string,
  Country
>;

export const countriesByNumericCode = Object.fromEntries(
  countries.map((country) => [String(Number(country.numericCode)), country]),
) as Record<string, Country>;

export const mapNameAliases: Record<string, string> = countries.reduce<Record<string, string>>((acc, country) => {
  country.mapNames.forEach((name) => {
    acc[name.toLowerCase()] = country.id;
  });
  return acc;
}, {});

export function findCountryByMapFeature(feature: any): Country | undefined {
  const id = String(feature?.id ?? "").replace(/^0+/, "");
  const fromNumeric = countriesByNumericCode[id];
  if (fromNumeric) return fromNumeric;

  const candidates = [
    feature?.properties?.name,
    feature?.properties?.NAME,
    feature?.properties?.ADMIN,
    feature?.properties?.NAME_EN,
  ].filter(Boolean);
  for (const candidate of candidates) {
    const mapped = mapNameAliases[String(candidate).toLowerCase()];
    if (mapped) return countriesById[mapped];
  }
  return undefined;
}
