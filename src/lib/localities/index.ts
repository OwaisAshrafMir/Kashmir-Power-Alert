export type DistrictLocalities = {
  district: string;
  localities: string[];
};

/** Code-level Kashmir locality index (not stored in DB). */
export const KASHMIR_LOCALITIES: DistrictLocalities[] = [
  {
    district: "Srinagar",
    localities: [
      "Lal Chowk",
      "Rajbagh",
      "Jawahar Nagar",
      "Karan Nagar",
      "Bemina",
      "Hyderpora",
      "Humhama",
      "Airport",
      "Sheikhpora",
      "Nadroo",
      "Jeelani Abad",
      "Co-operative Colony",
      "PHQ",
      "Zakura",
      "Burzhama",
      "Inderhama",
      "Danihama",
      "Rahbagh",
      "Gasoo",
      "Habak",
      "Soura",
      "Nowgam",
      "Pantha Chowk",
      "Dal Gate",
      "Boulevard",
      "Residency Road",
      "Amira Kadal",
      "Batamaloo",
      "Qamarwari",
      "Hawal",
      "Nowshera",
      "Khanyar",
      "Waganpora",
      "Takanwari",
      "Sangam",
      "Shanglipora",
      "Zoonimar",
      "Rainawari",
      "Nishat",
      "Shalimar",
      "Harwan",
    ],
  },
  {
    district: "Budgam",
    localities: [
      "Budgam",
      "Ompora",
      "Sabdan",
      "Nasrullahpora",
      "Jawalapora",
      "SIDCO Housing Colony",
      "NIFT",
      "Chadoora",
      "Charar-e-Sharief",
      "Beerwah",
      "Magam",
    ],
  },
  {
    district: "Pulwama",
    localities: [
      "Pulwama",
      "Awantipora",
      "Pampore",
      "Tral",
      "Kakapora",
      "Siamoh",
      "K-Koot",
      "Kiagam",
      "Hariparigam",
      "Chakoora",
      "Gulzarpora",
      "Panzgam",
      "Sangam",
    ],
  },
  {
    district: "Anantnag",
    localities: [
      "Anantnag",
      "Bijbehara",
      "Mattan",
      "Achabal",
      "Shangus",
      "Khundroo",
      "Cherpora",
      "Gopalpora",
      "Ashajipora",
      "Dialgam",
      "Wanpoh",
      "Malaknag",
    ],
  },
  {
    district: "Baramulla",
    localities: ["Baramulla", "Sopore", "Pattan", "Uri", "Tangmarg", "Gulmarg"],
  },
  {
    district: "Kupwara",
    localities: ["Kupwara", "Handwara", "Lolab", "Trehgam"],
  },
  {
    district: "Ganderbal",
    localities: ["Ganderbal", "Kangan", "Safapora", "Tullamulla"],
  },
  {
    district: "Kulgam",
    localities: ["Kulgam", "Qazigund", "Devsar", "Frisal"],
  },
  {
    district: "Shopian",
    localities: ["Shopian", "Keller", "Zainapora", "Imamsahib"],
  },
];

export const LOCALITY_ALIASES: Record<string, string> = {
  "hyder pora": "Hyderpora",
  hyderpora: "Hyderpora",
  "lalchowk": "Lal Chowk",
  "lal chowk": "Lal Chowk",
  "karan nagar": "Karan Nagar",
  karannagar: "Karan Nagar",
  "co operative colony": "Co-operative Colony",
  "cooperative colony": "Co-operative Colony",
  "sidco": "SIDCO Housing Colony",
  "k koot": "K-Koot",
  kkoot: "K-Koot",
  airport: "Airport",
  "srinagar airport": "Airport",
};

export function normalizeLocalityText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalLocalityName(value: string): string {
  const key = normalizeLocalityText(value);
  if (LOCALITY_ALIASES[key]) return LOCALITY_ALIASES[key];
  for (const district of KASHMIR_LOCALITIES) {
    const hit = district.localities.find((l) => normalizeLocalityText(l) === key);
    if (hit) return hit;
  }
  return value.trim();
}

export function getAllLocalities(): Array<{ district: string; locality: string }> {
  return KASHMIR_LOCALITIES.flatMap((d) =>
    d.localities.map((locality) => ({ district: d.district, locality }))
  );
}

export function getDistricts(): string[] {
  return KASHMIR_LOCALITIES.map((d) => d.district);
}

export function getLocalitiesForDistrict(district: string): string[] {
  return KASHMIR_LOCALITIES.find((d) => d.district === district)?.localities ?? [];
}

/** Returns true if notice localities overlap user localities (fuzzy). */
export function matchesUserArea(
  noticeLocalities: string[],
  userLocalities: string[]
): boolean {
  if (!userLocalities.length || !noticeLocalities.length) return false;

  const userNorm = userLocalities.map((l) => normalizeLocalityText(canonicalLocalityName(l)));
  const noticeNorm = noticeLocalities.map((l) => normalizeLocalityText(canonicalLocalityName(l)));

  for (const u of userNorm) {
    for (const n of noticeNorm) {
      if (!u || !n) continue;
      if (u === n) return true;
      if (u.includes(n) || n.includes(u)) return true;
      const uTokens = new Set(u.split(" ").filter((t) => t.length > 2));
      const nTokens = n.split(" ").filter((t) => t.length > 2);
      const overlap = nTokens.filter((t) => uTokens.has(t)).length;
      if (overlap >= 1 && (uTokens.size <= 2 || overlap / Math.min(uTokens.size, nTokens.length) >= 0.5)) {
        return true;
      }
    }
  }
  return false;
}
