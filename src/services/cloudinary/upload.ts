export async function uploadProductImage(
  imageFile: File
): Promise<{ url: string; asset_id: string }> {
  if (
    process.env.CLOUDINARY_API_KEY &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  ) {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "ecolens_products");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      console.warn(`Cloudinary upload failed (${res.status}), falling back to mock`);
    } else {
      const data = await res.json();
      return { url: data.secure_url, asset_id: data.asset_id };
    }
  }

  // Mock mode
  const mockId = `mock_${Date.now()}`;
  return {
    url: `https://placeholder.ecolens.dev/upload/${mockId}.jpg`,
    asset_id: mockId,
  };
}
