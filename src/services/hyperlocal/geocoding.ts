interface GeocodingResult {
  lat: number;
  lng: number;
  province: string;
  city: string;
}

const POSTAL_PREFIX_MAP: Record<string, GeocodingResult> = {
  M: { lat: 43.6532, lng: -79.3832, province: "ON", city: "Toronto" },
  L: { lat: 43.59, lng: -79.65, province: "ON", city: "Mississauga" },
  K: { lat: 45.4215, lng: -75.6972, province: "ON", city: "Ottawa" },
  N: { lat: 43.0096, lng: -81.2737, province: "ON", city: "London" },
  T: { lat: 51.0447, lng: -114.0719, province: "AB", city: "Calgary" },
  V: { lat: 49.2827, lng: -123.1207, province: "BC", city: "Vancouver" },
  H: { lat: 45.5017, lng: -73.5673, province: "QC", city: "Montreal" },
  G: { lat: 46.8139, lng: -71.2080, province: "QC", city: "Quebec City" },
  J: { lat: 45.5, lng: -73.4, province: "QC", city: "Longueuil" },
  R: { lat: 49.8951, lng: -97.1384, province: "MB", city: "Winnipeg" },
  S: { lat: 52.1332, lng: -106.6700, province: "SK", city: "Saskatoon" },
  E: { lat: 46.1351, lng: -66.6428, province: "NB", city: "Moncton" },
  B: { lat: 44.6488, lng: -63.5752, province: "NS", city: "Halifax" },
  C: { lat: 46.2382, lng: -63.1311, province: "PE", city: "Charlottetown" },
  A: { lat: 47.5615, lng: -52.7126, province: "NL", city: "St. John's" },
  P: { lat: 46.4917, lng: -80.9930, province: "ON", city: "Sudbury" },
};

const CANADIAN_POSTAL_REGEX = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export function validatePostalCode(postalCode: string): boolean {
  return CANADIAN_POSTAL_REGEX.test(postalCode.trim());
}

export async function geocodePostalCode(postalCode: string): Promise<GeocodingResult> {
  const cleaned = postalCode.trim().toUpperCase();

  if (!validatePostalCode(cleaned)) {
    throw new Error(`Invalid Canadian postal code format: ${postalCode}`);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    return geocodeWithGoogleMaps(cleaned, apiKey);
  }

  return geocodeFromMockData(cleaned);
}

function geocodeFromMockData(postalCode: string): GeocodingResult {
  const prefix = postalCode.charAt(0).toUpperCase();
  const result = POSTAL_PREFIX_MAP[prefix];

  if (!result) {
    return { lat: 43.6532, lng: -79.3832, province: "ON", city: "Toronto" };
  }

  return { ...result };
}

async function geocodeWithGoogleMaps(postalCode: string, apiKey: string): Promise<GeocodingResult> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postalCode)},Canada&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK" || !data.results?.length) {
    return geocodeFromMockData(postalCode);
  }

  const result = data.results[0];
  const location = result.geometry.location;

  let province = "";
  let city = "";

  for (const component of result.address_components) {
    if (component.types.includes("administrative_area_level_1")) {
      province = component.short_name;
    }
    if (component.types.includes("locality")) {
      city = component.long_name;
    }
  }

  return {
    lat: location.lat,
    lng: location.lng,
    province: province || geocodeFromMockData(postalCode).province,
    city: city || geocodeFromMockData(postalCode).city,
  };
}
