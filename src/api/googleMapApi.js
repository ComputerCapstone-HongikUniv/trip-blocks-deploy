export const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
export const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const GOOGLE_PHOTO_BASE_URL = "https://maps.googleapis.com/maps/api/place/photo";

export const getPhotoUrl = (photoReference, maxWidth = 400) => {
  if (!photoReference) return null;

  const params = new URLSearchParams({
    maxwidth: maxWidth.toString(),
    photo_reference: photoReference,
    key: API_KEY,
  });

  return `${GOOGLE_PHOTO_BASE_URL}?${params.toString()}`;
};