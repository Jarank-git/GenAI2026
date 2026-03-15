export interface MockLifecycleData {
  product_id: string;
  product_name: string;
  carbon_kg_co2e: number;
  water_litres: number;
  packaging: Array<{ material: string; grams: number }>;
  land_use_m2: number;
  land_use_commodity: string;
  eutrophication_index: number;
}

export const mockLifecycleData: MockLifecycleData[] = [
  {
    product_id: "mock-barilla-spaghetti",
    product_name: "Barilla Spaghetti",
    carbon_kg_co2e: 0.9,
    water_litres: 800,
    packaging: [
      { material: "cardboard", grams: 45 },
      { material: "LDPE_4", grams: 5 },
    ],
    land_use_m2: 1.2,
    land_use_commodity: "wheat",
    eutrophication_index: 3.5,
  },
  {
    product_id: "mock-pc-organic-milk",
    product_name: "President's Choice Organic Milk 2%",
    carbon_kg_co2e: 3.2,
    water_litres: 2000,
    packaging: [{ material: "HDPE_2", grams: 65 }],
    land_use_m2: 8.5,
    land_use_commodity: "dairy",
    eutrophication_index: 5.0,
  },
  {
    product_id: "mock-kraft-peanut-butter",
    product_name: "Kraft Peanut Butter Smooth",
    carbon_kg_co2e: 1.5,
    water_litres: 3500,
    packaging: [
      { material: "PET_1", grams: 40 },
      { material: "PP_5", grams: 15 },
    ],
    land_use_m2: 4.0,
    land_use_commodity: "default",
    eutrophication_index: 2.5,
  },
  {
    product_id: "mock-seventh-gen-dish-soap",
    product_name: "Seventh Generation Dish Soap Free & Clear",
    carbon_kg_co2e: 0.6,
    water_litres: 200,
    packaging: [{ material: "HDPE_2", grams: 35 }],
    land_use_m2: 0.1,
    land_use_commodity: "default",
    eutrophication_index: 1.0,
  },
  {
    product_id: "mock-tide-pods",
    product_name: "Tide PODS Laundry Detergent Original",
    carbon_kg_co2e: 1.8,
    water_litres: 400,
    packaging: [
      { material: "PP_5", grams: 60 },
      { material: "LDPE_4", grams: 25 },
    ],
    land_use_m2: 0.2,
    land_use_commodity: "default",
    eutrophication_index: 4.5,
  },
  {
    product_id: "mock-dove-body-wash",
    product_name: "Dove Deep Moisture Body Wash",
    carbon_kg_co2e: 1.2,
    water_litres: 600,
    packaging: [
      { material: "PET_1", grams: 45 },
      { material: "PP_5", grams: 10 },
    ],
    land_use_m2: 2.0,
    land_use_commodity: "palm_oil",
    eutrophication_index: 2.0,
  },
  {
    product_id: "mock-gildan-tshirt",
    product_name: "Gildan Heavy Cotton T-Shirt",
    carbon_kg_co2e: 8.0,
    water_litres: 2700,
    packaging: [{ material: "LDPE_4", grams: 10 }],
    land_use_m2: 6.0,
    land_use_commodity: "cotton",
    eutrophication_index: 3.0,
  },
  {
    product_id: "mock-anker-usbc-cable",
    product_name: "Anker USB-C to USB-C Cable",
    carbon_kg_co2e: 2.5,
    water_litres: 50,
    packaging: [
      { material: "cardboard", grams: 30 },
      { material: "PET_1", grams: 15 },
    ],
    land_use_m2: 0.05,
    land_use_commodity: "default",
    eutrophication_index: 0.5,
  },
  {
    product_id: "mock-great-value-tomatoes",
    product_name: "Great Value Canned Diced Tomatoes",
    carbon_kg_co2e: 0.7,
    water_litres: 100,
    packaging: [
      { material: "aluminum", grams: 50 },
      { material: "cardboard", grams: 15 },
    ],
    land_use_m2: 0.8,
    land_use_commodity: "default",
    eutrophication_index: 2.0,
  },
  {
    product_id: "mock-quaker-oats",
    product_name: "Quaker Large Flake Oats",
    carbon_kg_co2e: 0.6,
    water_litres: 500,
    packaging: [
      { material: "cardboard", grams: 80 },
      { material: "LDPE_4", grams: 8 },
    ],
    land_use_m2: 1.5,
    land_use_commodity: "default",
    eutrophication_index: 2.5,
  },
];
