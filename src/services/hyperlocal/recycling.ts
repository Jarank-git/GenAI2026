interface RecyclingResult {
  accepted_materials: string[];
  source: string;
}

const CITY_RECYCLING: Record<string, RecyclingResult> = {
  toronto: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#3 PVC", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
    source: "City of Toronto Blue Bin program",
  },
  mississauga: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
    source: "Region of Peel Blue Box program",
  },
  ottawa: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
    source: "City of Ottawa Blue Box program",
  },
  calgary: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "cardboard", "aluminum", "steel", "paper"],
    source: "City of Calgary Blue Cart program",
  },
  vancouver: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#3 PVC", "#4 LDPE", "#5 PP", "#6 PS", "#7 Other", "glass", "cardboard", "aluminum", "steel", "paper", "cartons", "tetrapak", "styrofoam"],
    source: "Metro Vancouver Recycles program",
  },
  montreal: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#3 PVC", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
    source: "Ville de Montreal Recycling program",
  },
  winnipeg: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "cardboard", "aluminum", "steel", "paper"],
    source: "City of Winnipeg Recycling program",
  },
  halifax: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
    source: "Halifax Regional Municipality Recycling program",
  },
};

const PROVINCE_DEFAULTS: Record<string, RecyclingResult> = {
  ON: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper"],
    source: "Ontario Blue Box program (default)",
  },
  AB: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "cardboard", "aluminum", "steel", "paper"],
    source: "Alberta recycling (default)",
  },
  BC: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "#6 PS", "glass", "cardboard", "aluminum", "steel", "paper", "cartons"],
    source: "BC Recycles (default)",
  },
  QC: {
    accepted_materials: ["#1 PET", "#2 HDPE", "#4 LDPE", "#5 PP", "glass", "cardboard", "aluminum", "steel", "paper"],
    source: "Quebec recycling (default)",
  },
};

const FALLBACK: RecyclingResult = {
  accepted_materials: ["#1 PET", "#2 HDPE", "cardboard", "aluminum", "paper"],
  source: "Canadian recycling (general estimate)",
};

export async function getRecyclingCapabilities(
  _postalCode: string,
  city: string,
): Promise<RecyclingResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    return getRecyclingWithGemini(city, geminiApiKey);
  }

  const cityKey = city.toLowerCase().trim();
  if (CITY_RECYCLING[cityKey]) {
    return CITY_RECYCLING[cityKey];
  }

  return FALLBACK;
}

export async function getRecyclingForPostalCode(
  postalCode: string,
  city: string,
  province: string,
): Promise<RecyclingResult> {
  const cityKey = city.toLowerCase().trim();
  if (CITY_RECYCLING[cityKey]) {
    return CITY_RECYCLING[cityKey];
  }

  const provinceResult = PROVINCE_DEFAULTS[province.toUpperCase()];
  if (provinceResult) return provinceResult;

  return FALLBACK;
}

export function getRecyclingForProvince(province: string): RecyclingResult {
  return PROVINCE_DEFAULTS[province.toUpperCase()] ?? FALLBACK;
}

async function getRecyclingWithGemini(city: string, apiKey: string): Promise<RecyclingResult> {
  // TODO: Implement real Gemini API call to research municipal recycling capabilities
  // Prompt: "What materials does the recycling program in {city}, Canada accept?
  //  Specifically: #1-#7 plastics, glass, cardboard, aluminum, tetrapak, compostables"
  // For now, fall back to mock data
  console.warn(`Gemini recycling lookup not yet implemented for ${city}. Using mock data. API key present: ${!!apiKey}`);
  const cityKey = city.toLowerCase().trim();
  return CITY_RECYCLING[cityKey] ?? FALLBACK;
}
