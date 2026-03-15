import type { FactorScores } from "@/types/scoring";

export interface MockSustainabilityData {
  product_id: string;
  product_name: string;
  origin_country: string;
  transport_mode: "ship" | "truck" | "air" | "rail";
  transport_distance_km: number;
  packaging_materials: string[];
  certifications: string[];
  brand_practices: string;
  production_method: string;
  factors: FactorScores;
}

export const mockSustainabilityData: MockSustainabilityData[] = [
  {
    product_id: "mock-barilla-spaghetti",
    product_name: "Barilla Spaghetti",
    origin_country: "Italy",
    transport_mode: "ship",
    transport_distance_km: 7000,
    packaging_materials: ["cardboard", "plastic wrap"],
    certifications: [],
    brand_practices:
      "Large-scale conventional pasta manufacturer. Some sustainability commitments but limited third-party verification.",
    production_method: "Conventional industrial milling and extrusion",
    factors: {
      transport: 45,
      packaging: 65,
      certifications: 30,
      brand_ethics: 55,
      production: 50,
      end_of_life: 60,
    },
  },
  {
    product_id: "mock-pc-organic-milk",
    product_name: "President's Choice Organic Milk 2%",
    origin_country: "Canada",
    transport_mode: "truck",
    transport_distance_km: 200,
    packaging_materials: ["#2 HDPE plastic jug"],
    certifications: ["Canada Organic", "COR"],
    brand_practices:
      "Loblaw private label with Canadian organic sourcing. Supports local dairy farmers.",
    production_method: "Organic pasture-raised dairy farming",
    factors: {
      transport: 90,
      packaging: 40,
      certifications: 85,
      brand_ethics: 60,
      production: 70,
      end_of_life: 35,
    },
  },
  {
    product_id: "mock-kraft-peanut-butter",
    product_name: "Kraft Peanut Butter Smooth",
    origin_country: "Canada",
    transport_mode: "truck",
    transport_distance_km: 500,
    packaging_materials: ["glass jar", "metal lid"],
    certifications: [],
    brand_practices:
      "Kraft Heinz Canada. Large multinational with mixed sustainability record. Peanuts sourced from USA/Canada.",
    production_method: "Conventional roasting and grinding",
    factors: {
      transport: 80,
      packaging: 70,
      certifications: 25,
      brand_ethics: 45,
      production: 55,
      end_of_life: 75,
    },
  },
  {
    product_id: "mock-great-value-tomatoes",
    product_name: "Great Value Canned Diced Tomatoes",
    origin_country: "USA",
    transport_mode: "truck",
    transport_distance_km: 1500,
    packaging_materials: ["steel can", "BPA-free lining"],
    certifications: [],
    brand_practices:
      "Walmart private label. High volume, cost-focused supply chain with limited transparency.",
    production_method: "Conventional farming, industrial canning",
    factors: {
      transport: 70,
      packaging: 75,
      certifications: 20,
      brand_ethics: 35,
      production: 45,
      end_of_life: 80,
    },
  },
  {
    product_id: "mock-quaker-oats",
    product_name: "Quaker Large Flake Oats",
    origin_country: "Canada",
    transport_mode: "truck",
    transport_distance_km: 400,
    packaging_materials: ["cardboard canister", "plastic lid", "paper liner"],
    certifications: ["Whole Grain Council"],
    brand_practices:
      "PepsiCo subsidiary. Canadian oat sourcing from Saskatchewan. Moderate sustainability commitments.",
    production_method: "Conventional oat milling, steaming and flaking",
    factors: {
      transport: 85,
      packaging: 60,
      certifications: 40,
      brand_ethics: 50,
      production: 65,
      end_of_life: 55,
    },
  },
  {
    product_id: "mock-seventh-gen-dish-soap",
    product_name: "Seventh Generation Dish Soap Free & Clear",
    origin_country: "USA",
    transport_mode: "truck",
    transport_distance_km: 800,
    packaging_materials: ["#2 HDPE bottle"],
    certifications: ["B Corp", "EPA Safer Choice", "USDA BioPreferred"],
    brand_practices:
      "Certified B Corp with strong sustainability mission. Transparent ingredient disclosure. Owned by Unilever.",
    production_method: "Plant-based formula, lower-impact manufacturing",
    factors: {
      transport: 75,
      packaging: 80,
      certifications: 90,
      brand_ethics: 85,
      production: 75,
      end_of_life: 80,
    },
  },
  {
    product_id: "mock-tide-pods",
    product_name: "Tide PODS Laundry Detergent Original",
    origin_country: "USA",
    transport_mode: "truck",
    transport_distance_km: 900,
    packaging_materials: ["#5 PP tub", "PVA film pods"],
    certifications: [],
    brand_practices:
      "P&G brand. Large environmental footprint but investing in sustainability goals. Conventional chemical formulation.",
    production_method: "Conventional petrochemical-based detergent manufacturing",
    factors: {
      transport: 72,
      packaging: 35,
      certifications: 15,
      brand_ethics: 40,
      production: 30,
      end_of_life: 25,
    },
  },
  {
    product_id: "mock-dove-body-wash",
    product_name: "Dove Deep Moisture Body Wash",
    origin_country: "USA",
    transport_mode: "truck",
    transport_distance_km: 700,
    packaging_materials: ["#1 PET bottle"],
    certifications: ["PETA Cruelty-Free"],
    brand_practices:
      "Unilever brand. Committed to 100% recyclable packaging by 2025. Real Beauty campaign. Palm oil sourcing concerns.",
    production_method: "Conventional personal care manufacturing",
    factors: {
      transport: 76,
      packaging: 55,
      certifications: 45,
      brand_ethics: 55,
      production: 50,
      end_of_life: 50,
    },
  },
  {
    product_id: "mock-gildan-tshirt",
    product_name: "Gildan Heavy Cotton T-Shirt",
    origin_country: "Honduras",
    transport_mode: "ship",
    transport_distance_km: 4500,
    packaging_materials: ["#4 LDPE polybag"],
    certifications: [],
    brand_practices:
      "Canadian HQ, Central American manufacturing. Past labor controversy. Published ESG reports. Conventional cotton supply chain.",
    production_method: "Conventional cotton farming, industrial textile manufacturing",
    factors: {
      transport: 50,
      packaging: 30,
      certifications: 15,
      brand_ethics: 30,
      production: 25,
      end_of_life: 20,
    },
  },
  {
    product_id: "mock-anker-usbc-cable",
    product_name: "Anker USB-C to USB-C Cable",
    origin_country: "China",
    transport_mode: "ship",
    transport_distance_km: 10000,
    packaging_materials: ["cardboard box", "#4 LDPE bag", "paper insert"],
    certifications: [],
    brand_practices:
      "Chinese electronics brand. Limited sustainability reporting. Focus on durability and longevity reduces e-waste.",
    production_method: "Electronic component assembly, plastic extrusion",
    factors: {
      transport: 25,
      packaging: 50,
      certifications: 10,
      brand_ethics: 35,
      production: 30,
      end_of_life: 15,
    },
  },
];

export function getMockSustainabilityData(
  productId: string,
): MockSustainabilityData | null {
  return (
    mockSustainabilityData.find((d) => d.product_id === productId) ?? null
  );
}
