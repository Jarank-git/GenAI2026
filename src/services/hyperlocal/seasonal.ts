import seasonalData from "@/data/seasonal-produce.json";

const data = seasonalData as Record<string, Record<string, string[]>>;

export async function getSeasonalProduce(
  province: string,
  month?: number,
): Promise<string[]> {
  const currentMonth = month ?? new Date().getMonth() + 1;
  const provinceData = data[province.toUpperCase()];

  if (!provinceData) {
    return [];
  }

  return provinceData[String(currentMonth)] ?? [];
}

export async function isInSeason(
  productName: string,
  province: string,
  month?: number,
): Promise<boolean> {
  const produce = await getSeasonalProduce(province, month);
  const name = productName.toLowerCase();

  return produce.some((item) => {
    const itemLower = item.toLowerCase();
    return itemLower.includes(name) || name.includes(itemLower);
  });
}
