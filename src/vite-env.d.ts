/// <reference types="vite/client" />

declare module "world-countries" {
  const countries: Array<{
    cca2: string;
    cca3: string;
    ccn3?: string;
    name: { common: string; official: string };
    capital?: string[];
    region: string;
    subregion?: string;
    latlng: [number, number];
    flag: string;
    translations?: Record<string, { common: string; official: string }>;
    maps?: { googleMaps?: string; openStreetMaps?: string };
    landlocked?: boolean;
  }>;
  export default countries;
}
