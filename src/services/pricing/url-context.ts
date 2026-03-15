export async function extractPriceFromURL(
  _productPageUrl: string
): Promise<number | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extract the current retail price from this product page URL: ${_productPageUrl}. Return ONLY the numeric price value (e.g., "4.99"). If no price is found, return "null".`,
                },
              ],
            },
          ],
          tools: [{ url_context: {} }],
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const priceMatch = text.match(/(\d+\.?\d*)/);
    if (!priceMatch) return null;

    const price = parseFloat(priceMatch[1]);
    return isNaN(price) || price <= 0 ? null : price;
  } catch {
    return null;
  }
}
