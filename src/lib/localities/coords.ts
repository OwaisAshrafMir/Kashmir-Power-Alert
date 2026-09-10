/** Approximate coordinates for Kashmir localities (WGS84). Used for nearest-match. */
export type LocalityCoord = {
  district: string;
  locality: string;
  lat: number;
  lng: number;
};

export const LOCALITY_COORDS: LocalityCoord[] = [
  { district: "Srinagar", locality: "Lal Chowk", lat: 34.071, lng: 74.809 },
  { district: "Srinagar", locality: "Rajbagh", lat: 34.065, lng: 74.827 },
  { district: "Srinagar", locality: "Jawahar Nagar", lat: 34.066, lng: 74.818 },
  { district: "Srinagar", locality: "Karan Nagar", lat: 34.078, lng: 74.8 },
  { district: "Srinagar", locality: "Bemina", lat: 34.08, lng: 74.76 },
  { district: "Srinagar", locality: "Hyderpora", lat: 34.036, lng: 74.8 },
  { district: "Srinagar", locality: "Humhama", lat: 33.995, lng: 74.78 },
  { district: "Srinagar", locality: "Airport", lat: 33.987, lng: 74.774 },
  { district: "Srinagar", locality: "Sheikhpora", lat: 34.01, lng: 74.77 },
  { district: "Srinagar", locality: "Zakura", lat: 34.14, lng: 74.84 },
  { district: "Srinagar", locality: "Burzhama", lat: 34.16, lng: 74.82 },
  { district: "Srinagar", locality: "Inderhama", lat: 34.15, lng: 74.83 },
  { district: "Srinagar", locality: "Habak", lat: 34.145, lng: 74.835 },
  { district: "Srinagar", locality: "Soura", lat: 34.135, lng: 74.825 },
  { district: "Srinagar", locality: "Nowgam", lat: 34.02, lng: 74.82 },
  { district: "Srinagar", locality: "Pantha Chowk", lat: 34.04, lng: 74.87 },
  { district: "Srinagar", locality: "Dal Gate", lat: 34.085, lng: 74.835 },
  { district: "Srinagar", locality: "Boulevard", lat: 34.09, lng: 74.85 },
  { district: "Srinagar", locality: "Batamaloo", lat: 34.08, lng: 74.79 },
  { district: "Srinagar", locality: "Qamarwari", lat: 34.09, lng: 74.78 },
  { district: "Srinagar", locality: "Hawal", lat: 34.1, lng: 74.82 },
  { district: "Srinagar", locality: "Khanyar", lat: 34.095, lng: 74.815 },
  { district: "Srinagar", locality: "Rainawari", lat: 34.1, lng: 74.83 },
  { district: "Srinagar", locality: "Nishat", lat: 34.125, lng: 74.875 },
  { district: "Srinagar", locality: "Shalimar", lat: 34.14, lng: 74.875 },
  { district: "Srinagar", locality: "Harwan", lat: 34.16, lng: 74.9 },
  { district: "Budgam", locality: "Budgam", lat: 34.015, lng: 74.72 },
  { district: "Budgam", locality: "Ompora", lat: 34.0, lng: 74.75 },
  { district: "Budgam", locality: "Chadoora", lat: 33.95, lng: 74.8 },
  { district: "Budgam", locality: "Beerwah", lat: 34.02, lng: 74.6 },
  { district: "Budgam", locality: "Magam", lat: 34.08, lng: 74.6 },
  { district: "Pulwama", locality: "Pulwama", lat: 33.87, lng: 74.9 },
  { district: "Pulwama", locality: "Awantipora", lat: 33.92, lng: 75.01 },
  { district: "Pulwama", locality: "Pampore", lat: 34.02, lng: 74.93 },
  { district: "Pulwama", locality: "Tral", lat: 33.93, lng: 75.1 },
  { district: "Anantnag", locality: "Anantnag", lat: 33.73, lng: 75.15 },
  { district: "Anantnag", locality: "Bijbehara", lat: 33.8, lng: 75.1 },
  { district: "Anantnag", locality: "Mattan", lat: 33.76, lng: 75.2 },
  { district: "Baramulla", locality: "Baramulla", lat: 34.2, lng: 74.35 },
  { district: "Baramulla", locality: "Sopore", lat: 34.29, lng: 74.47 },
  { district: "Baramulla", locality: "Pattan", lat: 34.16, lng: 74.56 },
  { district: "Baramulla", locality: "Gulmarg", lat: 34.05, lng: 74.38 },
  { district: "Kupwara", locality: "Kupwara", lat: 34.53, lng: 74.26 },
  { district: "Kupwara", locality: "Handwara", lat: 34.4, lng: 74.28 },
  { district: "Ganderbal", locality: "Ganderbal", lat: 34.23, lng: 74.78 },
  { district: "Ganderbal", locality: "Kangan", lat: 34.27, lng: 74.9 },
  { district: "Kulgam", locality: "Kulgam", lat: 33.64, lng: 75.02 },
  { district: "Kulgam", locality: "Qazigund", lat: 33.59, lng: 75.16 },
  { district: "Shopian", locality: "Shopian", lat: 33.72, lng: 74.83 },
];

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestLocality(lat: number, lng: number, maxKm = 25) {
  let best: LocalityCoord | null = null;
  let bestKm = Infinity;
  for (const c of LOCALITY_COORDS) {
    const km = haversineKm(lat, lng, c.lat, c.lng);
    if (km < bestKm) {
      bestKm = km;
      best = c;
    }
  }
  if (!best || bestKm > maxKm) return null;
  return { ...best, distanceKm: Math.round(bestKm * 10) / 10 };
}
