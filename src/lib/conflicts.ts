// Current world conflicts data (2024-2025)
// Coordinates are { lat, lng } in degrees.
// Intensity ranges from 1 (low) to 10 (extreme).

export interface Conflict {
  id: string
  name: string          // Chinese name
  nameEn: string        // English name
  region: string        // Region / country
  regionEn: string
  lat: number
  lng: number
  intensity: number     // 1..10
  started: string       // start year or date
  casualties: string    // human-readable figure
  displaced: string     // displaced population
  summary: string       // short Chinese summary
  summaryEn: string
}

export const CONFLICTS: Conflict[] = [
  {
    id: 'ukraine',
    name: '俄乌战争',
    nameEn: 'Russia–Ukraine War',
    region: '乌克兰',
    regionEn: 'Ukraine',
    lat: 49.0,
    lng: 32.0,
    intensity: 10,
    started: '2022',
    casualties: '> 50万伤亡',
    displaced: '~ 1100万流离失所',
    summary: '自2022年2月爆发以来，欧洲自二战以来最大规模武装冲突仍在持续，前线炮火连天，平民承受巨大痛苦。',
    summaryEn:
      'The largest armed conflict in Europe since WWII, ongoing since February 2022, with heavy civilian suffering.',
  },
  {
    id: 'gaza',
    name: '加沙冲突',
    nameEn: 'Gaza Conflict',
    region: '加沙地带',
    regionEn: 'Gaza Strip',
    lat: 31.5,
    lng: 34.47,
    intensity: 10,
    started: '2023',
    casualties: '> 4.5万死亡',
    displaced: '~ 190万人流离失所',
    summary: '自2023年10月起，加沙地带遭遇毁灭性轰炸，人道主义危机深重，大量儿童与平民伤亡。',
    summaryEn:
      'Devastating bombing campaign since October 2023, with severe humanitarian crisis and mass civilian casualties.',
  },
  {
    id: 'sudan',
    name: '苏丹内战',
    nameEn: 'Sudan Civil War',
    region: '苏丹',
    regionEn: 'Sudan',
    lat: 15.5,
    lng: 32.5,
    intensity: 9,
    started: '2023',
    casualties: '> 15万死亡',
    displaced: '~ 1000万人流离失所',
    summary: '2023年4月起，苏丹武装部队与快速支援部队爆发激烈冲突，造成全球最大流离失所危机之一。',
    summaryEn:
      'Since April 2023, fighting between SAF and RSF has created one of the world\'s largest displacement crises.',
  },
  {
    id: 'myanmar',
    name: '缅甸内战',
    nameEn: 'Myanmar Civil War',
    region: '缅甸',
    regionEn: 'Myanmar',
    lat: 21.0,
    lng: 96.0,
    intensity: 8,
    started: '2021',
    casualties: '> 5万死亡',
    displaced: '~ 300万人流离失所',
    summary: '2021年军事政变后，缅甸陷入全面内战，少数民族武装与军政府在全国多地激烈交火。',
    summaryEn:
      'Since the 2021 coup, Myanmar is in full-scale civil war with ethnic armed groups fighting the junta.',
  },
  {
    id: 'syria',
    name: '叙利亚冲突',
    nameEn: 'Syrian Conflict',
    region: '叙利亚',
    regionEn: 'Syria',
    lat: 35.0,
    lng: 38.5,
    intensity: 7,
    started: '2011',
    casualties: '> 60万死亡',
    displaced: '~ 680万人流离失所',
    summary: '持续超过十年的叙利亚内战仍未平息，多个外部势力介入，平民长期遭受战火折磨。',
    summaryEn:
      'Over a decade of civil war with multiple foreign interventions, civilians enduring prolonged suffering.',
  },
  {
    id: 'yemen',
    name: '也门内战',
    nameEn: 'Yemen Civil War',
    region: '也门',
    regionEn: 'Yemen',
    lat: 15.5,
    lng: 44.2,
    intensity: 7,
    started: '2014',
    casualties: '> 37万死亡',
    displaced: '~ 450万人流离失所',
    summary: '也门内战已持续逾十年，胡塞武装与政府军对峙，红海局势升级进一步威胁地区和平。',
    summaryEn:
      'Yemen civil war has lasted over a decade; Red Sea escalation further threatens regional peace.',
  },
  {
    id: 'drc',
    name: '刚果东部冲突',
    nameEn: 'DRC Eastern Conflict',
    region: '刚果民主共和国',
    regionEn: 'DR Congo',
    lat: -1.5,
    lng: 29.2,
    intensity: 7,
    started: '2022',
    casualties: '> 数万死亡',
    displaced: '~ 700万人流离失所',
    summary: 'M23等武装组织在刚果东部持续扩张，引发严重人道主义危机，地区冲突不断升级。',
    summaryEn:
      'M23 and other armed groups continue to expand in eastern DRC, causing severe humanitarian crisis.',
  },
  {
    id: 'sahel',
    name: '萨赫勒地区冲突',
    nameEn: 'Sahel Conflict',
    region: '萨赫勒',
    regionEn: 'Sahel',
    lat: 14.5,
    lng: 0.0,
    intensity: 6,
    started: '2012',
    casualties: '> 数万死亡',
    displaced: '~ 300万人流离失所',
    summary: '萨赫勒地区极端武装活动持续，多个国家军政府上台，反恐形势日益严峻。',
    summaryEn:
      'Persistent extremist activity in the Sahel, with multiple military coups and worsening security.',
  },
  {
    id: 'haiti',
    name: '海地帮派冲突',
    nameEn: 'Haiti Gang Crisis',
    region: '海地',
    regionEn: 'Haiti',
    lat: 18.5,
    lng: -72.3,
    intensity: 6,
    started: '2021',
    casualties: '> 1.2万死亡',
    displaced: '~ 70万人流离失所',
    summary: '海地首都太子港几乎完全被武装帮派控制，国家陷入严重的人道与安全危机。',
    summaryEn:
      'Port-au-Prince is largely controlled by armed gangs; the country faces severe humanitarian crisis.',
  },
  {
    id: 'somalia',
    name: '索马里冲突',
    nameEn: 'Somalia Conflict',
    region: '索马里',
    regionEn: 'Somalia',
    lat: 5.15,
    lng: 46.2,
    intensity: 6,
    started: '2006',
    casualties: '> 数万死亡',
    displaced: '~ 390万人流离失所',
    summary: '青年党武装持续发动袭击，索马里政府军在非盟支持下进行长期反恐作战。',
    summaryEn:
      'Al-Shabaab continues attacks; Somali forces with AU support conduct long-term counter-terrorism.',
  },
]

export const PEACE_STATS = {
  activeConflicts: CONFLICTS.length,
  totalCasualties: '数百万',
  totalDisplaced: '~ 1.2亿人',
  childrenAffected: '~ 4.5亿儿童生活在冲突地区',
}
