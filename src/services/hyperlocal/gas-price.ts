interface GasPriceResult {
  price_per_litre: number;
  source: string;
  last_updated: string;
}

const MOCK_GAS_PRICES: Record<string, GasPriceResult> = {
  ON: { price_per_litre: 1.65, source: "Mock — NRCan average Ontario", last_updated: "2026-03-14" },
  AB: { price_per_litre: 1.55, source: "Mock — NRCan average Alberta", last_updated: "2026-03-14" },
  BC: { price_per_litre: 1.85, source: "Mock — NRCan average British Columbia", last_updated: "2026-03-14" },
  QC: { price_per_litre: 1.72, source: "Mock — NRCan average Quebec", last_updated: "2026-03-14" },
  MB: { price_per_litre: 1.58, source: "Mock — NRCan average Manitoba", last_updated: "2026-03-14" },
  SK: { price_per_litre: 1.56, source: "Mock — NRCan average Saskatchewan", last_updated: "2026-03-14" },
  NB: { price_per_litre: 1.68, source: "Mock — NRCan average New Brunswick", last_updated: "2026-03-14" },
  NS: { price_per_litre: 1.70, source: "Mock — NRCan average Nova Scotia", last_updated: "2026-03-14" },
  PE: { price_per_litre: 1.69, source: "Mock — NRCan average Prince Edward Island", last_updated: "2026-03-14" },
  NL: { price_per_litre: 1.75, source: "Mock — NRCan average Newfoundland", last_updated: "2026-03-14" },
  NT: { price_per_litre: 1.82, source: "Mock — NRCan average Northwest Territories", last_updated: "2026-03-14" },
  YT: { price_per_litre: 1.78, source: "Mock — NRCan average Yukon", last_updated: "2026-03-14" },
  NU: { price_per_litre: 1.90, source: "Mock — NRCan average Nunavut", last_updated: "2026-03-14" },
};

const DEFAULT_GAS_PRICE: GasPriceResult = {
  price_per_litre: 1.65,
  source: "Mock — NRCan national average",
  last_updated: "2026-03-14",
};

export async function getGasPrice(province: string, _city?: string): Promise<GasPriceResult> {
  const nrcanEndpoint = process.env.NRCAN_GAS_PRICE_URL;

  if (nrcanEndpoint) {
    return fetchNrcanGasPrice(province, nrcanEndpoint);
  }

  return MOCK_GAS_PRICES[province.toUpperCase()] ?? DEFAULT_GAS_PRICE;
}

async function fetchNrcanGasPrice(province: string, endpoint: string): Promise<GasPriceResult> {
  try {
    const response = await fetch(`${endpoint}?province=${province}`);
    if (!response.ok) {
      return MOCK_GAS_PRICES[province.toUpperCase()] ?? DEFAULT_GAS_PRICE;
    }
    const data = await response.json();
    return {
      price_per_litre: data.price_per_litre,
      source: "NRCan fuel price data",
      last_updated: new Date().toISOString().split("T")[0],
    };
  } catch {
    return MOCK_GAS_PRICES[province.toUpperCase()] ?? DEFAULT_GAS_PRICE;
  }
}
